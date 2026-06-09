---
name: lote-semanal
description: Gera os posts da semana (seg–sex) para o Abanou (reviews de produtos para cães e gatos). Use quando o usuário digitar /lote-semanal, pedir "gerar a semana" ou "criar os posts da semana". Mix editorial 60/20/20.
---

# Skill: Lote Semanal de Posts — Abanou

Site de reviews de produtos para **cães e gatos**. Reviews/comparativos honestos, com o selo
editorial **✅ Abanou** marcando o que aprovamos.

## Quando usar
Quando o usuário pedir os 5 posts da semana (seg–sex) em lote. Se não passar temas, sugira 5.

## Estratégia editorial (60/20/20)
- **3 listicles** (Top N) — seg, qua, sex — tráfego
- **1 comparativo** (X vs Y) — ter — conversão
- **1 review individual** — qui — autoridade

## Passo 0 — Confirmar (tabela: datas seg–sex, temas, tipos). Só prossiga após o "ok".

## Passo 1 — Coletar produtos + links de afiliado

⚠️ Use a **PÁGINA DO PRODUTO específico**, nunca uma URL de busca. Via Claude in Chrome use
**`javascript_tool`** (NÃO screenshots — páginas penduram no `document_idle`). Pule patrocinados
(href `click1`/`mclics`); pegue o 1º resultado **orgânico**.

Roteamento de loja (ver CLAUDE.md):
- **Ração/petiscos/consumíveis → Petz** (modelo de cupom **`ABANOU`**; **pode exibir preço**).
- **Gadgets/duráveis → Amazon** (SiteStripe, tag `abanou-20`; **preço OCULTO** — regra Amazon/PA-API).
- **Plano de saúde → PetLove** (`<PlanCallout>`). **Cursos → Hotmart**.

Por produto, coletar: **nome, marca, rating, imagem (mlstatic, variante `_2X_..._-E.webp`)** e o
**link de afiliado**:
- **Amazon:** copie o link do **SiteStripe** logado na amazon.com.br (já vem com a tag). Sem preço.
- **Petz:** link do produto no painel `parceiropetz.com.br`; lembre do cupom `ABANOU` no post.
- Preço (só Petz): leia `[itemprop="price"]` da página do produto (não o carrossel/parcela).

**Pegadinhas:** filtro de privacidade bloqueia retornar URLs com query → retorne só o trecho
essencial; clipboard pode estar bloqueado → leia do DOM; páginas que não carregam → pegue outro produto.

## Passo 2 — Pesquisa externa (≥2 fontes)
Specs/composição reais: veterinários e portais com revisão veterinária, fabricantes de ração
(Premier, Golden, Royal Canin, Hill's, N&D), Reclame Aqui, YouTube pet. **Regra de ouro: nunca
invente specs/composição.** Saúde animal: tom informativo, não prescritivo ("consulte um veterinário").

## Passo 3 — Baixar imagens
JSON `[{id,name,brand,rating,image,stores:[{store:'amazon'|'petz'|'petlove'|'hotmart',url}]}]` →
`node scripts/search-products.mjs --file scripts/products-<slug>.json` (WebP em `public/images/produtos/`).
Confira tamanhos < 2KB = quebrada → remova.

## Passo 4 — Scaffold + frontmatter
`node scripts/scaffold-post.mjs --data ... --slug "<slug>" --category <cat> --title "<título ≤70>"`.
Categorias: `racao | petiscos | alimentadores | tecnologia-pet | passeio | conforto | higiene | brinquedos | plano-de-saude | saude-cuidados | guias`.
Frontmatter: `pubDate`, `author: 'Márcio Costa'`, `tags` com o **animal** (`cães/gatos/peixes/outros`),
`faq` espelhando a seção FAQ (texto plano), `featured: true` nos 2-3 de maior apelo.
**Petz pode exibir `price` + `priceCheckedAt`; Amazon NÃO** (manter oculto).

## Gate de texto — preencher com qualidade
Estrutura por tipo (listicle 2000-3000 / comparativo e review 1500-2500 pal.):
- ⚠️ **Imagem inline no corpo:** logo após cada `## N. Produto`, `![Nome](/images/produtos/<id>.webp)` — não basta no card do rodapé.
- Listicle: intro → "Como avaliamos" → `<ComparisonTable>` → por produto (imagem + análise real + prós/contras de fontes + veredicto/selo ✅ Abanou + `<AffiliateButton>`) → "Como escolher" → FAQ.
- Botões Petz abrem o modal do cupom `ABANOU` automaticamente.
- `<AffiliateDisclosure />` e o compromisso do **Gatil Irmã Francisca (10%)** já fazem parte do site.

## Apresentar o lote e ESPERAR aprovação
Não commitar nem mudar `draft:false` sem o "ok" do usuário. Os posts publicam nas `pubDate` via workflow.

## Tom
Honesto (aponta defeitos reais), acessível, direto, brasileiro (R$), sem hipérbole. UTM sempre `abanou` (o `AffiliateButton` cuida).
