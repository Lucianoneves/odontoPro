   
   
   
   /**
    * Formata um valor monetario (R$) em reais para centavos
    * @param {number} amount - Valor em reais
    * @returns {string} Valor formatado em reais
    * @example 
    * formatCurrency(100,00) em   10000 centavos  
    */
   
   const  CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", { 
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2, 
     
 }); 


 export function formatCurrency(amount: number) {
    return CURRENCY_FORMATTER.format(amount);
 }