# Sistema Web Del Personal Trainer

Site institucional com agendamento online e dashboard administrativa usando React, Vite, Tailwind CSS, Firebase Authentication e Firestore.

## Como rodar

```bash
npm install
npm run dev
```

O `npm run dev` usa Netlify Dev para que as funções serverless funcionem localmente junto com o Vite. Acesse a URL exibida no terminal, normalmente `http://localhost:5173`.

## Configuração do Firebase

1. Crie um projeto no Firebase.
2. Ative o Firebase Authentication com login por e-mail e senha.
3. Crie manualmente o usuário administrador em Authentication.
4. Ative o Firestore Database.
5. Copie `.env.example` para `.env` e preencha as variaveis do app web Firebase.
6. Publique as regras de `firestore.rules`.

## Notificações por e-mail

O envio de e-mails usa SMTP da Hostinger por uma função serverless do Netlify, sem Firebase Functions.

Configure no Netlify:

```bash
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465
HOSTINGER_SMTP_USER=contato@trebintech.com
HOSTINGER_SMTP_PASS=sua_senha_do_email
MAIL_FROM_NAME=Del Personal Trainer
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

`FIREBASE_SERVICE_ACCOUNT_JSON` é usado somente no servidor para validar o token do admin ao enviar e-mails de confirmação ou cancelamento. Não coloque essa chave no front-end nem em variáveis `VITE_*`.

Para testar as funções localmente, use Netlify Dev ou configure `VITE_EMAIL_FUNCTION_URL` apontando para a URL publicada da função.

## Regras de segurança sugeridas

O arquivo `firestore.rules` permite que qualquer visitante crie um agendamento, mas somente usuários autenticados podem ler, atualizar ou excluir documentos.

## Imagens

As imagens ficam em `src/assets`. Substitua os arquivos placeholder por fotos reais do Del, mantendo os nomes ou ajustando os imports em `src/data/siteData.js`.

## Deploy

O projeto está pronto para Netlify. As configurações estão em `netlify.toml`.

```bash
npm run build
```

No painel do Netlify, use:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node version: `20`

Configure as variáveis de ambiente no Netlify:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_EMAIL_FUNCTION_URL=/.netlify/functions/send-appointment-email

HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465
HOSTINGER_SMTP_USER=contato@trebintech.com
HOSTINGER_SMTP_PASS=sua_senha_do_email
MAIL_FROM_NAME=Del Personal Trainer
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Não suba `.env` nem `serviceAccount.json` para o repositório. Essas informações devem ficar somente nas variáveis do Netlify.
