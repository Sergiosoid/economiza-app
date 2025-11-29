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
│   ├── Button.tsx      # Botão padronizado
│   ├── Card.tsx        # Card container
│   ├── Divider.tsx     # Divisor visual
│   ├── Loading.tsx     # Estado de carregamento
│   ├── ScreenContainer.tsx  # Container de tela
│   ├── Typography.tsx  # Texto tipográfico
│   └── index.ts        # Barrel export
├── config/             # Configurações
│   ├── api.ts          # Configuração da API (BASE_URL)
│   └── settings.ts     # Configurações gerais (DEV_TOKEN)
├── screens/            # Telas do app
│   ├── HomeScreen.tsx
│   ├── ScannerScreen.tsx
│   ├── ReceiptDetailScreen.tsx
│   ├── AnalyticsScreen.tsx
│   ├── TopItemsScreen.tsx
│   ├── CompareStoresScreen.tsx
│   └── OnboardingScreen.tsx
├── services/           # Serviços
│   ├── api.ts         # Cliente HTTP
│   ├── offlineSync.ts # Sincronização offline
│   └── testConnection.ts
├── theme/             # Sistema de temas
│   ├── colors.ts      # Paleta de cores (light/dark)
│   └── ThemeContext.tsx  # Context API para tema
└── types/             # Tipos TypeScript
    └── api.ts         # Tipos das respostas da API
assets/
├── images/            # Imagens do app (ícones, ilustrações, etc)
│   └── .keep          # Arquivo placeholder para manter a pasta no git
├── icon.png           # Ícone do app (1024x1024)
├── splash.png         # Imagem de splash screen
├── adaptive-icon.png  # Ícone adaptativo para Android
└── favicon.png        # Favicon para web
```

## Sistema de Temas

O app possui um sistema completo de temas com suporte a modo claro e escuro.

### Uso do Tema

```typescript
import { useTheme } from '../theme/ThemeContext';

const MyComponent = () => {
  const { colors, colorScheme, toggleTheme, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Texto</Text>
    </View>
  );
};
```

### Cores Disponíveis

- **Primárias**: `primary`, `primaryDark`, `primaryLight`
- **Secundárias**: `secondary`, `secondaryDark`, `secondaryLight`
- **Backgrounds**: `background`, `surface`, `surfaceVariant`
- **Textos**: `textPrimary`, `textSecondary`, `textTertiary`, `textOnPrimary`
- **Estados**: `success`, `warning`, `error`, `info`
- **Bordas**: `border`, `divider`
- **Overlay**: `overlay`, `overlayLight`

### Persistência

A preferência de tema é salva automaticamente no `AsyncStorage` e restaurada na próxima abertura do app.

## Componentes Globais

O app possui uma biblioteca de componentes padronizados:

### Button

```typescript
<Button
  title="Clique aqui"
  onPress={() => {}}
  variant="primary"  // primary | secondary | outline | ghost
  size="medium"     // small | medium | large
  disabled={false}
  loading={false}
  fullWidth={true}
/>
```

### Card

```typescript
<Card variant="elevated" padding={16}>
  <Typography variant="h4">Título</Typography>
</Card>
```

### Typography

```typescript
<Typography
  variant="h1"      // h1 | h2 | h3 | h4 | body | body2 | caption | button | overline
  color="primary"   // primary | secondary | tertiary | error | success | warning | info
  bold={false}
>
  Texto
</Typography>
```

### ScreenContainer

```typescript
<ScreenContainer scrollable>
  {/* Conteúdo */}
</ScreenContainer>
```

### Loading

```typescript
<Loading message="Carregando..." size="large" />
```

### Divider

```typescript
<Divider vertical={false} spacing={16} />
```

## Onboarding

O app possui uma tela de onboarding que aparece apenas na primeira execução:

- **3 slides** explicando as funcionalidades principais
- **Navegação** com botões "Próximo", "Pular" e "Começar"
- **Persistência** usando AsyncStorage
- **Design** moderno e responsivo

Para resetar o onboarding (útil para testes), remova a chave `@economiza:onboarding_completed` do AsyncStorage.
```

## Assets e Imagens

### Estrutura de Assets

O projeto usa a pasta `assets/` para armazenar imagens e recursos estáticos:

- **`assets/images/`**: Pasta para imagens usadas no app (ícones, ilustrações, etc)
  - O arquivo `.keep` existe para garantir que a pasta seja versionada no Git mesmo quando vazia
  - Adicione suas imagens aqui durante o desenvolvimento

- **`assets/icon.png`**: Ícone principal do app (1024x1024px)
- **`assets/splash.png`**: Imagem exibida durante o carregamento inicial
- **`assets/adaptive-icon.png`**: Ícone adaptativo para Android (foreground)
- **`assets/favicon.png`**: Favicon para versão web

### Como Adicionar Novas Imagens

1. **Imagens do app** (ícones, ilustrações, etc):
   ```bash
   # Adicione suas imagens em assets/images/
   cp minha-imagem.png assets/images/
   ```

