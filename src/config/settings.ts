/**
 * Configurações do app
 */
export const API_BASE = __DEV__
  ? 'http://192.168.0.xxx:8000' // TODO: Ajustar o IP para o IP da sua máquina na rede local
  : 'https://api.economiza.com';

// Token de teste para desenvolvimento
// TODO: Substituir por autenticação real (JWT)
export const DEV_TOKEN = 'test';

