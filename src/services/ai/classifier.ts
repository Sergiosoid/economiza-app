/**
 * Classificador simples de produtos usando heurísticas e regex
 * 
 * Funcionalidades:
 * - Normaliza nomes de produtos
 * - Detecta categoria básica
 * - Detecta marca
 * - Classifica itens
 * - Agrupa itens semelhantes
 * - Detecta duplicidade
 */

export type ProductCategory = 'Alimentação' | 'Limpeza' | 'Higiene' | 'Bebidas' | 'Outros';

export interface ClassifiedItem {
  originalName: string;
  normalizedName: string;
  category: ProductCategory;
  brand?: string;
  baseName: string;
}

export interface ProductItem {
  name: string;
  qty?: number;
  price?: number;
  tax?: number;
}

// ============================================================
// CONFIGURAÇÕES E DADOS
// ============================================================

// Palavras-chave por categoria
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  'Alimentação': [
    'arroz', 'feijão', 'macarrão', 'massa', 'açúcar', 'sal', 'óleo', 'azeite',
    'farinha', 'trigo', 'milho', 'cereal', 'biscoito', 'bolacha', 'pão', 'pães',
    'leite', 'queijo', 'manteiga', 'margarina', 'iogurte', 'requeijão',
    'carne', 'frango', 'peixe', 'ovo', 'ovos', 'linguiça', 'salsicha',
    'fruta', 'verdura', 'legume', 'tomate', 'cebola', 'batata', 'banana',
    'chocolate', 'doce', 'geleia', 'mel', 'achocolatado', 'café', 'chá',
    'molho', 'tempero', 'condimento', 'conserva', 'enlatado',
  ],
  'Limpeza': [
    'sabão', 'detergente', 'desinfetante', 'água sanitária', 'sabonete',
    'esponja', 'vassoura', 'pano', 'papel higiênico', 'papel toalha',
    'saco', 'saco de lixo', 'lixo', 'sabão em pó', 'amaciante',
    'limpa vidro', 'multiuso', 'desengordurante', 'tira mancha',
    'alvejante', 'cloro', 'álcool', 'perfume', 'inseticida',
  ],
  'Higiene': [
    'shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'creme dental',
    'escova de dente', 'fio dental', 'desodorante', 'antitranspirante',
    'absorvente', 'protetor solar', 'hidratante', 'creme', 'pomada',
    'algodão', 'curativo', 'gaze', 'lenço', 'toalha', 'fralda',
  ],
  'Bebidas': [
    'refrigerante', 'suco', 'água', 'água mineral', 'cerveja', 'vinho',
    'energético', 'isotônico', 'chá', 'mate', 'café', 'achocolatado',
    'leite', 'iogurte', 'bebida láctea', 'água de coco', 'água tônica',
  ],
  'Outros': [],
};

