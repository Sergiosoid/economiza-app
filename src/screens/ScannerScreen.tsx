import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { scanReceipt } from '../services/api';
import { ScanReceiptResponse, ScanReceiptProcessingResponse, ScanReceiptConflictResponse } from '../types/api';
import { savePendingScan, syncPendingScans } from '../services/offlineSync';
import NetInfo from '@react-native-community/netinfo';
import ConfirmationModal from '../components/ConfirmationModal';
import ProcessingModal from '../components/ProcessingModal';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrText, setQrText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const navigation = useNavigation();

  useEffect(() => {
    // Sincronizar scans pendentes quando a tela é montada
    syncPendingScans();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    setQrText(data);

    // Feedback visual e háptico
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Mostrar modal de confirmação
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!qrText) return;

    setShowConfirmation(false);
    setLoading(true);

    try {
      // Verificar conexão
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Salvar para sincronização offline
        await savePendingScan(qrText);
        Alert.alert(
          'Sem Conexão',
          'O QR code foi salvo e será enviado automaticamente quando a conexão for restaurada.',
          [{ text: 'OK', onPress: () => (navigation as any).goBack() }]
        );
        setLoading(false);
        setScanned(false);
        setQrText(null);
        return;
      }

      // Enviar para o backend usando a função scanReceipt
      const response = await scanReceipt(qrText);

      // Tratar diferentes tipos de resposta
      if ('receipt_id' in response && 'status' in response && response.status === 'saved') {
        // Status 200: Receipt salvo com sucesso
        const receiptResponse = response as ScanReceiptResponse;
        Alert.alert(
          'Sucesso!',
          'Nota fiscal processada com sucesso.',
          [
            {
              text: 'Ver Detalhes',
              onPress: () => {
                (navigation as any).navigate('ReceiptDetail', { receiptId: receiptResponse.receipt_id });
                setScanned(false);
                setQrText(null);
              },
            },
          ]
        );
      } else if ('status' in response && response.status === 'processing') {
        // Status 202: Nota em processamento
        const processingResponse = response as ScanReceiptProcessingResponse;
        setProcessingMessage(processingResponse.message || 'Nota em processamento');
        setShowProcessing(true);
      } else if ('detail' in response && 'receipt_id' in response) {
        // Status 409: Nota já existe
        const conflictResponse = response as ScanReceiptConflictResponse;
        Alert.alert(
          'Nota já existente',
          conflictResponse.detail || 'Esta nota fiscal já foi cadastrada anteriormente.',
          [
            {
              text: 'Ver Detalhes',
              onPress: () => {
                (navigation as any).navigate('ReceiptDetail', { receiptId: conflictResponse.receipt_id });
                setScanned(false);
                setQrText(null);
              },
            },
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => {
                setScanned(false);
                setQrText(null);
              },
            },
          ]
        );
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao enviar scan:', error);
      
      if (error.response) {
        // Erro do servidor
        const status = error.response.status;
        const data = error.response.data;

        if (status === 500) {
          // Erro interno do servidor
          Alert.alert(
            'Erro',
            data?.detail || 'Falha ao processar nota fiscal. Tente novamente mais tarde.',
            [{ text: 'OK' }]
          );
        } else if (status === 409) {
          // Receipt já existe - navegar mesmo assim
          const receiptId = data.receipt_id || (data as any).receipt_id;
          Alert.alert(
            'Nota já existente',
            'Esta nota fiscal já foi cadastrada anteriormente.',
            [
              {
                text: 'Ver Detalhes',
                onPress: () => {
                  (navigation as any).navigate('ReceiptDetail', { receiptId });
                  setScanned(false);
                  setQrText(null);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Erro',
            data?.detail || `Erro ${status}: Não foi possível processar o QR code.`,
            [{ text: 'OK' }]
          );
        }
      } else if (error.request) {
        // Sem resposta - salvar para sincronização offline
        await savePendingScan(qrText);
        Alert.alert(
          'Sem Conexão',
          'O QR code foi salvo e será enviado automaticamente quando a conexão for restaurada.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Erro',
          'Erro inesperado ao processar o QR code.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseProcessing = () => {
    setShowProcessing(false);
    setScanned(false);
    setQrText(null);
    (navigation as any).goBack();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setScanned(false);
    setQrText(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos de permissão para acessar a câmera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={CameraType.back}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instruction}>
            Posicione o QR code dentro da área
          </Text>
        </View>
      </CameraView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processando...</Text>
        </View>
      )}

      <ConfirmationModal
        visible={showConfirmation}
        qrText={qrText || ''}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <ProcessingModal
        visible={showProcessing}
        message={processingMessage}
        onClose={handleCloseProcessing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  message: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

