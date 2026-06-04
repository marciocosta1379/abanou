# Abanou — Site de Reviews de Produtos Pet (Amazon + Petz + PetLove)

## Projeto

Site estático em **Astro 4** com MDX, hospedado na Hostinger (FTP). Nicho: produtos para **cães e gatos** (ração, comedouros, tecnologia pet, conforto, higiene, brinquedos, plano de saúde). Reviews/comparativos honestos, com o selo editorial **✅ Abanou** marcando o que aprovamos.

Domínio: `abanou.com.br`

### Monetização — 3 motores
- **Amazon Associados** (principal): gadgets/duráveis. Tag de associado em `.env` (`AMAZON_AFFILIATE_TAG`, ex.: `abanou-20`). Links via **SiteStripe**.
- **Petz (Parceiro Petz)**: ração/alimentação. Modelo de **cupom**. Cupom/código de convite: **`ABANOU`**. Loja de parceiro: `https://www.petz.com.br/parceiro/abanou`. Nos posts, linkar o produto na Petz **e** exibir o cupom `ABANOU` (a comissão é creditada quando o cupom é usado no checkout).
- **PetLove Saúde**: plano de saúde pet (recorrência). Usado via componente `<PlanCallout>`.

### Roteamento de loja
- Ração/petiscos/consumíveis → **Petz**
- Gadgets/duráveis → **Amazon**
- Plano de saúde → **PetLove**

