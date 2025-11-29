/**
 * Serviço de armazenamento local para correções do Empacotador
 * Usa SQLite para persistência
 */

import * as SQLite from 'expo-sqlite';
import type { ItemCorrection, ClassifierKnowledge } from '../../types/empacotador';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Inicializa o banco de dados SQLite
 */
export async function initCorrectionDatabase(): Promise<void> {
  try {
    // Aguardar a Promise de openDatabase resolver
    db = await SQLite.openDatabaseAsync('economiza_corrections.db');
    
    if (!db) {
      throw new Error('Falha ao abrir banco de dados');
    }

    // Safe init: try/catch para cada operação
    try {
      // Criar tabela de correções
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS item_corrections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          receipt_item_id TEXT NOT NULL,
          original_name TEXT NOT NULL,
          original_normalized_name TEXT NOT NULL,
          original_category TEXT NOT NULL,
          original_brand TEXT,
          corrected_normalized_name TEXT,
          corrected_category TEXT NOT NULL,
          corrected_brand TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('[correctionStorage] Erro ao criar tabela item_corrections:', error);
      // Não lançar erro, continuar
    }

    try {
      // Criar tabela de conhecimento do classificador
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS classifier_knowledge (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pattern TEXT NOT NULL,
          category TEXT NOT NULL,
          brand TEXT,
          confidence REAL DEFAULT 1.0,
          source TEXT DEFAULT 'manual',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(pattern, category, brand)
        );
      `);
    } catch (error) {
      console.error('[correctionStorage] Erro ao criar tabela classifier_knowledge:', error);
      // Não lançar erro, continuar
    }

    try {
      // Criar índices
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_corrections_receipt_item 
        ON item_corrections(receipt_item_id);
      `);
    } catch (error) {
      console.error('[correctionStorage] Erro ao criar índice idx_corrections_receipt_item:', error);
      // Não lançar erro, continuar
    }

    try {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_knowledge_pattern 
        ON classifier_knowledge(pattern);
      `);
    } catch (error) {
      console.error('[correctionStorage] Erro ao criar índice idx_knowledge_pattern:', error);
      // Não lançar erro, continuar
    }

    console.log('[correctionStorage] Banco de dados inicializado');
  } catch (error) {
    console.error('[correctionStorage] Erro ao inicializar banco:', error);
    // Não lançar erro, permitir que o app continue funcionando
  }
}

/**
 * Salva uma correção de item
 */
export async function saveCorrection(correction: Omit<ItemCorrection, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    const result = await db!.runAsync(
      `INSERT INTO item_corrections (
        receipt_item_id, original_name, original_normalized_name,
        original_category, original_brand,
        corrected_normalized_name, corrected_category, corrected_brand
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        correction.receipt_item_id,
        correction.original_name,
        correction.original_normalized_name,
        correction.original_category,
        correction.original_brand || null,
        correction.corrected_normalized_name || null,
        correction.corrected_category,
        correction.corrected_brand || null,
      ]
    );

    const id = result.lastInsertRowId;
    console.log(`[correctionStorage] Correção salva: ID ${id}`);
    return id;
  } catch (error) {
    console.error('[correctionStorage] Erro ao salvar correção:', error);
    throw error;
  }
}

/**
 * Busca correções por receipt_item_id
 */
export async function getCorrectionsByReceiptItem(receiptItemId: string): Promise<ItemCorrection[]> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    const result = await db!.getAllAsync<ItemCorrection>(
      `SELECT * FROM item_corrections WHERE receipt_item_id = ? ORDER BY created_at DESC`,
      [receiptItemId]
    );
    return result;
  } catch (error) {
    console.error('[correctionStorage] Erro ao buscar correções:', error);
    return [];
  }
}

/**
 * Busca todas as correções
 */
export async function getAllCorrections(): Promise<ItemCorrection[]> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    const result = await db!.getAllAsync<ItemCorrection>(
      `SELECT * FROM item_corrections ORDER BY created_at DESC`
    );
    return result;
  } catch (error) {
    console.error('[correctionStorage] Erro ao buscar todas as correções:', error);
    return [];
  }
}

/**
 * Salva conhecimento do classificador
 */
export async function saveClassifierKnowledge(
  knowledge: Omit<ClassifierKnowledge, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    // Verificar se já existe
    const existing = await db!.getFirstAsync<ClassifierKnowledge>(
      `SELECT * FROM classifier_knowledge 
       WHERE pattern = ? AND category = ? AND (brand = ? OR (brand IS NULL AND ? IS NULL))`,
      [knowledge.pattern, knowledge.category, knowledge.brand || null, knowledge.brand || null]
    );

    if (existing && existing.id !== undefined) {
      // Atualizar existente
      await db!.runAsync(
        `UPDATE classifier_knowledge 
         SET confidence = ?, source = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [knowledge.confidence, knowledge.source, existing.id]
      );
      return existing.id;
    } else {
      // Inserir novo
      const result = await db!.runAsync(
        `INSERT INTO classifier_knowledge (pattern, category, brand, confidence, source)
         VALUES (?, ?, ?, ?, ?)`,
        [
          knowledge.pattern,
          knowledge.category,
          knowledge.brand || null,
          knowledge.confidence,
          knowledge.source,
        ]
      );
      return result.lastInsertRowId;
    }
  } catch (error) {
    console.error('[correctionStorage] Erro ao salvar conhecimento:', error);
    throw error;
  }
}

/**
 * Busca conhecimento do classificador por padrão
 */
export async function getClassifierKnowledge(pattern: string): Promise<ClassifierKnowledge[]> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    const result = await db!.getAllAsync<ClassifierKnowledge>(
      `SELECT * FROM classifier_knowledge 
       WHERE pattern LIKE ? OR pattern = ?
       ORDER BY confidence DESC`,
      [`%${pattern}%`, pattern]
    );
    return result;
  } catch (error) {
    console.error('[correctionStorage] Erro ao buscar conhecimento:', error);
    return [];
  }
}

/**
 * Busca todo o conhecimento do classificador
 */
export async function getAllClassifierKnowledge(): Promise<ClassifierKnowledge[]> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    const result = await db!.getAllAsync<ClassifierKnowledge>(
      `SELECT * FROM classifier_knowledge ORDER BY confidence DESC, updated_at DESC`
    );
    return result;
  } catch (error) {
    console.error('[correctionStorage] Erro ao buscar todo o conhecimento:', error);
    return [];
  }
}

/**
 * Limpa todas as correções (útil para testes)
 */
export async function clearAllCorrections(): Promise<void> {
  if (!db) {
    await initCorrectionDatabase();
  }

  try {
    await db!.execAsync('DELETE FROM item_corrections');
    console.log('[correctionStorage] Todas as correções foram limpas');
  } catch (error) {
    console.error('[correctionStorage] Erro ao limpar correções:', error);
    throw error;
  }
}

