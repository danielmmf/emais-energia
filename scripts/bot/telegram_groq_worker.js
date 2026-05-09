#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, '.planning', 'reports');
const STATE_FILE = path.join(REPORTS_DIR, 'telegram_worker_state.json');
const CONTEXT_FILE = path.join(ROOT, 'docs', 'consenso-mentores.md');

const DEFAULTS = {
  firebaseDbUrl: 'https://emais-energia-default-rtdb.firebaseio.com',
  repo: 'danielmmf/emais-energia',
  groqModel: 'llama-3.3-70b-versatile',
  pollTimeout: 20,
  maxContextChars: 16000
};

function ensureDirs() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
}

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function nowIso() {
  return new Date().toISOString();
}

function safeText(text, max = 2000) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      offset: 0,
      knownChats: [],
      startedAt: nowIso(),
      lastLoopAt: null,
      processedMessages: 0,
      lastError: null
    };
  }

  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    return {
      offset: 0,
      knownChats: [],
      startedAt: nowIso(),
      lastLoopAt: null,
      processedMessages: 0,
      lastError: `state_parse_error: ${err.message}`
    };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function apiFetch(url, options = {}) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} - ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getConfig() {
  return {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
    firebaseDbUrl: (process.env.FIREBASE_DATABASE_URL || DEFAULTS.firebaseDbUrl).replace(/\/$/, ''),
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || DEFAULTS.groqModel,
    repo: process.env.GITHUB_REPOSITORY || DEFAULTS.repo,
    pollTimeout: Number(process.env.TELEGRAM_POLL_TIMEOUT || DEFAULTS.pollTimeout),
    strictChatId: process.env.TELEGRAM_CHAT_ID || '',
    botName: process.env.TELEGRAM_BOT_NAME || 'Viabilidade Verde Bot'
  };
}

async function telegramApi(config, method, params = {}, usePost = false) {
  const endpoint = `https://api.telegram.org/bot${config.telegramToken}/${method}`;

  if (usePost) {
    const body = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      body.append(k, String(v));
    }
    return apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
  }

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    qs.append(k, String(v));
  }
  return apiFetch(`${endpoint}?${qs.toString()}`);
}