// Marcas comuns (heurística)
const BRAND_PATTERNS = [
  // Marcas conhecidas
  /\b(coca.?cola|pepsi|nestlé|nestle|danone|vigor|itambé|itambe)\b/i,
  /\b(sadia|perdigão|seara|friboi|swift)\b/i,
  /\b(omo|ariel|comfort|persil|tide)\b/i,
  /\b(pantene|head.?shoulders|seda|l'oreal|loreal)\b/i,
  /\b(colgate|sorriso|close.?up|sensodyne)\b/i,
  /\b(nivea|dove|rexona|rexona|rexona)\b/i,
  /\b(mondelez|kraft|nestlé|nestle)\b/i,
  /\b(bom.bril|assolan|ype|veja)\b/i,
  /\b(ambev|skol|brahma|antarctica)\b/i,
  /\b(marilan|piraquê|piraque|bauducco)\b/i,
];

// Padrões para remover (códigos, números soltos, etc.)
const CLEANUP_PATTERNS = [
  /\b\d{4,}\b/g, // Números com 4+ dígitos (códigos)
  /\b\d+[xX]\d+\b/g, // Quantidades como "2x3"
  /\b\d+[gGkKmMlL]\b/g, // Unidades como "500g", "1L"
  /\b\d+[%]\b/g, // Percentuais
  /\b(R\$|RS?)\s*\d+[.,]\d+\b/g, // Valores monetários
  /\b(UN|PC|KG|LT|ML|GR|G|L|M)\b/g, // Unidades de medida
  /\b(CAIXA|CX|PCT|PACOTE|PAC|UNIDADE|UN)\b/g, // Palavras de unidade
  /\b\d+\s*(X|X)\s*\d+\b/g, // Multiplicações
];

// Palavras comuns a remover
const STOP_WORDS = [
  'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
  'para', 'com', 'por', 'sem', 'sob', 'sobre', 'entre', 'até',
  'a', 'o', 'e', 'ou', 'mas', 'que', 'qual', 'quais',
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'kg', 'g', 'l', 'ml', 'un', 'pc', 'cx', 'pct',
];

// ============================================================
// FUNÇÕES DE NORMALIZAÇÃO
// ============================================================

/**
 * Normaliza o nome de um produto removendo códigos, números e palavras desnecessárias
 */
export function normalizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  let normalized = name.trim();

  // Converter para minúsculas
  normalized = normalized.toLowerCase();

  // Remover padrões de limpeza
  for (const pattern of CLEANUP_PATTERNS) {
    normalized = normalized.replace(pattern, ' ');
  }

  // Remover caracteres especiais exceto espaços e hífens
  normalized = normalized.replace(/[^\w\s-]/g, ' ');

  // Remover múltiplos espaços
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Remover stop words
  const words = normalized.split(' ');
  const filteredWords = words.filter(word => {
    const cleanWord = word.trim();
    return cleanWord.length > 1 && !STOP_WORDS.includes(cleanWord);
  });

  normalized = filteredWords.join(' ').trim();

  // Capitalizar primeira letra de cada palavra
  normalized = normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return normalized || name; // Fallback para nome original se ficar vazio
}

/**
 * Extrai o nome base do produto (sem marca, tamanho, etc.)
 */
function extractBaseName(name: string): string {
  let baseName = normalizeName(name);

  // Remover marca se detectada
  for (const pattern of BRAND_PATTERNS) {
    baseName = baseName.replace(pattern, '').trim();
  }

  // Remover tamanhos/pesos comuns no final
  baseName = baseName.replace(/\s+\d+[gGkKmMlL]\s*$/i, '');
  baseName = baseName.replace(/\s+\d+[ml]\s*$/i, '');

  // Remover múltiplos espaços novamente
  baseName = baseName.replace(/\s+/g, ' ').trim();

  return baseName || name;
}

// ============================================================
// FUNÇÕES DE DETECÇÃO
// ============================================================

/**
 * Detecta a categoria do produto baseado em palavras-chave
 */
export function detectCategory(name: string): ProductCategory {
  if (!name || typeof name !== 'string') {
    return 'Outros';
  }

  const lowerName = name.toLowerCase();
  const scores: Record<ProductCategory, number> = {
    'Alimentação': 0,
    'Limpeza': 0,
    'Higiene': 0,
    'Bebidas': 0,
    'Outros': 0,
  };

  // Contar matches por categoria
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Outros') continue;

    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        scores[category as ProductCategory]++;
      }
    }
  }

  // Encontrar categoria com maior score
  let maxScore = 0;
  let detectedCategory: ProductCategory = 'Outros';

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category as ProductCategory;
    }
  }

  // Se nenhuma categoria teve match, verificar padrões específicos
  if (maxScore === 0) {
    // Padrões específicos
    if (/\b(refrigerante|suco|água|cerveja|vinho|bebida)\b/i.test(lowerName)) {
      return 'Bebidas';
    }
    if (/\b(sabão|detergente|limpeza|limpar)\b/i.test(lowerName)) {
      return 'Limpeza';
    }
    if (/\b(shampoo|sabonete|pasta|dente|higiene)\b/i.test(lowerName)) {
      return 'Higiene';
    }
    if (/\b(comida|alimento|comestível)\b/i.test(lowerName)) {
      return 'Alimentação';
    }
  }

  return detectedCategory;
}

/**
 * Detecta a marca do produto usando padrões conhecidos
 */