### Compromisso social
**10% de tudo que o site arrecada é doado para o [Gatil Irmã Francisca](https://gatilirmafrancisca.org.br/)** (resgate de gatos). Mencionado no rodapé (todas as páginas) e na página Sobre. Manter essa mensagem em novos conteúdos quando fizer sentido.

## Comandos

```bash
npm run dev          # Dev server em localhost:4321
npm run build        # Gera dist/
npm run deploy       # Build + pagefind + upload FTP para Hostinger
npm run search       # Baixa imagens dos produtos (search-products.mjs)
npm run scaffold     # Gera MDX a partir de JSON de produtos
npm run publish-scheduled  # Publica posts agendados com pubDate <= hoje
```

> ⚠️ **Atualização automática de preço está DESATIVADA.** O site base usava a API do Mercado Livre; a Amazon (PA-API) só libera após ~3 vendas qualificadas em 180 dias. Por isso o **preço fica oculto** no lançamento (os cards mostram "Confira o preço atualizado na loja"). Quando a PA-API for liberada, reativar a atualização de preço (portando o antigo `update-prices.mjs` para a PA-API).

## Fluxo para criar um post

1. **Coletar links de afiliado**:
   - Amazon: SiteStripe na `amazon.com.br` (link já vem com a tag). Coletar nome, marca, imagem — **sem preço**.
   - Petz: link/cupom no painel `parceiropetz.com.br`.
2. **Pesquisar** specs/composição/opiniões em fontes confiáveis (ver abaixo).
3. **Montar JSON** com `stores` (sem `price`) e rodar `node scripts/search-products.mjs --file scripts/products-xxx.json` (baixa imagens em WebP).
4. **Scaffold**: `node scripts/scaffold-post.mjs --data scripts/products-XXXXX.json --slug "melhores-xxx" --category racao --title "..."` → cria MDX com `draft: true` e `[TODO]`s.
5. **Preencher** os `[TODO]`s com análise real.
6. **Publicar**: `draft: false` + `npm run deploy` (imediato) ou agendar via `pubDate` futura (`publish-scheduled` cuida).

## Modelos de post (templates)

- `templates/post-petz.template.mdx` — modelo pronto para artigos da **Petz** (preço+data, tabela, selo, prós/contras, botões Petz com modal de cupom 10%, lembrete do cupom ABANOU, disclaimer de veterinário e FAQ).
- `templates/post-amazon.template.mdx` — modelo pronto para artigos da **Amazon** (gadgets; **preço oculto**, tag `abanou-20`, sem cupom, tabela sem coluna de preço, selo, prós/contras e FAQ).

Copie o modelo desejado para `src/content/posts/<slug>.mdx` e preencha os `[PLACEHOLDER]`.

## Categorias válidas

`racao` | `petiscos` | `alimentadores` | `tecnologia-pet` | `passeio` | `conforto` | `higiene` | `brinquedos` | `plano-de-saude` | `saude-cuidados` | `guias`

## Eixo "animal" via TAGS (não é categoria)

O site tem **dois eixos**: categoria = **tipo de produto**; animal = **tag**. Cada post entra em **1 categoria** e recebe **tag(s) de animal**. As páginas `/para/<slug>/` (config em `src/config/animals.ts`) listam os posts por animal.

- Tags canônicas: **`cães`**, **`gatos`**, **`peixes`**, **`outros`** (sinônimos como `cachorro`, `gato`, `aquarismo` também casam).
- Ex.: um post "Melhores rações para gatos castrados" → `category: 'racao'`, `tags: ['gatos', ...]`.
- Páginas de animal: `/para/caes/`, `/para/gatos/`, `/para/peixes/`, `/para/outros/` (existem mesmo vazias; preenchem conforme os posts ganham as tags).
- Não criar categoria por animal — usar sempre a tag.

## Componentes disponíveis nos posts MDX

```mdx
import AffiliateButton from '../../components/AffiliateButton.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import ProsCons from '../../components/ProsCons.astro';
import ProductCard from '../../components/ProductCard.astro';
import PlanCallout from '../../components/PlanCallout.astro';
import AbanouSeal from '../../components/AbanouSeal.astro';
```

- `<AffiliateButton href="..." store="amazon|petz|petlove" source="slug" />` — botão de afiliado (cor por loja, UTM `abanou`)
- `<ComparisonTable rows={[{ name, brand, rating, highlight, stores: [{store,url}] }]} source="slug" />`
- `<ProsCons pros={[...]} cons={[...]} />`
- `<ProductCard name="..." stores={[...]} ... />` — card; preço opcional (oculto no lançamento)
- `<PlanCallout url="..." title="..." highlights={[...]} />` — CTA do plano PetLove
- `<AbanouSeal />` — selo "✅ Aprovado pelo Abanou"

## Modelo de produto (frontmatter)

```yaml
products:
  - name: 'Comedouro Automático XYZ'
    brand: 'Marca'
    rating: 4.7
    # price: oculto até liberar a PA-API da Amazon
    stores:
      - store: 'amazon'
        url: 'https://www.amazon.com.br/dp/...?tag=abanou-20'
      - store: 'petz'
        url: 'https://www.petz.com.br/...'
    image: '/images/produtos/comedouro-xyz.webp'
    pros: ['...']
    cons: ['...']
```

## Regras editoriais

- Todo post tem `<AffiliateDisclosure />` (injetado pelo template `[...slug].astro`) com o texto obrigatório: **"Como Associado da Amazon, eu ganho com compras qualificadas."**
- Links de afiliado usam `rel="sponsored nofollow noopener noreferrer"`.
- UTM source é sempre `abanou` (o `AffiliateButton` cuida disso).
- **Não exibir preço fixo da Amazon** (regra da Amazon — só com PA-API). Para **Petz**, pode exibir preço: inclua `price` nos produtos + `priceCheckedAt: 'DD/MM/AAAA'` no frontmatter (a tabela mostra a data e some a coluna de preço quando não há). Use o **preço normal** (não o de assinante).
- Botões **"Ver na Petz"** abrem automaticamente um **modal lembrando o cupom `ABANOU`** (componente global `CouponModal`).
- Saúde animal: tom informativo, não prescritivo; reforçar "consulte um veterinário".
- Títulos ≤ 70 caracteres; descrições meta ≤ 160.
- Posts saem com `draft: true` por padrão.

## Estratégia de conteúdo (mix 60/20/20)

5 posts/semana (seg-sex), via skill `/lote-semanal`:
- **60% Listicles "Top N"** (seg, qua, sex)
- **20% Comparativos "X vs Y"** (ter)
- **20% Reviews individuais** (qui)

### Fontes confiáveis para pesquisa
- Veterinários / portais com revisão veterinária
- Fabricantes de ração (Premier, Golden, Royal Canin, Hill's, N&D)
- Reclame Aqui (problemas reais)
- YouTube (comportamento, adestramento, review de produtos pet)
- Sites oficiais das marcas de gadgets

**Regra de ouro**: nunca invente specs/composição. Confirme em ≥2 fontes.

## Automação no GitHub Actions

- **`publish-scheduled.yml`** — diariamente 07h BRT — muda `draft: true → false` em posts com `pubDate <= hoje`, faz deploy e notifica o IndexNow (Bing/Yandex).
- (A automação de preços foi removida — ver aviso acima.)

## Estrutura de pastas

- `src/content/posts/` — posts MDX
- `src/pages/` — páginas e templates
- `src/components/` — componentes
- `src/layouts/` — BaseLayout com SEO
- `src/config/site.ts` — config global (nome, URL, autor)
- `scripts/` — automação (search, scaffold, deploy, publish-scheduled)
- `public/images/produtos/` — imagens em WebP

## Credenciais

Em `.env` (não comitar). Ver `.env.example`. Necessário: FTP da Hostinger, `AMAZON_AFFILIATE_TAG`, `PETZ_AFFILIATE_LINK`, `PETLOVE_AFFILIATE_LINK`.

## Pendências externas (configurar fora do código)

- Registrar `abanou.com.br` + hospedagem FTP.
- Inscrever em Amazon Associados, Parceiro Petz e PetLove.
- Criar propriedade GA4 e trocar `G-XXXXXXXXXX` em `BaseLayout.astro`.
- Criar formulário próprio no MailerLite e trocar o ID em `NewsletterForm.astro`.
- A skill `.claude/skills/lote-semanal` ainda menciona o nicho antigo — atualizar quando autorizado.
