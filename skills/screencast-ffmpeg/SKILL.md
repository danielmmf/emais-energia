# Skill: Screencast Recording with FFmpeg

Grava screencasts do aplicativo usando FFmpeg para documentação, demos e verificações.

## Quando Usar

- Gravar screencast para submissão à Meta (WhatsApp Business API)
- Documentar funcionalidades do app
- Demonstrar fluxos de usuário
- Verificar comportamento visual

## Pré-requisitos

1. FFmpeg instalado: `sudo apt install ffmpeg`
2. Display X11 disponível (variável $DISPLAY)
3. Servidor PHP rodando (php artisan serve ou similar)

## Comandos

### 1. Verificar Ambiente

```bash
# Verificar se FFmpeg está instalado
ffmpeg -version | head -1

# Verificar display disponível
echo $DISPLAY
```

### 2. Gravar Screencast (60 segundos)

```bash
# Grabar tela inteira (ajuste video_size conforme necessário)
ffmpeg -f x11grab -framerate 15 -video_size 1280x720 -i :1 -t 60 -pix_fmt yuv420p /tmp/screencast.mp4 2>&1 | tail -5 &

# Ou com duração variável (para por terminado manualmente)
ffmpeg -f x11grab -framerate 15 -video_size 1280x720 -i :1 -t 300 -pix_fmt yuv420p /tmp/screencast.mp4
```

### 3. GravarÁreaindicada

```bash
# Com coordenadas específicas (x:y:width:height)
ffmpeg -f x11grab -framerate 15 -video_size 800x600 -i :1+100,50 -t 30 /tmp/screencast.mp4
```

### 4. Opções de Qualidade

| Parâmetro | Valor Baixo | Valor Alto |
|-----------|-------------|------------|
| framerate | 10 fps | 30 fps |
| video_size | 1024x768 | 1920x1080 |
| bitrate | 1000k | 5000k |

Exemplo qualitativo alto:
```bash
ffmpeg -f x11grab -framerate 30 -video_size 1920x1080 -i :1 -t 60 -b:v 5000k -pix_fmt yuv420p /tmp/screencast.mp4
```

### 5. Scripts Úteis

#### Gravar e Copiar para Diretório Web
```bash
# Gravar
ffmpeg -f x11grab -framerate 15 -video_size 1280x720 -i :1 -t 60 -pix_fmt yuv420p /tmp/demo.mp4 2>&1 | tail -3 &

# Copiar para diretório acessível
cp /tmp/demo.mp4 /var/www/html/whatsapi/public/demo.mp4
```

#### Gravar com Áudio (se disponível)
```bash
ffmpeg -f x11grab -framerate 15 -video_size 1280x720 -i :1 -f pulse -i default -t 60 -pix_fmt yuv420p /tmp/demo.mp4
```

## Fluxo para Screencast Meta WhatsApp

### Opção 1: FFmpeg (gravação manual)
- Grabs a tela diretamente
- Requer navegação manual do usuário
- boa alternativa quando não há navegador disponível

### Opção 2: Playwright (Recomendado)
- Grava automaticamente via navegador automatizado
- Mais confiável e reproduzível
- Vídeo é gerado automaticamente

#### Passos para Gravar com Playwright

1. **Crie/atualize o teste** em `tests/E2E/record-video.spec.ts`:
```typescript
import { test } from '@playwright/test';

test('record user journey', async ({ page }) => {
  await page.goto('https://whatsapi.devinhas.com.br/');
  await page.waitForTimeout(2000);
  // ... mais passos
});
```

2. ** Configure o playwright.config.ts**:
```typescript
export default defineConfig({
  use: {
    video: 'on',
    screenshot: 'on',
  },
});
```

3. **Execute o teste**:
```bash
npx playwright test tests/E2E/record-video.spec.ts
```

4. **Envie para produção**:
```bash
ffmpeg -i test-results/*/video/webm -pix_fmt yuv420p output.mp4
sshpass scp output.mp4 user@server:/path/to/public/
```

## Checklist de Qualidade

- [ ] Video com no mínimo 30 segundos
- [ ] Resolução mínima 1280x720
- [ ] Não mostra cursor do mouse excessivamente
- [ ] Áudio(s) do sistema silenciados (evita ruído)
- [ ] Demonstra o fluxo completo: login → dashboard → configuração → uso

## Troubleshooting

### "Cannot open display :0"
```bash
# Verificar display
echo $DISPLAY

# Usar display correto (geralmente :0 ou :1)
ffmpeg -f x11grab -i :0 ...
```

### "Fontes erradas ou chiadas"
```bash
# Gravar sem áudio
ffmpeg -f x11grab ... -an /tmp/screencast.mp4
```

### Video muito grande
```bash
# Comprimir com CRF (qualidade menor = arquivo menor)
ffmpeg -i /tmp/screencast.mp4 -crf 28 /tmp/small.mp4
```

### Server não responde durante gravação
- Evitar gravação do terminal junto com a aba
- Usar `nohup` para background
- Verificar se servidor está rodando antes de gravar

## Exemplo Completo

```bash
# 1. Iniciar servidor (se necessário)
cd /var/www/html/whatsapi && php artisan serve --host=127.0.0.1 --port=8000 &

# 2. Verificar display
echo $DISPLAY  # Output: :1

# 3. Gravar (60 segundos, 15fps, 720p)
ffmpeg -f x11grab \
  -framerate 15 \
  -video_size 1280x720 \
  -i :1 \
  -t 60 \
  -pix_fmt yuv420p \
  /tmp/whatsapi_demo.mp4 2>&1 | tail -5 &

# 4. Aguardar e navegar no app

# 5. Verificar
ls -lh /tmp/whatsapi_demo.mp4
```

## Formatos Suportados

| Formato | Extensão | Uso |
|---------|----------|-----|
| MP4 (H.264) | .mp4 | Recomendado - compatível com tudo |
| WebM | .webm | Alternativa web |
| MOV | .mov | Formato QuickTime |

Recomenda-se MP4 com codec H.264 para máxima compatibilidade.