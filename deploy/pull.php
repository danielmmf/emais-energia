<?php

declare(strict_types=1);

$config = require dirname(__DIR__) . '/config/security.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Use POST.',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$token = (string) ($_POST['token'] ?? '');
if ($token === '' || !password_verify($token, (string) ($config['deploy_token_hash'] ?? ''))) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'message' => 'Token inválido.',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$allowedIps = array_values(array_filter(array_map('trim', $config['deploy_allowed_ips'] ?? [])));
if ($allowedIps !== []) {
    $clientIp = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if (!in_array($clientIp, $allowedIps, true)) {
        http_response_code(403);
        echo json_encode([
            'ok' => false,
            'message' => 'IP não autorizado.',
            'ip' => $clientIp,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$projectRoot = dirname(__DIR__);
$command = sprintf('git -C %s pull origin main 2>&1', escapeshellarg($projectRoot));
$output = [];
$exitCode = 1;
exec($command, $output, $exitCode);

http_response_code($exitCode === 0 ? 200 : 500);

echo json_encode([
    'ok' => $exitCode === 0,
    'timestamp' => date('c'),
    'project_root' => $projectRoot,
    'exit_code' => $exitCode,
    'output' => $output,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
