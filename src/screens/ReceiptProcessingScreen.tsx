import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from '../theme/ThemeContext';
import { scanReceipt, consumeCredit, startPurchaseCredits } from "../services/api";
import type { RootStackParamList } from "../navigation/types";
import type { ScanReceiptResponse, ScanReceiptProcessingResponse, ScanReceiptConflictResponse } from "../types/api";

type ReceiptProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ReceiptProcessing">;
type ReceiptProcessingScreenRouteProp = RouteProp<RootStackParamList, "ReceiptProcessing">;

export default function ReceiptProcessingScreen() {
  const { colors } = useTheme();
  const route = useRoute<ReceiptProcessingScreenRouteProp>();
  const navigation = useNavigation<ReceiptProcessingScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { qrCodeUrl } = route.params;

  useEffect(() => {
    processReceipt();
  }, []);

  const processReceipt = async () => {
    try {
      setLoading(true);
      
      // Tentar consumir crédito antes de escanear
      try {
        await consumeCredit('scan', undefined, 1);
      } catch (creditError: any) {
        // Se erro 402 (Payment Required), mostrar modal de compra
        if (creditError?.response?.status === 402) {
          setShowPurchaseModal(true);
          setLoading(false);
          return;
        }
        // Se outro erro, logar mas continuar (pode ser que não precise de crédito)
        console.warn('[ReceiptProcessing] Erro ao consumir crédito:', creditError);
      }
      
      const response = await scanReceipt(qrCodeUrl);

      if ("receipt_id" in response && "status" in response && response.status === "saved") {
        const receiptResponse = response as ScanReceiptResponse;
        navigation.replace("ReceiptDetail", { receiptId: receiptResponse.receipt_id });
      } else if ("status" in response && response.status === "processing") {
        const processingResponse = response as ScanReceiptProcessingResponse;
        Alert.alert(
          "Processando",
          processingResponse.message || "Nota fiscal em processamento. Você será notificado quando estiver pronta.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else if ("detail" in response && "receipt_id" in response) {
        const conflictResponse = response as ScanReceiptConflictResponse;
        Alert.alert(
          "Nota já existente",
          conflictResponse.detail || "Esta nota fiscal já foi cadastrada anteriormente.",
          [
            {
              text: "Ver Detalhes",
              onPress: () => {
                navigation.replace("ReceiptDetail", { receiptId: conflictResponse.receipt_id });
              },
            },
            {
              text: "OK",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Erro ao processar nota:", error);
      Alert.alert(
        "Erro",
        error?.response?.data?.detail || "Erro ao processar nota fiscal. Tente novamente.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    try {
      setShowPurchaseModal(false);
      const purchaseData = await startPurchaseCredits(10); // Comprar 10 créditos
      Alert.alert(
        'Redirecionando para compra',
        'Você será redirecionado para completar a compra de créditos.',
        [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Abrir URL de checkout (usar Linking.openURL)
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.response?.data?.detail || 'Erro ao iniciar compra de créditos.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size={40} color={colors.primary} />
      <Text style={[styles.text, { color: colors.textPrimary }]}>Processando nota fiscal...</Text>
      
      {/* Modal de compra de créditos */}
      <Modal
        visible={showPurchaseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Créditos Insuficientes
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Você não possui créditos suficientes para escanear esta nota fiscal.
              Deseja comprar créditos agora?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                onPress={() => {
                  setShowPurchaseModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonBuy, { backgroundColor: colors.primary }]}
                onPress={handlePurchaseCredits}
              >
                <Text style={[styles.modalButtonText, { color: colors.textOnPrimary }]}>
                  Comprar Créditos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonBuy: {
    // backgroundColor será definido via style prop
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


