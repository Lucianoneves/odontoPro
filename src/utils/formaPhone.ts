

export function formatPhone(value: string){
    
    const cleanedValue = value.replace(/\D/g, ""); 

    //Verificar se o valor é um numero de telefone valido 

    if(cleanedValue.length > 11){ 
        return value.slice(0, 15); // limitando o numero de caracteres para 15
    }

    const formattedValue = cleanedValue
    .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    .replace(/(\d{4,5})(\d{4})/, '$1-$2') // formatando o numero de telefone 

    return formattedValue;
}


export function extractPhoneNumber (phone: string) {
    const phoneValue = phone.replace(/[\(\)\s-]/g, "")     

    return phoneValue;
   
}
