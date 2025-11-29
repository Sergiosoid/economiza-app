/**
 * Tela de Relatório de Execução
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { downloadExecutionPDF } from '../services/shoppingListsApi';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ShoppingListSyncResponse } from '../types/shoppingList';

const ExecutionReportScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const { executionId } = route.params as { executionId: string };
  const [report, setReport] = useState<ShoppingListSyncResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Por enquanto, o relatório completo vem do sync response
    // Em produção, poderia buscar do endpoint GET /executions/{id}
    // Por enquanto, apenas preparar estrutura
    setLoading(false);
  }, [executionId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfBase64 = await downloadExecutionPDF(executionId);
      const fileUri = FileSystem.cacheDirectory + `relatorio_${executionId}.pdf`;
      
      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
        console.log('PDF compartilhado com sucesso:', fileUri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
      }
    } catch (error: any) {
      console.error('Erro ao baixar PDF:', error);
      Alert.alert('Erro', error.message || 'Erro ao baixar PDF');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED_AND_MATCHED':
        return '#4CAF50';
      case 'PRICE_HIGHER_THAN_EXPECTED':
      case 'QUANTITY_DIFFERENT':
        return '#FFC107';
      case 'PLANNED_NOT_PURCHASED':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PLANNED_AND_MATCHED: 'OK',
      PLANNED_NOT_PURCHASED: 'Não Comprado',
      PURCHASED_NOT_PLANNED: 'Extra',
      PRICE_HIGHER_THAN_EXPECTED: 'Preço Alto',
      PRICE_LOWER_THAN_EXPECTED: 'Preço Baixo',
      QUANTITY_DIFFERENT: 'Qtd Diferente',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Relatório de Execução</Text>
        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: colors.primary }]}
          onPress={handleDownloadPDF}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.downloadButtonText, { color: colors.textOnPrimary }]}>
              Baixar PDF
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {report && (
        <>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Resumo</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Planejado:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                R$ {report.summary.planned_total?.toFixed(2) || 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Real:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                R$ {report.summary.real_total.toFixed(2)}
              </Text>
            </View>
            {report.summary.difference_percent !== null && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Diferença:</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        Math.abs(report.summary.difference_percent) < 3
                          ? '#4CAF50'
                          : Math.abs(report.summary.difference_percent) < 10
                          ? '#FFC107'
                          : '#F44336',
                    },
                  ]}
                >
                  {report.summary.difference_percent > 0 ? '+' : ''}
                  {report.summary.difference_percent.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.itemsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Itens</Text>
            {report.items.map((item, index) => (
              <View
                key={index}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemDescription, { color: colors.textPrimary }]}>
                    {item.description}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                {item.real_total && (
                  <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                    R$ {item.real_total.toFixed(2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  downloadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryCard: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExecutionReportScreen;

