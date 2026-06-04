// Eixo "animal" do site, implementado como TAGS nos posts (não como categorias).
// Cada post entra em 1 categoria (tipo de produto) e recebe 1+ tags de animal.
// As páginas /para/[slug]/ listam os posts cuja tag casa com `match`.

export interface Animal {
  slug: string;       // usado na URL: /para/<slug>/
  label: string;      // rótulo exibido
  emoji: string;
  tagCanonica: string; // tag recomendada para usar nos posts
  match: string[];     // sinônimos aceitos (sem acento, minúsculo)
}

export const ANIMALS: Animal[] = [
  {
    slug: 'caes',
    label: 'Cães',
    emoji: '🐶',
    tagCanonica: 'cães',
    match: ['caes', 'cao', 'cachorro', 'cachorros', 'cadela', 'caninos'],
  },
  {
    slug: 'gatos',
    label: 'Gatos',
    emoji: '🐱',
    tagCanonica: 'gatos',
    match: ['gatos', 'gato', 'felinos', 'gata'],
  },
  {
    slug: 'peixes',
    label: 'Peixes',
    emoji: '🐠',
    tagCanonica: 'peixes',
    match: ['peixes', 'peixe', 'aquarismo', 'aquario', 'aquarios'],
  },
  {
    slug: 'outros',
    label: 'Outros pets',
    emoji: '🐾',
    tagCanonica: 'outros',
    match: ['outros', 'aves', 'passaros', 'roedores', 'hamster', 'coelho', 'repteis'],
  },
];

// Normaliza uma string para comparação (remove acentos e baixa caixa).
export function normalizeTag(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

// True se algum tag do post pertence ao animal.
export function postMatchesAnimal(tags: string[], animal: Animal): boolean {
  const set = new Set(animal.match);
  return (tags ?? []).some((t) => set.has(normalizeTag(t)));
}
