

 // Valor em centavos = valor para converter em reais * 100
 // Valor em reais = valor para converter em centavos / 100





/**
 * Converte um valor  monetario (R$) em reais para centavos
 * @param {string} amount - Valor em reais
 * @returns {number} Valor convertido  em centavos
 * @example 
 * convertRealToCents("100,00 reais") em   10000 centavos  
 */
export function convertRealToCents(amount: string) { // Função para converter valor em reais para centavos
    const  numericPrice = parseFloat(amount.replace(/\./g, "").replace(",", ".")) // Remove pontos e vírgulas e converte para número
    const priceInCents =Math.round(numericPrice * 100);

   
    return priceInCents;
}