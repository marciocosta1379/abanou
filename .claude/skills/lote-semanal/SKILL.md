---
name: lote-semanal
description: Gera os 10 posts da semana para o Abanou (7 na trilha da manhã com cães e gatos + 3 na trilha da tarde com aquarismo) com APROVAÇÃO DO USUÁRIO EM ETAPAS. Use quando o usuário digitar /lote-semanal, pedir "gerar a semana" ou "criar os posts da semana".
---

# Skill: Lote Semanal de Posts — Abanou

Site de reviews de produtos para **cães, gatos** e **aquarismo**. Reviews/comparativos honestos,
com o selo editorial **✅ Abanou**. Supervisão humana em cada etapa.

## ⛔ Regra-mãe: NUNCA pule um gate

O fluxo tem **3 portões de aprovação**. Em cada um, **pare e espere o "ok" explícito**.
**Nunca** mude `draft:false`, **nunca** commite e **nunca** agende sem a liberação final.

---

## Fluxo

### 0. Gatilho

`/lote-semanal [data da segunda]` ou "vamos gerar a semana". Calcule as datas.

⚠️ **Cadência desde 05/09/2026: 10 posts por semana.**

| Trilha | Dias | Hora | Tema | `pubDate` |
|---|---|---|---|---|
| Manhã | seg a dom (7) | 07h | **cães e gatos** | `2026-09-14` |
| Tarde | ter, qui, sáb (3) | 18h | **aquarismo** | `2026-09-15T18:00:00-03:00` |

O `publish-scheduled.mjs` compara o timestamp completo, então basta a hora no `pubDate`. Quem
dispara de verdade é o **n8n** (dois triggers: 07h e 18h, timezone America/Sao_Paulo).

⚠️ **Aquarismo é a categoria mais rasa do site** — há muito mais conteúdo de cão e gato. Há
assunto de sobra para 12 posts por mês por um ano sem repetir: ciclagem, química da água,
filtragem e mídias, superlotação, plantados, iluminação e fotoperíodo, espécies e compatibilidade,
doenças, alimentação, manutenção, hardscape, aquário marinho.

### Gate 1 — TEMAS (aprovação)

Sugira **10 temas** com data, trilha e tipo. Tabela. **Pare e espere aprovação.**

**De onde saem os temas** (⚠️ produto em voga, não data em voga):

- **Mais vendidos** — Amazon (`/gp/bestsellers/...` via `curl`, funciona), Petz (ordenar por
  "Mais comprados"), Mercado Livre, Shopee.
- **Trends** — Google Shopping/Trends, YouTube pet e aquarismo BR, X.
- ⚠️ **Antes de propor, varra `src/content/posts/` para não repetir tema já publicado.**

### Gate 2 — TÍTULOS (aprovação)

Títulos finais dos 10 posts. **Pare e espere aprovação.**

⚠️ **Comprimentos (o Bing Webmaster acusa curto demais como erro de SEO):**

- **Título: 40 a 70 caracteres.**
- **Descrição meta: 120 a 160 caracteres.** O schema zod corta acima de 160 — valide antes.
- **Direto ao produto/pergunta**, sem framing abstrato: *"Quantos peixes cabem no aquário: a conta
  que salva o peixe"*, não *"o fascinante mundo subaquático"*.
- **Recomendação de espécie/uso só do que o produto de fato atende** — não estique a indicação.

### Passo 3 — Pesquisa + esqueleto (sem aprovação, é trabalho)

#### 3.1 — Roteamento de loja (⚠️ regra de 04/09/2026)

| O quê | Loja |
|---|---|
| **Medicação e alimentação de cão e gato** (ração, petisco, antipulgas, remédio) | **Petz** |
| **Todo o resto** — duráveis, equipamento, aquarismo inteiro | **Amazon** |
| Plano de saúde | PetLove (`<PlanCallout>`) |
| Cursos | Hotmart |

- **Amazon:** SiteStripe logado, ou `https://www.amazon.com.br/dp/<ASIN>?tag=abanou-20`.
  **Preço OCULTO** (regra Amazon — só com PA-API).
- **Petz:** link do produto no painel `parceiropetz.com.br`; cupom **`ABANOU`** (o botão abre o
  modal do cupom automaticamente). **Sem `rating`** — a Petz não expõe nota confiável.
  `curl` na Petz não funciona (retorna 466 bytes); use o **Browser pane** ou `petz-cdp.mjs`.
  Na imagem da Petz, tire o sufixo `_mini` da URL para pegar o tamanho cheio.
- **Mercado Livre (exceção):** só quando o produto certo não existe na Amazon. O ML bloqueia
  `curl`/WebFetch/API oficial; use **Chrome via CDP** (`--remote-debugging-port=9222
  --user-data-dir=<temp>` + `ml-cdp.mjs` do Nerd Caseiro). O link curto `meli.la/CODE` resolve
  para a **página do perfil "Rede Caseira"**, não para o produto — o usuário optou por usar assim
  mesmo; para **baixar a imagem** use a URL longa.
