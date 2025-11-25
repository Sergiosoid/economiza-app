# economiza-app
Aplicativo mobile do Economiza (React Native + Expo)

## Configuração

### 1. Instalar dependências

```bash
npm install
# ou
yarn install
```

### 2. Configurar API Base URL

Edite o arquivo `src/config/api.ts` e ajuste o `BASE_URL`:

```typescript
const BASE_URL = 'http://192.168.0.xxx:8000'; // Substitua pelo IP da sua máquina
```

**Como descobrir seu IP:**
- **Windows**: Execute `ipconfig` no terminal e procure por "IPv4 Address"
- **Mac/Linux**: Execute `ifconfig` ou `ip addr` e procure pelo IP da sua interface de rede

**Importante**: Certifique-se de que:
- O dispositivo móvel e o computador estão na mesma rede Wi-Fi
- O firewall permite conexões na porta 8000
- O backend está rodando e acessível

### 3. Configurar Token de Desenvolvimento

O token de desenvolvimento está configurado em `src/config/settings.ts`:

```typescript
export const DEV_TOKEN = 'test-token-123';
```

Este token é usado para autenticação nas requisições durante o desenvolvimento. Em produção, será substituído por autenticação JWT real.

**Nota**: O backend aceita qualquer token no formato `Bearer <token>` durante o desenvolvimento (stub de autenticação).

### 4. Executar o app

```bash
npm start
# ou
yarn start
```

Depois, escolha a plataforma:
- Pressione `a` para Android
- Pressione `i` para iOS
- Escaneie o QR code com o app Expo Go

## Funcionalidades

### Scanner de QR Code

O app permite escanear QR codes de notas fiscais:

1. **Abrir Scanner**: Toque no botão "Escanear QR Code" na tela inicial
2. **Ler QR Code**: Posicione o QR code dentro da área de leitura
3. **Confirmar**: Revise as informações e confirme o envio
4. **Visualizar**: Após o envio, você será redirecionado para os detalhes da nota

### Sincronização Offline

O app suporta sincronização offline:

- Se você escanear um QR code sem conexão, ele será salvo localmente
- Quando a conexão for restaurada, os scans pendentes serão enviados automaticamente
- A sincronização acontece automaticamente ao abrir o Scanner

### Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── ConfirmationModal.tsx
├── config/             # Configurações
│   ├── api.ts          # Configuração da API (BASE_URL)
│   └── settings.ts     # Configurações gerais (DEV_TOKEN)
├── screens/            # Telas do app
│   ├── HomeScreen.tsx
│   ├── ScannerScreen.tsx
│   └── ReceiptDetailScreen.tsx
├── services/           # Serviços
│   ├── api.ts         # Cliente HTTP
│   ├── offlineSync.ts # Sincronização offline
│   └── testConnection.ts
└── types/             # Tipos TypeScript
    └── api.ts         # Tipos das respostas da API
```

## Desenvolvimento

### Testando a Conexão

Use o botão "Testar Conexão com Backend" na tela inicial para verificar se o app consegue se comunicar com o backend.

### Debug

- Logs do console aparecem no terminal onde o Expo está rodando
- Use `console.log()` para debug
- O React Native Debugger pode ser usado para inspecionar o estado da aplicação

## Troubleshooting

### Erro de conexão

1. Verifique se o IP está correto em `src/config/api.ts`
2. Certifique-se de que o backend está rodando
3. Verifique se o dispositivo e o computador estão na mesma rede
4. Teste acessando `http://<IP>:8000/health` no navegador do dispositivo

### Câmera não funciona

1. Verifique as permissões de câmera no dispositivo
2. No Android, pode ser necessário conceder permissões manualmente nas configurações do app

### QR codes não são lidos

1. Certifique-se de que há iluminação adequada
2. Mantenha o QR code dentro da área de leitura
3. Evite reflexos ou distorções na imagem