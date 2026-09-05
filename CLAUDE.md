# Abanou — Site de Reviews de Produtos Pet (Amazon + Petz + PetLove)

## Projeto

Site estático em **Astro 4** com MDX, hospedado na Hostinger (FTP). Nicho: produtos para **cães e gatos** (ração, comedouros, tecnologia pet, conforto, higiene, brinquedos, plano de saúde). Reviews/comparativos honestos, com o selo editorial **✅ Abanou** marcando o que aprovamos.

Domínio: `abanou.com.br`

### Monetização — 3 motores
- **Amazon Associados** (principal): gadgets/duráveis. Tag de associado em `.env` (`AMAZON_AFFILIATE_TAG`, ex.: `abanou-20`). Links via **SiteStripe**.
- **Petz (Parceiro Petz)**: ração/alimentação. Modelo de **cupom**. Cupom/código de convite: **`ABANOU`**. Loja de parceiro: `https://www.petz.com.br/parceiro/abanou`. Nos posts, linkar o produto na Petz **e** exibir o cupom `ABANOU` (a comissão é creditada quando o cupom é usado no checkout).
- **PetLove Saúde**: plano de saúde pet (recorrência). Usado via componente `<PlanCallout>`.

### Roteamento de loja (refinado em 04/09/2026)
- **Medicação e alimentação de cão e gato** (ração, petisco, antipulgas, remédio) → **Petz**
- **Todo o resto** — duráveis, acessórios, higiene, equipamento e **aquarismo inteiro** → **Amazon**
- Plano de saúde → **PetLove** · Cursos → **Hotmart**
- **Mercado Livre é exceção**, só quando o produto certo não existe na Amazon.

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

`racao` | `petiscos` | `alimentadores` | `tecnologia-pet` | `passeio` | `conforto` | `higiene` | `brinquedos` | `plano-de-saude` | `saude-cuidados` | `aquarismo` | `guias`

⚠️ `aquarismo` foi criada em 21/07/2026 para conteúdo de **produtos/equipamento de aquário** (filtro, aquecedor, kit completo etc.) — segue a mesma lógica das outras categorias (tipo de produto), combinada com a tag `peixes` do eixo animal. Não confundir com regra "não criar categoria por animal": essa categoria é sobre o PRODUTO (aquarismo/equipamento), o animal continua sendo a tag `peixes`.

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
- **Aquarismo (trilha 18h) — protocolo de fontes.** Aqui o erro mata animal do leitor:
  parâmetro de água errado, ciclagem mal explicada ou espécie incompatível no mesmo
  aquário. O autor **não mantém os aquários descritos**, então:
  - **Dado de espécie só de base de referência** — FishBase, Seriously Fish, Aqua-Fish ou
    ficha de criadouro/importador sério. Nunca deduzir porte adulto, pH, temperatura,
    dureza (GH/KH) ou litragem mínima por analogia com espécie parecida.
  - **Compatibilidade sempre conferida nos dois sentidos** — "A convive com B" precisa
    valer para os dois, e considerando porte adulto, territorialidade e faixa de água
    ocupada. Na dúvida, dizer que não é seguro.
  - **Ciclagem e química nunca resumidas.** Ciclo do nitrogênio, tempo de maturação e
    faixas de amônia/nitrito/nitrato saem com número e fonte — é o erro nº 1 de iniciante
    e o que mais mata peixe.
  - **Sem primeira pessoa fingida.** Proibido "meu aquário", "criei esse cardume",
    "usei esse filtro". Descrever e citar a fonte.
  - **Litragem e equipamento conferidos** contra a especificação do fabricante, não contra
    o "senso comum" de fórum. Aquecedor pela regra de **1 a 2 W por litro**.
  - **Cruze a fonte internacional com a referência praticada no Brasil.** O Seriously Fish dá
    ~41 L de mínimo para betta; a referência brasileira é **10 L**. O post correto apresenta a
    **faixa** (mínimo praticado → ideal), não um número estrangeiro como se fosse o padrão local.
  - Manter o tom informativo e não prescritivo, como já vale para saúde animal.
- Títulos entre 40-70 caracteres; descrições meta entre 120-160 caracteres. (Não só o máximo — o Bing Webmaster Tools sinaliza título/descrição **curtos demais** como erro de SEO moderado; evitar títulos telegráficos e descrições genéricas de uma linha.)
- Posts saem com `draft: true` por padrão.
- **Imagem de capa:** a foto do **1º produto** da lista vira a capa do post nos cards (home/categorias/`/para/`). **Coloque o produto principal/recomendado em primeiro.** Páginas sem produto usam `public/og-default.png` (logo).
- **Preview de redes sociais/WhatsApp (`og:image`):** é um **cartão social 1200×630 em JPG** (foto do 1º produto + título + marca), gerado por `scripts/make-og-images.mjs` em `public/images/og/<slug>.jpg`. Roda automático no `npm run deploy` (avulso: `npm run og`). **Nunca usar WebP na og:image** — o WhatsApp não renderiza preview WebP. O gerador **pula cartões já existentes** (preserva os renderizados com Arial no Windows, já que o CI Linux não tem Arial). Ao **criar** um post, `npm run og` gera o cartão que falta; ao **reordenar** os produtos de um post, rode `npm run og -- --force` (ou apague o JPG antigo).
- **Imagem no corpo — onde o produto é citado.** A foto entra junto do argumento que justifica o
  produto, não num bloco fixo. **Não** use o padrão rígido `## N. Produto` + imagem em todo produto:
  fica monótono e previsível. Nem todo produto precisa de seção numerada — só quando o texto
  comporta. Mas **todo produto citado no corpo leva a imagem ali**, não só no card do rodapé.
