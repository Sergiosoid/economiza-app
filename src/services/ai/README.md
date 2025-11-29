# Classificador de Produtos - Economiza

## 📋 Descrição

Classificador simples e leve que usa heurísticas e regex para classificar produtos de notas fiscais. Não requer IA externa ou dependências pesadas.

## 🎯 Funcionalidades

- ✅ Normalização de nomes (remove códigos, números, unidades)
- ✅ Detecção de categoria (5 categorias básicas)
- ✅ Detecção de marca (heurística com padrões conhecidos)
- ✅ Classificação completa de itens
- ✅ Agrupamento de itens semelhantes
- ✅ Detecção de duplicidade

## 📦 Categorias

1. **Alimentação** - 50+ palavras-chave
2. **Limpeza** - 20+ palavras-chave
3. **Higiene** - 15+ palavras-chave
4. **Bebidas** - 15+ palavras-chave
5. **Outros** - Fallback

## 🔧 Funções Principais

### `normalizeName(name: string)`

Limpa e normaliza o nome do produto:

```typescript
normalizeName("COCA COLA 2L REFRIGERANTE")
// Retorna: "Coca Cola Refrigerante"
```

**Remove:**
- Códigos (números com 4+ dígitos)
- Unidades de medida (500g, 1L, etc.)
- Valores monetários
- Stop words (de, da, do, etc.)

### `detectCategory(name: string)`

Detecta a categoria do produto:

```typescript
detectCategory("Arroz Tio João 5kg")
// Retorna: "Alimentação"
```

**Estratégia:**
- Conta matches de palavras-chave por categoria
- Retorna categoria com maior score
- Fallback para "Outros" se nenhuma match

### `detectBrand(name: string)`

Detecta a marca do produto:

```typescript
detectBrand("Coca-Cola 2L")
// Retorna: "Coca-cola"
```

**Padrões suportados:**
- Coca-Cola, Pepsi
- Nestlé, Danone, Vigor
- Sadia, Perdigão, Seara
- Omo, Ariel, Comfort
- Pantene, Head & Shoulders, Seda
- Colgate, Sorriso
- Nivea, Dove, Rexona
- E mais...

### `classifyItem(item: ProductItem)`

Classifica um item completo:

```typescript
const item = {
  name: "ARROZ TIO JOAO 5KG",
  qty: 2,
  price: 15.90,
  tax: 0
};

const classified = classifyItem(item);
// Retorna:
// {
//   originalName: "ARROZ TIO JOAO 5KG",
//   normalizedName: "Arroz Tio Joao",
//   category: "Alimentação",
//   brand: "Tio Joao",
//   baseName: "Arroz"
// }
```

### `groupSimilarItems(items: ProductItem[])`

Agrupa itens semelhantes:

```typescript
const items = [
  { name: "ARROZ TIO JOAO 5KG" },
  { name: "Arroz Tio João 5kg" },
  { name: "FEIJAO CALDO BOM 1KG" }
];

const groups = groupSimilarItems(items);
// Retorna: [
//   [{ name: "ARROZ TIO JOAO 5KG" }, { name: "Arroz Tio João 5kg" }],
//   [{ name: "FEIJAO CALDO BOM 1KG" }]
// ]
```

### `isDuplicate(a, b)`

Verifica se dois itens são duplicados:

```typescript
isDuplicate(
  { name: "ARROZ TIO JOAO 5KG" },
  { name: "Arroz Tio João 5kg" }
)
// Retorna: true (similaridade > 85%)
```

## 💡 Exemplo de Uso

### Classificar um item

```typescript
import { classifyItem } from '../services/ai';

const item = {
  name: "COCA COLA 2L REFRIGERANTE",
  qty: 1,
  price: 8.50,
  tax: 0
};

const classified = classifyItem(item);
console.log(classified);
// {
//   originalName: "COCA COLA 2L REFRIGERANTE",
//   normalizedName: "Coca Cola Refrigerante",
//   category: "Bebidas",
//   brand: "Coca Cola",
//   baseName: "Coca Cola Refrigerante"
// }
```

### Classificar lista de itens

```typescript
import { classifyItems } from '../services/ai';

const items = [
  { name: "ARROZ TIO JOAO 5KG", qty: 2, price: 15.90 },
  { name: "FEIJAO CALDO BOM 1KG", qty: 1, price: 8.50 },
  { name: "DETERGENTE YPE 500ML", qty: 1, price: 3.90 }
];

const classified = classifyItems(items);
// Array de ClassifiedItem
```

### Agrupar itens semelhantes

```typescript
import { groupSimilarItems } from '../services/ai';

const items = [
  { name: "ARROZ TIO JOAO 5KG" },
  { name: "Arroz Tio João 5kg" },
  { name: "FEIJAO CALDO BOM 1KG" }
];

const groups = groupSimilarItems(items);
// Agrupa itens duplicados/similares
```

### Obter estatísticas

```typescript
import { classifyItems, getClassificationStats } from '../services/ai';

const items = [/* ... */];
const classified = classifyItems(items);
const stats = getClassificationStats(classified);

console.log(stats);
// {
//   total: 10,
//   byCategory: {
//     'Alimentação': 5,
//     'Limpeza': 2,
//     'Higiene': 1,
//     'Bebidas': 1,
//     'Outros': 1
//   },
//   withBrand: 7
// }
```

## 🔄 Integração no Fluxo

### Opção 1: Classificar antes de enviar ao backend

```typescript
import { classifyItems, enrichItemsForSave } from '../services/ai';

// Ao receber dados do fetchReceipt
const receiptData = await callFetchReceipt(url);

// Classificar itens
const classified = classifyItems(receiptData.items);

// Enriquecer com dados de classificação
const enrichedItems = enrichItemsForSave(receiptData.items);

// Enviar ao backend com dados classificados
await saveReceiptToSupabase({
  ...receiptData,
  items: enrichedItems
});
```

### Opção 2: Classificar no backend (recomendado)

O backend já tem `product_matcher` que faz classificação. O classificador do app pode ser usado para:
- Preview antes de salvar
- Validação no frontend
- Estatísticas em tempo real

## 📊 Algoritmo de Similaridade

Usa **Jaccard Similarity** e **Substring Matching**:

1. Divide nomes em palavras
2. Calcula interseção/união de palavras
3. Verifica se um nome contém o outro
4. Retorna maior similaridade

**Threshold:** 85% para considerar duplicado

## 🎨 Heurísticas Utilizadas

### Normalização
- Remove códigos (4+ dígitos)
- Remove unidades (kg, g, L, ml)
- Remove valores monetários
- Remove stop words
- Capitaliza palavras

### Categorização
- Contagem de palavras-chave
- Score por categoria
- Fallback para "Outros"

### Detecção de Marca
- Padrões regex conhecidos
- Primeira palavra (se parece marca)
- Case-insensitive matching

## ⚡ Performance

- **Leve**: Apenas regex e operações de string
- **Rápido**: < 1ms por item
- **Sem dependências**: TypeScript puro
- **Escalável**: Funciona com milhares de itens

## 🚀 Próximos Passos

1. Integrar no fluxo de salvamento
2. Adicionar mais palavras-chave conforme necessário
3. Melhorar detecção de marca com mais padrões
4. Ajustar threshold de similaridade se necessário

## 📝 Notas

- O classificador é **heurístico** e pode ter falsos positivos
- Categorias podem ser ajustadas conforme necessário
- Marcas podem ser adicionadas facilmente
- Similaridade pode ser ajustada (threshold)