- **Hotmart:** reaproveite os links já cadastrados (memória `hotmart-cursos-afiliados-rede`).
  ⚠️ O curso *Chef di Animale* ficou **indisponível em 04/09/2026** — não usar.

⚠️ **NUNCA invente link.** Se não conseguir o link real, escreva `[TODO: link real]` e avise.

#### 3.2 — Pesquisa externa (≥2 fontes)

Veterinários e portais com revisão veterinária, fabricantes de ração (Premier, Golden, Royal
Canin, Hill's, N&D), bulas dos laboratórios, Reclame Aqui, YouTube pet. **Regra de ouro: nunca
invente specs ou composição.** Saúde animal: tom informativo, não prescritivo ("consulte um
veterinário").

⚠️ **Protocolo de aquarismo** (ver `CLAUDE.md`): o autor **não mantém os aquários do post**.

- Dado de espécie (litragem mínima, temperatura, pH, dureza, porte adulto, temperamento) só de
  **FishBase** ou **Seriously Fish** — e confira a **referência brasileira** também: o mínimo
  praticado no Brasil pode diferir do citado lá fora (foi o caso do betta: 10 L é a referência
  local, não os 41 L do Seriously Fish).
- **Compatibilidade se checa nos dois sentidos** (A aceita B *e* B aceita A).
- **Ciclagem e química sempre com número e fonte** — nunca "espere umas semanas".
- Dimensionamento tem de **fechar com o resto do post**: aquecedor de 50 W num aquário de 10 L é
  erro. Regra prática: **1 a 2 W por litro**.
- Nada de primeira pessoa falsa ("meu aquário há 5 anos").

#### 3.3 — Baixar imagens (WebP local)

JSON `[{id,name,brand,rating,image,stores:[{store:'amazon'|'petz'|'petlove'|'hotmart',url}]}]` →
`node scripts/search-products.mjs --file scripts/products-<slug>.json`.

- ⚠️ **A URL da imagem só pode vir do MESMO item da MESMA busca** — nunca de contexto anterior.
  Varredura de MD5 pega foto trocada.
- O script **não sobrescreve arquivo existente**: se o `id` repetir, apague o `.webp` antes.
- Confira tamanhos: **< 2KB = imagem quebrada → remova**.
- **Foto de espécie / planta / referência — padrão no Abanou desde 11/09/2026.** Decisão do
  usuário: a imagem do **Wikimedia Commons** entra **sempre que ilustrar melhor o artigo e/ou
  quando as fotos de produto não bastarem**. Não é recurso excepcional — é parte do fechamento
  de todo post cujo argumento é sobre o **animal ou a planta**, não sobre o aparelho.
  - **Passe os posts do lote nesse filtro antes de fechar:** o texto nomeia espécie, raça, planta
    ou estrutura anatômica que nenhuma foto de produto mostra? A diferença que o texto descreve é
    visual? Se sim, busque no Commons. Se o produto já é o assunto e a foto do anúncio mostra o
    que o texto discute, não force.
  - **Obrigatório:** a API exige header `User-Agent`; **cheque a licença** (domínio público, CC0
    ou CC BY-SA servem — CC BY-NC e "fair use" **não**); **confirme visualmente que é a espécie
    certa** (⚠️ a busca por "Java moss" no Commons devolve *Fontinalis*, musgo-salgueiro, que é
    outra planta — nome de arquivo não é prova); e **credite logo abaixo da imagem**:
    `<p class="credito-imagem"><small>Assunto — foto de AUTOR, LICENÇA, via Wikimedia Commons.</small></p>`
  - Guarde em `public/images/plantas/` ou `public/images/referencia/` — **nunca** em `produtos/`,
    senão a varredura de imagem órfã acusa falso positivo. **Nunca vira `og:image`.**

#### 3.4 — Scaffold + frontmatter

```bash
node scripts/scaffold-post.mjs --data scripts/products-<ts>.json --slug "<slug>" --category <cat> --title "<título>"
```

Categorias: `racao | petiscos | alimentadores | tecnologia-pet | passeio | conforto | higiene | brinquedos | plano-de-saude | saude-cuidados | guias`.

Frontmatter: `pubDate` (com hora nos posts de 18h), `author: 'Márcio Costa'`, `tags` com o
**animal** (`cães`/`gatos`/`peixes`/`outros`), `faq` espelhando a seção FAQ em texto plano,
`featured: true` nos 2-3 de maior apelo.
**Petz pode exibir `price` + `priceCheckedAt`; Amazon NÃO.**

#### 3.5 — ⚠️ VERIFICAR ESTOQUE (obrigatório, antes do Gate 3)

Produto fora de estoque queima o clique. **Cheque todos** antes de apresentar:

```bash
curl -s -A "Mozilla/5.0" "https://www.amazon.com.br/dp/SEU_ASIN" | grep -o 'id="availability".\{0,120\}'
```

Sinal de compra possível: texto de disponibilidade positivo **e** presença de
`id="add-to-cart-button"`. Caso ambíguo → confirme no Browser pane. Sem estoque → **troque o
produto** (e apague a imagem órfã). Na Petz, confira pelo Browser pane.

### Gate 3 — TEXTO (aprovação)

Preencha os `[TODO]`s, gere os cartões OG (`npm run og`), rode `npm run build` para validar o
schema, e **apresente ao usuário**. Mantenha `draft: true`. **Pare e espere aprovação.**

⚠️ **Entregue o link do localhost de CADA artigo** (`http://localhost:4321/posts/<slug>/`) — o
usuário revisa no navegador, artigo por artigo, não no terminal. Suba o dev server antes.

#### Imagem no corpo — regra atual

**Coloque a imagem onde o produto é citado no texto**, junto do argumento que o justifica.

- ❌ **Não** use bloco rígido `## N. Produto` + imagem em todo produto: fica monótono e previsível.
- ✅ Nem todo produto precisa de seção numerada — só quando o texto comporta.
- ✅ Mas **todo produto citado no corpo leva a imagem ali**, não só no card do rodapé.

#### Coerência produto ↔ texto (as duas metades da mesma regra)

- **Citou como necessário, tem que vender.** Se o texto diz que algo é preciso ter (timer de
  tomada, mídia filtrante, kit de teste de amônia, condicionador de água), esse item **entra na
  lista de produtos com botão**.
- **O que a tese rejeita, sai da lista.** Se o post argumenta contra um item, ele **não pode**
  aparecer no frontmatter, na tabela comparativa nem no corpo. Ao remover, varra os **três**
  lugares — foi o erro do post de plantado, que continuou vendendo substrato fértil e pastilha
  depois de o texto explicar que ali não há raiz para nutrir.

#### Estrutura por tipo

- **Listicle (Top N):** intro → "Como avaliamos" → `<ComparisonTable>` → produtos (imagem +
  análise real + prós/contras de fontes + veredicto/selo ✅ Abanou + `<AffiliateButton>`) →
  "Como escolher" → FAQ. **2000-3000 pal.**
- **Comparativo / review:** **1500-2500 pal.**
- **Aquarismo (trilha da tarde):** **não economize** — é onde o erro mata bicho. Explique o
  mecanismo antes do produto, com número e fonte. Os posts de 14-20/09 ficaram entre **2.300 e
  3.500 palavras** e são a referência de profundidade.

⚠️ **Aprofunde o tema antes do produto.** Explique o problema e **por que** aquele produto resolve.
Post que vai direto para a vitrine parece caça-níquel.

⚠️ **Cross-link interno** entre posts que se completam (ex.: filtragem → ciclagem; superlotação →
aquário do betta). No corpo, contextual, 1-2 por artigo.

### Gate final — LIBERAÇÃO (usuário)

Só **após o "ok" final**: confirme as `pubDate` futuras (mantendo `draft: true`), apague imagens
órfãs de produtos descartados nas correções, `git add -A`, commite e **dê push**. O push é o que
efetivamente agenda — o `publish-scheduled` (n8n) vira `draft:false` na data e hora.

```bash
git -C E:/Site_afiliado_2 pull --rebase --autostash
```

O repo local costuma estar atrás dos commits automáticos de publicação — rebase antes de commitar.

## Diretrizes de tom

- Honesto (aponta defeitos reais), acessível, direto, brasileiro (R$), sem hipérbole.
- UTM sempre `abanou` (o `AffiliateButton` cuida).
- `<AffiliateDisclosure />` e o compromisso do **Gatil Irmã Francisca (10%)** já são do site.
- **Não sugerir nem vincular redes sociais** — o usuário não quer perfis sociais nos sites.
- **Endosso pessoal ("indicação do Abanou", "o que usamos aqui") só entra quando o usuário
  autorizar explicitamente** — é a experiência dele, não do agente. Quando ele autoriza, vale
  como diferencial e pode substituir a ausência de nota.

## Erros a evitar

- Pular um gate / commitar ou agendar sem aprovação.
- Inventar specs, composição, dado de espécie ou link.
- Não checar estoque; deixar produto sem imagem no corpo.
- Recomendar item que o próprio texto desaconselha.
- Dimensionar equipamento sem bater com a litragem citada no mesmo post.
- Usar foto de espécie errada ou sem checar licença.
- Título/descrição curtos demais; esquecer `pubDate`, `faq` ou `npm run og`.
