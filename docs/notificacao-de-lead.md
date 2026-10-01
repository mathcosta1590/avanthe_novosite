# Aviso instantâneo de lead

A cada formulário enviado, o Netlify chama `netlify/functions/submission-created.mjs`
sozinho. Nada no site precisa saber que isso existe, e **a mensagem fica guardada
no painel do Netlify de qualquer jeito** — o aviso é um extra, nunca uma
dependência.

Enquanto nenhuma variável abaixo estiver preenchida, a função roda, não faz nada
e devolve ok.

## Por que isso vale mais do que parece

O site promete resposta em um dia útil. Quem contrata obra pede orçamento para
três ou quatro empresas na mesma tarde. Quem responde primeiro conversa com um
cliente ainda decidindo; quem responde no dia seguinte conversa com alguém que já
tem duas propostas na mão.

## Onde preencher

Netlify → o site → **Site configuration** → **Environment variables**.
Depois de salvar, é preciso um novo deploy para a função enxergar as variáveis.

## Três caminhos, do mais simples ao mais sério

### 1. Callmebot — para começar hoje

Avisa um número só, sem burocracia. **Não é serviço de empresa e pode sair do
ar**, então serve para validar, não para depender.

1. Salve o contato `+34 644 51 95 23` no celular.
2. Mande para ele, pelo WhatsApp: `I allow callmebot to send me messages`
3. Ele responde com uma chave.

| Variável | Valor |
|---|---|
| `CALLMEBOT_PHONE` | `+5541984468168` |
| `CALLMEBOT_APIKEY` | a chave que ele mandou |

### 2. WhatsApp Cloud API — o caminho oficial da Meta

Exige conta no Meta for Developers, um número dedicado e um modelo de mensagem
aprovado com um campo de texto livre no corpo.

| Variável | Valor |
|---|---|
| `WHATSAPP_TOKEN` | token permanente do app |
| `WHATSAPP_PHONE_ID` | ID do número remetente |
| `WHATSAPP_DESTINO` | `5541984468168` |
| `WHATSAPP_TEMPLATE` | nome do modelo aprovado |

### 3. Webhook — qualquer outra coisa

Recebe o lead em JSON e você decide o resto: Make, Zapier, n8n, Slack, uma
planilha, um CRM.

| Variável | Valor |
|---|---|
| `WEBHOOK_URL` | a URL do gancho |

## E o e-mail?

O Netlify manda e-mail de formulário sem nenhum código: **Forms → Form
notifications → Add notification → Email notification**. Vale ligar junto, como
rede de segurança para quando o WhatsApp falhar.

## Como saber se está funcionando

Netlify → **Logs** → **Functions** → `submission-created`. A cada envio sai uma
linha:

- `aviso de lead (orcamento): callmebot:200` — foi.
- `canal de aviso falhou (orcamento): ...` — tinha canal e ele caiu.
- `lead (orcamento) recebido, nenhum canal de aviso configurado` — nada ligado.
