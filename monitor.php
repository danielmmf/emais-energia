<?php

declare(strict_types=1);

session_start();

if (empty($_SESSION['mentor_authenticated']) || empty($_SESSION['mentor_name'])) {
    header('Location: /');
    exit;
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Monitor de Operações | Viabilidade Verde</title>
  <style>
    :root {
      --bg: #061b23;
      --panel: #0e2f3b;
      --panel-soft: #123a48;
      --text: #eaf6ef;
      --muted: #a8c8b8;
      --ok: #7dd15d;
      --warn: #ffd25a;
      --border: rgba(255,255,255,.15);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: radial-gradient(circle at 15% 10%, #17485b, var(--bg) 45%, #041219);
      color: var(--text);
      min-height: 100vh;
      padding: 16px;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .topbar a {
      color: var(--ok);
      font-weight: 700;
      text-decoration: none;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .card {
      background: linear-gradient(180deg, rgba(14,47,59,.95), rgba(8,28,35,.95));
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
    }
    h1, h2, h3 { margin: 0 0 10px; }
    h1 { font-size: 1.2rem; }
    h2 { font-size: 1.05rem; color: var(--ok); }
    .kpi {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .kpi .item {
      background: var(--panel-soft);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 10px;
    }
    .label { color: var(--muted); font-size: .82rem; margin-bottom: 4px; }
    .value { font-weight: 700; }
    .status-ok { color: var(--ok); }
    .status-warn { color: var(--warn); }
    .list {
      max-height: 320px;
      overflow: auto;
      display: grid;
      gap: 8px;
    }
    .row {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
      background: rgba(255,255,255,.03);
    }
    .row .meta {
      color: var(--muted);
      font-size: .8rem;
      margin-bottom: 6px;
    }
    .empty {
      color: var(--muted);
      font-size: .9rem;
    }
    @media (min-width: 980px) {
      .grid {
        grid-template-columns: 1fr 1fr;
      }
      .wide { grid-column: 1 / span 2; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div>
      <h1>Monitor de Operações em Tempo Real</h1>
      <div>Mentor logado: <?= htmlspecialchars((string) $_SESSION['mentor_name'], ENT_QUOTES, 'UTF-8') ?></div>
    </div>
    <div>
      <a href="/viabilidade-verde/">Abrir App</a> |
      <a href="/">Landing</a>
    </div>
  </div>

  <div class="grid">
    <section class="card">
      <h2>Runtime do Robô</h2>
      <div class="kpi">
        <div class="item"><div class="label">Status</div><div id="botStatus" class="value status-warn">Carregando...</div></div>
        <div class="item"><div class="label">Mensagens processadas</div><div id="botProcessed" class="value">-</div></div>
        <div class="item"><div class="label">Último heartbeat</div><div id="botAlive" class="value">-</div></div>
        <div class="item"><div class="label">Chats conhecidos</div><div id="botChats" class="value">-</div></div>
      </div>
      <div style="margin-top:10px;" class="label">Último erro</div>
      <div id="botError" class="value">-</div>
    </section>

    <section class="card">
      <h2>Acessos da Aplicação</h2>
      <div id="accessList" class="list"></div>
    </section>

    <section class="card wide">
      <h2>Conversas dos Mentores</h2>
      <div id="chatList" class="list"></div>
    </section>
  </div>

  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
  <script src="/viabilidade-verde/firebase.config.js"></script>
  <script>
    (function () {
      var cfg = window.VV_FIREBASE_CONFIG || null;
      if (!cfg || !cfg.apiKey || !cfg.databaseURL) {
        document.getElementById('botStatus').textContent = 'Firebase não configurado';
        return;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }

      var db = firebase.database();

      function esc(v) {
        return String(v || '').replace(/[&<>\"]/g, function (c) {
          return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
        });
      }

      function fmtTs(value) {
        if (!value) return '-';
        var d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString('pt-BR');
      }

      db.ref('botRuntime').on('value', function (snap) {
        var data = snap.val() || {};
        var status = data.lastError ? 'Com erro' : 'Online';
        var statusEl = document.getElementById('botStatus');
        statusEl.textContent = status;
        statusEl.className = data.lastError ? 'value status-warn' : 'value status-ok';

        document.getElementById('botProcessed').textContent = data.processedMessages || 0;
        document.getElementById('botAlive').textContent = fmtTs(data.aliveAt);
        document.getElementById('botChats').textContent = Array.isArray(data.knownChats) ? data.knownChats.length : 0;
        document.getElementById('botError').textContent = data.lastError || 'Nenhum';
      });

      db.ref('mentorAccesses').limitToLast(60).on('value', function (snap) {
        var root = document.getElementById('accessList');
        var rows = [];
        snap.forEach(function (child) {
          rows.push(child.val());
        });
        rows.reverse();

        if (!rows.length) {
          root.innerHTML = '<div class="empty">Sem acessos registrados no Firebase.</div>';
          return;
        }

        root.innerHTML = rows.map(function (r) {
          return '<div class="row">' +
            '<div class="meta">' + esc(fmtTs(r.timestamp)) + ' | IP ' + esc(r.ip || '-') + '</div>' +
            '<div><strong>' + esc(r.name || 'N/A') + '</strong></div>' +
            '<div class="meta">UA: ' + esc(r.userAgent || '-') + '</div>' +
          '</div>';
        }).join('');
      });

      db.ref('botMessages').limitToLast(120).on('value', function (snap) {
        var root = document.getElementById('chatList');
        var rows = [];
        snap.forEach(function (child) {
          rows.push(child.val());
        });
        rows.sort(function (a, b) {
          return (new Date(b.receivedAt).getTime() || 0) - (new Date(a.receivedAt).getTime() || 0);
        });

        if (!rows.length) {
          root.innerHTML = '<div class="empty">Sem mensagens do bot ainda.</div>';
          return;
        }

        root.innerHTML = rows.map(function (r) {
          return '<div class="row">' +
            '<div class="meta">' + esc(fmtTs(r.receivedAt || r.timestamp)) + ' | chat ' + esc(r.chatId || '-') + ' | ' + esc(r.userName || '-')</div>' +
            '<div>' + esc(r.text || '-') + '</div>' +
          '</div>';
        }).join('');
      });
    })();
  </script>
</body>
</html>
