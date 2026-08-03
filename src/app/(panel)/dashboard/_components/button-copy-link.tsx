

"use client"; 


import {Button}from '@/components/ui/button';
import { LinkIcon } from 'lucide-react'; 
import { toast } from 'sonner';




export function ButtonCopyLink({userId}: {userId: string}) {  // userId é o id da clínica

async function handleCopyLink() { 
    await  navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/clinica/${userId}`) 


    toast.success('Link copiado para a área de transferência');
}

return (
    <Button onClick={handleCopyLink}>
        <LinkIcon className="w-4 h-4" />
        Copiar link
    </Button>
)
}