- **Produto ↔ texto: as duas metades da mesma regra.**
  - **Citou como necessário, tem que vender.** Se o texto afirma que algo é preciso ter, o item
    entra na lista de produtos com botão de compra.
  - **O que a tese rejeita, sai da lista.** Se o post argumenta contra um item, ele não pode
    aparecer no frontmatter, na tabela comparativa nem no corpo — varra os **três** lugares.
  - **Dimensionamento tem de fechar com o resto do post** (potência, litragem, medida citada).
- **Verificação de estoque é obrigatória antes de apresentar o lote.** Produto esgotado queima o
  clique. Cheque cada um: `curl -s -A "Mozilla/5.0" "https://www.amazon.com.br/dp/SEU_ASIN" | grep -o 'id="availability".\{0,120\}'`
  — compra possível = disponibilidade positiva **e** `id="add-to-cart-button"` presente. Caso
  ambíguo, confirme no Browser pane. Sem estoque → trocar o produto e apagar a imagem órfã.
- **Imagem de referência não-produto** (espécie, planta, diagrama, esquema): use o **Wikimedia
  Commons** (a API exige header `User-Agent`), **confira a licença**, **confirme que é o objeto
  certo** e **credite no post**. Diagrama próprio: SVG inline com `@media (prefers-color-scheme: dark)`.
- **Endosso pessoal só com autorização explícita do usuário.** "Indicação do Abanou", "o que usamos
  aqui" e afins descrevem a experiência dele, não a do agente — nunca escreva por conta própria.
- **Revisão:** ao terminar cada post, entregue o link `http://localhost:4321/posts/<slug>/`. O
  usuário revisa no navegador, artigo por artigo.

## Estratégia de conteúdo

**10 posts/semana** desde 04/09/2026 — 7 na trilha da manhã (seg-dom) + 3 na trilha da tarde
(ver *Cadência* logo abaixo). Antes eram 7/semana, e antes disso só seg-sex. Via skill
`/lote-semanal`. Tipos da trilha da manhã:
- **Listicles "Top N"** (seg, qua, sex)
- **Comparativo "X vs Y"** (ter)
- **Review individual** (qui)
- **2 posts de fim de semana** (sáb, dom) — tipo/tema flexível, confirmar caso a caso


### Cadência: 10 posts/semana em duas trilhas (desde 04/09/2026)

| Trilha | Horário | Tema | `pubDate` |
|---|---|---|---|
| **Manhã** — 7/semana (todo dia) | 07:00 BRT | cães e gatos | só a data: `pubDate: 2026-09-16` |
| **Tarde** — 3/semana (**ter, qui, sáb**) | 18:00 BRT | **aquarismo** (ver protocolo nas regras editoriais) | **com hora**: `pubDate: 2026-09-16T18:00:00-03:00` |

⚠️ **A hora no `pubDate` do post da tarde é obrigatória.** Sem ela o post vale como
meia-noite e a rodada das 07:00 publica os dois juntos, no mesmo horário. Verificado:
`publish-scheduled.mjs` compara timestamp completo (`pubDate > now`), o YAML converte
`2026-09-16T18:00:00-03:00` em `Date` e o `z.date()` do schema aceita — não precisa
mudar script nem schema.

**Nunca pôr dois posts do mesmo pilar no mesmo dia** — é o que faz os dois competirem
pela mesma busca e dividirem a força entre si. A separação de tema entre as trilhas
existe exatamente para isso.

O disparo das 18h vem do **n8n** (regra cron `0 5 18 * * *`, fuso America/Sao_Paulo,
18:05 para dar folga contra atraso de relógio). Ver [[cadencia-10-por-semana-rede]].

### Fontes confiáveis para pesquisa
- Veterinários / portais com revisão veterinária
- Fabricantes de ração (Premier, Golden, Royal Canin, Hill's, N&D)
- Reclame Aqui (problemas reais)
- YouTube (comportamento, adestramento, review de produtos pet)
- Sites oficiais das marcas de gadgets
- **Aquarismo:** FishBase e Seriously Fish (ficha de espécie), fabricantes de equipamento
  e testes (Sera, JBL, Tetra, Prodac), fóruns e comunidades de aquarismo BR para gotcha
  real — mas **dado numérico sempre da base de referência, não do fórum**

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
