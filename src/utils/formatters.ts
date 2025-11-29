/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 * @param value Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param dateString String de data (ISO ou qualquer formato válido)
 * @param includeTime Se deve incluir hora e minuto (padrão: false)
 * @returns String formatada (ex: "01/01/2024" ou "01/01/2024 10:30")
 */
export function formatDate(
  dateString: string | null | undefined,
  includeTime: boolean = false
): string {
  if (!dateString) {
    return 'Data não disponível';
  }

  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString('pt-BR', options);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

/**
 * Formata um mês no formato "YYYY-MM" para nome do mês em português
 * @param monthStr String no formato "YYYY-MM"
 * @returns String formatada (ex: "Janeiro 2024")
 */
export function formatMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  } catch (error) {
    console.error('Erro ao formatar mês:', error);
    return monthStr;
  }
}

