/**
 * Função para atualizar o conhecimento do classificador baseado em correções
 */

import { saveClassifierKnowledge } from '../storage/correctionStorage';
import type { ItemCorrection } from '../../types/empacotador';
import type { ProductCategory } from './classifier';

/**
 * Atualiza o conhecimento do classificador com base em uma correção
 */
export async function updateClassifierKnowledge(correction: ItemCorrection): Promise<void> {
  try {
    const pattern = correction.corrected_normalized_name || correction.original_normalized_name;
    
    // Salvar conhecimento com alta confiança (1.0) pois é correção manual
    await saveClassifierKnowledge({
      pattern: pattern.toLowerCase().trim(),
      category: correction.corrected_category,
      brand: correction.corrected_brand,
      confidence: 1.0,
      source: 'correction',
    });

    // Se o nome normalizado foi corrigido, também salvar o padrão original
    if (correction.corrected_normalized_name && 
        correction.corrected_normalized_name !== correction.original_normalized_name) {
      await saveClassifierKnowledge({
        pattern: correction.original_normalized_name.toLowerCase().trim(),
        category: correction.corrected_category,
        brand: correction.corrected_brand,
        confidence: 0.9, // Alta confiança mas não 1.0 pois é mapeamento
        source: 'correction',
      });
    }

    console.log('[classifierKnowledge] Conhecimento atualizado:', {
      pattern,
      category: correction.corrected_category,
      brand: correction.corrected_brand,
    });
  } catch (error) {
    console.error('[classifierKnowledge] Erro ao atualizar conhecimento:', error);
    throw error;
  }
}

/**
 * Atualiza múltiplas correções de uma vez
 */
export async function updateClassifierKnowledgeBatch(corrections: ItemCorrection[]): Promise<void> {
  for (const correction of corrections) {
    await updateClassifierKnowledge(correction);
  }
  console.log(`[classifierKnowledge] ${corrections.length} correções processadas`);
}

/**
 * Recalcula clusters baseado em correções (placeholder para implementação futura)
 */
export async function recalculateClusters(): Promise<void> {
  // TODO: Implementar recálculo de clusters quando necessário
  console.log('[classifierKnowledge] Recalcular clusters (não implementado ainda)');
}

