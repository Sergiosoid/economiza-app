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