2. **Usar imagens no código**:
   ```typescript
   import { Image } from 'react-native';
   
   <Image 
     source={require('../assets/images/minha-imagem.png')} 
     style={{ width: 100, height: 100 }}
   />
   ```

3. **Substituir ícones do app**:
   - Substitua os arquivos em `assets/` (icon.png, splash.png, etc)
   - Execute `expo prebuild` se necessário para regenerar os ícones nativos

### Por que o arquivo `.keep` existe?

O arquivo `assets/images/.keep` existe para garantir que a pasta `assets/images/` seja versionada no Git mesmo quando vazia. Isso evita erros do Expo que tentam fazer `scandir` em uma pasta que não existe no repositório.

## Fluxo de Execução

### Fluxo Completo do App

1. **Inicialização**
   - App verifica se é primeira execução (onboarding)
   - Carrega preferências de tema (light/dark)
   - Inicializa navegação

2. **HomeScreen (Dashboard)**
   - Busca resumo mensal via `GET /api/v1/analytics/monthly-summary`
   - Calcula categorias a partir dos itens das notas
   - Lista últimas 5 compras via `GET /api/v1/receipts/list?limit=5`
   - Exibe total mensal e variação percentual

3. **Scanner de QR Code**
   - Abre câmera para escanear QR code da nota fiscal
   - Navega para `ReceiptProcessingScreen` com o QR code

4. **Processamento de Nota**
   - Envia QR code via `POST /api/v1/receipts/scan`
   - Backend processa e retorna:
     - `receipt_id` se salvo com sucesso
     - `task_id` se processamento em background
     - `receipt_id` se já existe (409 Conflict)
   - Navega para `ReceiptDetailScreen` com o `receipt_id`

5. **Detalhes da Nota**
   - Busca detalhes via `GET /api/v1/receipts/{receipt_id}`
   - Exibe: loja, CNPJ, data, subtotal, impostos, total, lista de itens
   - Permite abrir "Modo Empacotador" para correção de classificação

### Integração com Backend

O app consome os seguintes endpoints:

- **`GET /api/v1/receipts/list`**: Lista notas fiscais (inclui `items[]`)
- **`GET /api/v1/receipts/{id}`**: Detalhes completos de uma nota
- **`POST /api/v1/receipts/scan`**: Escanear e processar QR code
- **`GET /api/v1/analytics/monthly-summary`**: Resumo mensal com categorias
- **`GET /api/v1/analytics/top-items`**: Itens mais comprados
- **`GET /api/v1/analytics/compare-store`**: Comparação de preços entre lojas

## Modo de Desenvolvimento (DEV_REAL_MODE)

### O que é DEV_REAL_MODE?

O `DEV_REAL_MODE` é um modo especial do backend que permite testar o app com dados fake mesmo quando um provider real está configurado. Isso é útil para:

- **Desenvolvimento local**: Testar funcionalidades sem fazer requisições reais
- **Testes automatizados**: Garantir que os testes não dependam de APIs externas
- **Debugging**: Isolar problemas sem depender de serviços externos

### Como Usar DEV_REAL_MODE

1. **Configure o backend** (arquivo `.env` do backend):
   ```env
   DEV_REAL_MODE=true
   PROVIDER_NAME=fake
   DEV_MODE=true
   ```

2. **Inicie o backend**:
   ```bash
   cd economiza-backend
   uvicorn app.main:app --reload
   ```

3. **Execute o app**:
   ```bash
   cd economiza-app
   npm start
   ```

4. **Teste o fluxo completo**:
   - Escaneie qualquer QR code (ou use um fake)
   - O backend retornará dados fake: "SUPERMERCADO FAKE"
   - Todas as notas terão os mesmos 3 itens de exemplo (Arroz, Feijão, Açúcar)

### Dados Fake Retornados

Quando `DEV_REAL_MODE=true`, o backend sempre retorna:

- **Loja**: "SUPERMERCADO FAKE"
- **CNPJ**: "12345678000190"
- **Total**: R$ 125,30
- **Subtotal**: R$ 119,00
- **Impostos**: R$ 6,30
- **Itens**: 
  - ARROZ TIPO 1 5KG (1x R$ 25,50)
  - FEIJAO PRETO 1KG (2x R$ 8,50)
  - ACUCAR CRISTAL 1KG (1x R$ 4,80)

### Desativar DEV_REAL_MODE

Para usar o provider real:

1. **Configure o backend**:
   ```env
   DEV_REAL_MODE=false
   PROVIDER_NAME=webmania  # ou outro provider
   PROVIDER_APP_KEY=sua-chave-real
   PROVIDER_APP_SECRET=seu-secret-real
   ```

2. **Reinicie o backend**

3. **Teste com QR codes reais** de notas fiscais

## Build para Produção

### Pré-requisitos

