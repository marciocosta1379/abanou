# n8n — Trigger de publicação do Abanou (07h BRT)

Mesma lógica do reformacaseira, mas para o repo **`marciocosta1379/abanou`**. O n8n agenda
às **07h BRT**, dispara o workflow `publish-scheduled.yml` via `workflow_dispatch`, confere
o resultado e, se falhar, **redispara 1x** e avisa no **Telegram**.

O build, commit e deploy FTP rodam no GitHub Actions do repo do abanou (usando os secrets
`HOSTINGER_FTP_*`).

## Setup (uma vez)

1. **PAT do GitHub** — pode reusar o mesmo do reformacaseira (token classic com escopos
   `repo` + `workflow` vale para todos os repositórios da conta). Logo, no n8n a credencial
   **"GitHub PAT (Bearer)"** que já existe serve.
2. **Importar a workflow** — n8n → Import from File → `publish-trigger.workflow.json`.
3. Nos nós HTTP, selecione a credencial **"GitHub PAT (Bearer)"** existente.
4. No nó **Alertar no Telegram**, selecione a credencial **"Telegram Bot"** e troque
   `REPLACE_CHAT_ID` pelo seu chat id (o mesmo do outro site).
5. Confirme o timezone da workflow = **America/Sao_Paulo**.
6. **Ativar** a workflow.

> Isso é uma workflow **separada** da do reformacaseira — os dois sites publicam de forma
> independente, cada um com seu repo e seus secrets. Um não derruba o outro.

## ⚠️ Pegadinha do cron (n8n usa 6 campos, começando por SEGUNDOS)

O Schedule Trigger do n8n **não** usa o cron Unix de 5 campos. O formato é:

```
[Segundo] [Minuto] [Hora] [Dia do mês] [Mês] [Dia da semana]
```

Por isso `0 7 * * *` (5 campos) é lido errado e **não dispara no horário**. O correto para
**07:00:00 BRT** é:

```
0 0 7 * * *
```

(O timezone já é `America/Sao_Paulo`.) Depois de corrigir: **Save** → desligue e religue o
toggle **Active** para re-registrar o agendamento.

**Teste rápido (sem esperar até amanhã):** ponha a Expression uns 2-3 min à frente
(ex.: `0 35 10 * * *` se forem 10h33), Save + reative, e veja em *Executions* se disparou
sozinho. Funcionando, volte para `0 0 7 * * *`.

## Testar
Na workflow, clique **Execute Workflow**. Deve disparar um run no GitHub Actions do abanou
e, ~3 min depois, confirmar sucesso.