function encodeFbKey(key) {
  return String(key).replace(/[.#$\[\]\/]/g, '_');
}

async function firebaseWrite(config, nodePath, payload, method = 'POST') {
  if (!config.firebaseDbUrl) return;
  const url = `${config.firebaseDbUrl}/${nodePath}.json`;
  await apiFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function firebaseUpdate(config, nodePath, payload) {
  await firebaseWrite(config, nodePath, payload, 'PATCH');
}

function readContext() {
  const files = [
    '.planning/PROJECT.md',
    '.planning/STATE.md',
    '.planning/ROADMAP.md',
    'README.md',
    'docs/consenso-mentores.md'
  ];

  const chunks = [];
  for (const file of files) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    chunks.push(`### ${file}\n${content.slice(-5000)}`);
  }

  return chunks.join('\n\n').slice(-DEFAULTS.maxContextChars);
}

function appendConsensusLine(line) {
  const stamp = nowIso();
  const entry = `- ${stamp} ${line}\n`;
  fs.appendFileSync(CONTEXT_FILE, entry);
}

function createIssue(repo, title, body) {
  const args = ['issue', 'create', '--repo', repo, '--title', title, '--body', body, '--label', 'mentor-feedback'];
  const out = spawnSync('gh', args, { encoding: 'utf8' });
  if (out.status !== 0) {
    return { ok: false, error: safeText(out.stderr || out.stdout || 'unknown error', 500) };
  }
  return { ok: true, url: safeText(out.stdout, 500) };
}

async function askGroq(config, userText, contextSnippet) {
  if (!config.groqApiKey) {
    return 'Recebi sua mensagem. O GROQ_API_KEY ainda não está configurado no servidor, então registrei sua pergunta para o time responder.';
  }

  const prompt = [
    'Você é o bot oficial do projeto Viabilidade Verde.',
    'Responda em português do Brasil, de forma objetiva.',
    'Se a pergunta for de status, diga o que já foi feito e o que falta com base no contexto.',
    'Se houver sugestão de produto, trate como feedback e proponha próximo passo prático.',
    '',
    'Contexto do projeto:',
    contextSnippet,
    '',
    `Pergunta do mentor: ${userText}`
  ].join('\n');

  const payload = {
    model: config.groqModel,
    temperature: 0.2,
    max_tokens: 500,
    messages: [
      { role: 'system', content: 'Você apoia a execução do hackathon Viabilidade Verde.' },
      { role: 'user', content: prompt }
    ]
  };

  const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`
    },
    body: JSON.stringify(payload)
  });

  const content = resp?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Resposta vazia da Groq API');
  }

  return safeText(content, 3000);
}

function buildStatusMessage() {
  const statePath = path.join(ROOT, '.planning', 'STATE.md');
  if (!fs.existsSync(statePath)) {
    return 'Estado do projeto ainda não encontrado em .planning/STATE.md';
  }

  const data = fs.readFileSync(statePath, 'utf8');
  const phase = (data.match(/Phase:\s*([^\n]+)/i) || [null, 'n/d'])[1].trim();
  const status = (data.match(/Status:\s*([^\n]+)/i) || [null, 'n/d'])[1].trim();
  const progress = (data.match(/Progress:\s*([^\n]+)/i) || [null, 'n/d'])[1].trim();
  return `Status atual:\n- ${phase}\n- ${status}\n- ${progress}`;
}

async function sendTelegramMessage(config, chatId, text) {
  await telegramApi(config, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  }, true);
}

async function persistMessage(config, msg) {
  const chatKey = encodeFbKey(msg.chatId);
  const messageKey = encodeFbKey(msg.messageId);
  await firebaseWrite(config, `botChats/${chatKey}/messages/${messageKey}`, msg, 'PUT');
  await firebaseUpdate(config, `botChats/${chatKey}`, {
    chatId: msg.chatId,
    chatTitle: msg.chatTitle || null,
    chatType: msg.chatType || null,
    lastMessageAt: msg.timestamp,
    lastUser: msg.userName || null,
    lastText: safeText(msg.text, 220)
  });
  await firebaseWrite(config, 'botMessages', msg, 'POST');
}

async function processIncomingMessage(config, state, upd, contextSnippet) {
  const msg = upd.message || upd.edited_message || upd.channel_post;
  if (!msg) return;

  const text = safeText(msg.text || msg.caption || '', 3500);
  if (!text) return;

  const chatId = String(msg.chat?.id || '');
  if (!chatId) return;

  if (config.strictChatId && config.strictChatId !== chatId) return;

  const from = msg.from || {};
  const userName = from.username ? `@${from.username}` : safeText(from.first_name || 'anon', 80);

  const normalized = text.toLowerCase();
  const baseRecord = {
    updateId: upd.update_id,
    messageId: msg.message_id,
    chatId,
    chatType: msg.chat?.type || null,
    chatTitle: msg.chat?.title || null,
    userId: from.id || null,
    userName,
    text,
    timestamp: msg.date ? new Date(msg.date * 1000).toISOString() : nowIso(),
    receivedAt: nowIso(),
    source: 'telegram'
  };

  await persistMessage(config, baseRecord);

  if (!state.knownChats.includes(chatId)) {
    state.knownChats.push(chatId);
  }

  let reply = null;

  if (normalized.startsWith('/start')) {
    reply = `Olá, eu sou o ${config.botName}.\nPosso responder dúvidas sobre o projeto, registrar feedback e abrir issues com /issue.`;
  } else if (normalized.startsWith('/status')) {
    reply = buildStatusMessage();
  } else if (normalized.startsWith('/issue') || normalized.startsWith('issue:')) {
    const issueTitle = safeText(text.replace(/^\/issue\s*/i, '').replace(/^issue:\s*/i, ''), 120) || 'Feedback recebido via Telegram';
    const issueBody = [
      'Origem: Telegram bot worker',
      `Usuário: ${userName}`,
      `Chat ID: ${chatId}`,
      '',
      'Mensagem:',
      text
    ].join('\n');

    const issue = createIssue(config.repo, issueTitle, issueBody);
    if (issue.ok) {
      reply = `Issue criada com sucesso:\n${issue.url}`;
      await firebaseWrite(config, 'botIssues', {
        createdAt: nowIso(),
        title: issueTitle,
        url: issue.url,
        chatId,
        userName,
        text
      }, 'POST');
      appendConsensusLine(`Issue criada a partir do Telegram por ${userName}: ${issueTitle}`);
    } else {
      reply = `Não consegui criar a issue agora. Erro: ${issue.error}`;
    }
  } else {
    const groqAnswer = await askGroq(config, text, contextSnippet);
    reply = groqAnswer;

    if (normalized.includes('sugest') || normalized.includes('ideia') || normalized.includes('mudar') || normalized.includes('poderia')) {
      appendConsensusLine(`Feedback de ${userName}: ${safeText(text, 800)}`);
    }
  }

  if (reply) {
    await sendTelegramMessage(config, chatId, reply);
    await firebaseWrite(config, 'botReplies', {
      sentAt: nowIso(),
      chatId,
      userName,
      inputText: text,
      replyText: reply
    }, 'POST');
  }

  state.processedMessages += 1;
}

async function heartbeat(config, state) {
  await firebaseUpdate(config, 'botRuntime', {
    worker: 'telegram-groq-worker',
    aliveAt: nowIso(),
    startedAt: state.startedAt,
    processedMessages: state.processedMessages,
    knownChats: state.knownChats,
    offset: state.offset,
    lastError: state.lastError || null
  });
}

async function runLoop() {
  ensureDirs();
  loadEnv();

  const config = getConfig();
  if (!config.telegramToken) {
    throw new Error('TELEGRAM_BOT_TOKEN não configurado');
  }

  const state = loadState();

  console.log(`[${nowIso()}] worker_started`);

  while (true) {
    try {
      const contextSnippet = readContext();
      const updates = await telegramApi(config, 'getUpdates', {
        offset: state.offset,
        timeout: config.pollTimeout
      });

      const list = Array.isArray(updates.result) ? updates.result : [];
      for (const upd of list) {
        state.offset = Math.max(state.offset, Number(upd.update_id) + 1);
        await processIncomingMessage(config, state, upd, contextSnippet);
      }

      state.lastLoopAt = nowIso();
      state.lastError = null;
      saveState(state);
      await heartbeat(config, state);
    } catch (err) {
      const errorMsg = safeText(err && err.message ? err.message : String(err), 1000);
      state.lastError = `${nowIso()} ${errorMsg}`;
      saveState(state);
      console.error(`[${nowIso()}] worker_error ${errorMsg}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

runLoop().catch((err) => {
  console.error(`[${nowIso()}] worker_fatal ${err.message}`);
  process.exit(1);
});
