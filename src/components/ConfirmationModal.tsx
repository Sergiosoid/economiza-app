import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  qrText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  qrText,
  onConfirm,
  onCancel,
}) => {
  // Tentar extrair informações básicas do QR text
  const extractInfo = (text: string) => {
    // Tentar encontrar chave de acesso (44 dígitos)
    const keyMatch = text.match(/\d{44}/);
    const accessKey = keyMatch ? keyMatch[0] : null;

    // Tentar encontrar URL
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    return {
      accessKey,
      url,
      preview: text.length > 100 ? text.substring(0, 100) + '...' : text,
    };
  };

  const info = extractInfo(qrText);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Confirmar Envio</Text>
          
          <ScrollView style={styles.content}>
            <View style={styles.infoSection}>
              <Text style={styles.label}>QR Code lido:</Text>
              <Text style={styles.value} numberOfLines={3}>
                {info.preview}
              </Text>
            </View>

            {info.accessKey && (
              <View style={styles.infoSection}>
                <Text style={styles.label}>Chave de Acesso:</Text>
                <Text style={styles.value}>{info.accessKey}</Text>
              </View>
            )}

            {info.url && (
              <View style={styles.infoSection}>
                <Text style={styles.label}>URL:</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {info.url}
                </Text>
              </View>
            )}

            <Text style={styles.note}>
              Os dados completos serão extraídos após o envio.
            </Text>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    maxHeight: 300,
  },
  infoSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmationModal;

