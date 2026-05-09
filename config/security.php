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
    'mentor_password_hash' => '$2y$10$.L3b3Ukbn0Jl0UhA.qycHORfVcXUcxD3Em7J5m35QEFZt6njD7pZ6', // baconpedacudo
    'mentor_names' => [
        // Exemplo: 'Maria Souza',
        // Exemplo: 'Joao Lima',
    ],

    'deploy_token_hash' => '$2y$10$eb.Gfgk1oHmolnujlsXtOO4o/g26uOLag4P5ikmKvvKS3.GZxnToi', // baconpedacudo
    'deploy_allowed_ips' => [
        // Exemplo: '127.0.0.1',
        // Exemplo: '200.100.50.10',
    ],
];
