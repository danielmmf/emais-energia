<?php

declare(strict_types=1);

/*
 * Configuracao de acesso temporario para mentores e endpoint de deploy.
 *
 * Antes de publicar:
 * 1) Troque os hashes por novos gerados com password_hash().
 * 2) Preencha a lista de mentores autorizados.
 * 3) Opcionalmente restrinja IPs do endpoint de deploy.
 */

return [
    'mentor_password_hash' => '$2y$10$iWabvRkAXfnH0LNeNE9m6OWnisN6j8EMhD4M95vMqzenHb6rpm.8a', // ALTERAR_SENHA_MENTOR
    'mentor_names' => [
        // Exemplo: 'Maria Souza',
        // Exemplo: 'Joao Lima',
    ],

    'deploy_token_hash' => '$2y$10$7lh2S8yI.27TdlQhgSeqhOEZJg08xGnIP/osD3NepUbzu5gm2NnnG', // ALTERAR_TOKEN_DEPLOY
    'deploy_allowed_ips' => [
        // Exemplo: '127.0.0.1',
        // Exemplo: '200.100.50.10',
    ],
];