export function detectBrand(name: string): string | undefined {
  if (!name || typeof name !== 'string') {
    return undefined;
  }

  const lowerName = name.toLowerCase();

  // Verificar padrões de marca
  for (const pattern of BRAND_PATTERNS) {
    const match = lowerName.match(pattern);
    if (match) {
      // Capitalizar primeira letra
      const brand = match[0].trim();
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }

  // Tentar detectar marca no início do nome (primeiras palavras)
  const words = lowerName.split(/\s+/);
  if (words.length > 1) {
    const firstWord = words[0];
    // Se a primeira palavra parece uma marca (maiúsculas ou nome próprio)
    if (firstWord.length > 2 && /^[A-Z]/.test(name.split(/\s+/)[0])) {
      return name.split(/\s+/)[0];
    }
  }

  return undefined;
}

// ============================================================
// FUNÇÕES DE CLASSIFICAÇÃO
// ============================================================

/**
 * Classifica um item completo (normaliza, detecta categoria e marca)
 */
export function classifyItem(item: ProductItem): ClassifiedItem {
  const originalName = item.name || '';
  const normalizedName = normalizeName(originalName);
  const category = detectCategory(normalizedName);
  const brand = detectBrand(originalName);
  const baseName = extractBaseName(normalizedName);

  return {
    originalName,
    normalizedName,
    category,
    brand,
    baseName,
  };
}

// ============================================================
// FUNÇÕES DE AGRUPAMENTO E DUPLICIDADE
// ============================================================

/**
 * Calcula similaridade entre duas strings usando Levenshtein simplificado
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Similaridade por palavras comuns
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  const jaccardSimilarity = intersection.size / union.size;

  // Similaridade por substring (uma contém a outra)
  let substringSimilarity = 0;
  if (s1.includes(s2) || s2.includes(s1)) {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length >= s2.length ? s1 : s2;
    substringSimilarity = shorter.length / longer.length;
  }

  // Retornar a maior similaridade
  return Math.max(jaccardSimilarity, substringSimilarity * 0.8);
}

/**
 * Verifica se dois itens são duplicados
 */
export function isDuplicate(
  item1: ClassifiedItem | ProductItem,
  item2: ClassifiedItem | ProductItem
): boolean {
  const name1 = 'normalizedName' in item1 ? item1.normalizedName : item1.name;
  const name2 = 'normalizedName' in item2 ? item2.normalizedName : item2.name;

  if (!name1 || !name2) return false;

  // Normalizar ambos
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  // Se são idênticos após normalização
  if (norm1.toLowerCase() === norm2.toLowerCase()) {
    return true;
  }

  // Calcular similaridade
  const similarity = calculateSimilarity(norm1, norm2);

  // Considerar duplicado se similaridade > 0.85
  return similarity > 0.85;
}

/**
 * Agrupa itens semelhantes em um array
 */
export function groupSimilarItems(
  items: Array<ProductItem | ClassifiedItem>
): Array<Array<ProductItem | ClassifiedItem>> {
  if (!items || items.length === 0) {
    return [];
  }

  const groups: Array<Array<ProductItem | ClassifiedItem>> = [];
  const processed = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    if (processed.has(i)) continue;

    const group: Array<ProductItem | ClassifiedItem> = [items[i]];
    processed.add(i);

    // Procurar itens similares
    for (let j = i + 1; j < items.length; j++) {
      if (processed.has(j)) continue;

      if (isDuplicate(items[i], items[j])) {
        group.push(items[j]);
        processed.add(j);
      }
    }

    groups.push(group);
  }

  return groups;
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Classifica uma lista de itens
 */
export function classifyItems(items: ProductItem[]): ClassifiedItem[] {
  return items.map(item => classifyItem(item));
}

/**
 * Obtém estatísticas de classificação
 */
export function getClassificationStats(items: ClassifiedItem[]): {
  total: number;
  byCategory: Record<ProductCategory, number>;
  withBrand: number;
} {
  const stats = {
    total: items.length,
    byCategory: {
      'Alimentação': 0,
      'Limpeza': 0,
      'Higiene': 0,
      'Bebidas': 0,
      'Outros': 0,
    } as Record<ProductCategory, number>,
    withBrand: 0,
  };

  for (const item of items) {
    stats.byCategory[item.category]++;
    if (item.brand) {
      stats.withBrand++;
    }
  }

  return stats;
}