1. **Conta Expo**: Crie uma conta em [expo.dev](https://expo.dev)
2. **EAS CLI**: Instale o EAS CLI globalmente:
   ```bash
   npm install -g eas-cli
   ```

3. **Login no Expo**:
   ```bash
   eas login
   ```

### Configurar Projeto

1. **Configure o `app.json`**:
   ```json
   {
     "expo": {
       "name": "Economiza",
       "slug": "economiza-app",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "updates": {
         "fallbackToCacheTimeout": 0
       },
       "assetBundlePatterns": [
         "**/*"
       ],
       "ios": {
         "supportsTablet": true,
         "bundleIdentifier": "com.economiza.app"
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#ffffff"
         },
         "package": "com.economiza.app"
       },
       "web": {
         "favicon": "./assets/favicon.png"
       }
     }
   }
   ```

2. **Configure variáveis de ambiente**:
   - Crie arquivo `.env` (não versionado):
     ```env
     EXPO_PUBLIC_API_BASE_URL=https://api.economiza.com.br
     ```
   - Atualize `src/config/api.ts` para usar:
     ```typescript
     const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
     ```

### Build Android

1. **Configure o projeto EAS**:
   ```bash
   eas build:configure
   ```

2. **Crie o build**:
   ```bash
   eas build --platform android
   ```

3. **Acompanhe o progresso**:
   - O build será processado na nuvem
   - Você receberá um link para download do APK quando concluído

4. **Distribuir**:
   - **Google Play**: Faça upload do APK/AAB na Google Play Console
   - **Teste interno**: Compartilhe o link do APK com testadores

### Build iOS

1. **Configure o projeto EAS**:
   ```bash
   eas build:configure
   ```

2. **Crie o build**:
   ```bash
   eas build --platform ios
   ```

3. **Acompanhe o progresso**:
   - O build será processado na nuvem
   - Você receberá um link para download do IPA quando concluído

4. **Distribuir**:
   - **App Store**: Use `eas submit` para enviar automaticamente
   - **TestFlight**: Configure no Apple Developer Portal

### Build com EAS Build

```bash
# Build para ambas as plataformas
eas build --platform all

# Build apenas para Android
eas build --platform android

# Build apenas para iOS
eas build --platform ios

# Build de produção (release)
eas build --platform android --profile production

# Build de desenvolvimento (debug)
eas build --platform android --profile development
```

### Perfis de Build

Configure perfis no `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

### Submeter para Stores

**Google Play**:
```bash
eas submit --platform android
```

**App Store**:
```bash
eas submit --platform ios
```

## Sistema de Créditos

O Economiza utiliza um sistema de créditos para controlar o uso de funcionalidades premium, como escanear notas fiscais.

### Como Funciona

- **Créditos**: Cada ação consome créditos (ex: escanear nota = 1 crédito)
- **Barra de Créditos**: Exibida no topo da HomeScreen, mostra saldo atual
- **Compra de Créditos**: Quando os créditos acabam, o app oferece opção de compra
- **Limite Mensal**: O backend pode configurar limite mensal do provider

### Fluxo de Uso

1. **Escanear Nota Fiscal**:
   - App tenta consumir 1 crédito antes de escanear
   - Se tiver créditos: processa normalmente
   - Se não tiver: exibe modal oferecendo compra

2. **Comprar Créditos**:
   - Toque na barra de créditos na HomeScreen
   - Ou toque em "Comprar Créditos" no modal
   - Será redirecionado para checkout (Stripe)

3. **Verificar Saldo**:
   - Barra de créditos sempre visível na HomeScreen
   - Cor muda para amarelo/vermelho quando créditos < 5

### Endpoints de Créditos

- **`GET /api/v1/credits`**: Obter saldo atual
- **`POST /api/v1/credits/consume`**: Consumir crédito (chamado automaticamente)
- **`POST /api/v1/credits/purchase/start`**: Iniciar compra de créditos

### Configuração no Backend

O backend pode configurar limite mensal via `PROVIDER_MONTHLY_LIMIT` no `.env`:

```env
PROVIDER_MONTHLY_LIMIT=100  # Limite de 100 requisições/mês por usuário
```

Se configurado, mesmo com créditos, o usuário não poderá exceder o limite mensal.

## Desenvolvimento

### Testando a Conexão

Use o botão "Testar Conexão com Backend" na tela inicial para verificar se o app consegue se comunicar com o backend.

### Debug

- Logs do console aparecem no terminal onde o Expo está rodando
- Use `console.log()` para debug
- O React Native Debugger pode ser usado para inspecionar o estado da aplicação
- Use `npx expo start -c` para limpar o cache do bundler

### Testando Sistema de Créditos

1. **Adicionar créditos manualmente** (via backend):
   ```bash
   # Conectar ao banco e atualizar:
   UPDATE users SET credits = 10 WHERE email = 'dev@example.com';
   ```

2. **Testar consumo**:
   - Escaneie uma nota fiscal
   - Verifique que créditos diminuem
   - Verifique histórico em `credit_usage`

3. **Testar sem créditos**:
   - Zere créditos: `UPDATE users SET credits = 0 WHERE email = 'dev@example.com';`
   - Tente escanear nota
   - Deve aparecer modal de compra

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