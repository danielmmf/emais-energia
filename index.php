<?php

declare(strict_types=1);

session_start();

$config = require __DIR__ . '/config/security.php';
$mentorNames = array_values(array_filter(array_map('trim', $config['mentor_names'] ?? [])));
$nameLookup = [];
foreach ($mentorNames as $mentorName) {
    $nameLookup[mb_strtolower($mentorName)] = $mentorName;
}

if (isset($_POST['logout'])) {
    unset($_SESSION['mentor_authenticated'], $_SESSION['mentor_name']);
    header('Location: /');
    exit;
}

$error = null;

if (!empty($_POST['mentor_name']) && isset($_POST['mentor_password'])) {
    $typedName = trim((string) $_POST['mentor_name']);
    $typedPassword = (string) $_POST['mentor_password'];

    $normalizedName = mb_strtolower($typedName);
    $isNameAllowed = isset($nameLookup[$normalizedName]);
    $isPasswordValid = password_verify($typedPassword, (string) ($config['mentor_password_hash'] ?? ''));

    if ($isNameAllowed && $isPasswordValid) {
        $_SESSION['mentor_authenticated'] = true;
        $_SESSION['mentor_name'] = $nameLookup[$normalizedName];
        header('Location: /');
        exit;
    }

    $error = 'Acesso negado. Verifique nome do mentor e senha.';
}

$isAuthenticated = !empty($_SESSION['mentor_authenticated']) && !empty($_SESSION['mentor_name']);
$mentorName = $isAuthenticated ? (string) $_SESSION['mentor_name'] : '';
$isSetupReady = !empty($mentorNames);
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Viabilidade Verde</title>
  <style>
    :root {
      --bg: #08212a;
      --panel: #103340;
      --accent: #8bd464;
      --text: #eff8f2;
      --muted: #b7d2c3;
      --danger: #ffd9d6;
      --danger-bg: #5c1f1f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: radial-gradient(circle at 20% 20%, #164555 0%, var(--bg) 45%, #05161d 100%);
      color: var(--text);
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .card {
      width: min(720px, 100%);
      background: linear-gradient(180deg, rgba(16,51,64,.95), rgba(9,30,38,.95));
      border: 1px solid rgba(139, 212, 100, .35);
      border-radius: 14px;
      padding: 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,.35);
    }
    h1 { margin: 0 0 8px; font-size: 2rem; }
    .subtitle { color: var(--muted); margin: 0 0 24px; }
    .notice {
      background: rgba(139, 212, 100, .14);
      border: 1px solid rgba(139, 212, 100, .4);
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 20px;
    }
    .error {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(255,217,214,.45);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .field { margin-bottom: 12px; }
    label { display: block; margin-bottom: 6px; color: var(--muted); font-size: .92rem; }
    input {
      width: 100%;
      padding: 11px 12px;
      border: 1px solid rgba(255,255,255,.25);
      border-radius: 8px;
      background: rgba(255,255,255,.08);
      color: var(--text);
      font-size: 1rem;
    }
    button {
      width: 100%;
      margin-top: 8px;
      background: var(--accent);
      border: 0;
      color: #0f3118;
      border-radius: 9px;
      font-weight: 700;
      padding: 12px;
      cursor: pointer;
      font-size: 1rem;
    }
    .logout {
      background: transparent;
      border: 1px solid rgba(255,255,255,.32);
      color: var(--text);
    }
    .small { color: var(--muted); font-size: .86rem; margin-top: 16px; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Viabilidade Verde</h1>
    <p class="subtitle">A transicao energetica so acelera quando a conta fecha.</p>

    <?php if ($isAuthenticated): ?>
      <div class="notice">
        <strong>Acesso liberado para mentor:</strong> <?= htmlspecialchars($mentorName, ENT_QUOTES, 'UTF-8') ?>
      </div>
      <h2>Pagina inicial da solucao</h2>
      <p>Aqui vai entrar a solucao completa do desafio Hackathon E+.</p>
      <p>No momento, esta area esta em validacao e preparacao de demo.</p>

      <form method="post">
        <button type="submit" name="logout" value="1" class="logout">Sair</button>
      </form>
    <?php else: ?>
      <div class="notice">
        Acesso temporariamente restrito. Esta area esta bloqueada para competidores.
      </div>

      <?php if (!$isSetupReady): ?>
        <div class="error">
          Lista de mentores ainda nao configurada em <code>config/security.php</code>.
        </div>
      <?php endif; ?>

      <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <form method="post" autocomplete="off">
        <div class="field">
          <label for="mentor_name">Nome do mentor</label>
          <input id="mentor_name" name="mentor_name" type="text" required>
        </div>

        <div class="field">
          <label for="mentor_password">Senha de acesso</label>
          <input id="mentor_password" name="mentor_password" type="password" required>
        </div>

        <button type="submit">Entrar</button>
      </form>

      <p class="small">Apenas mentores autorizados podem acessar nesta fase.</p>
    <?php endif; ?>
  </main>
</body>
</html>
