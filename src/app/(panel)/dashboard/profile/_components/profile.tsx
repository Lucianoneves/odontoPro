"use client"
import { useEffect, useState } from "react";
import { ProfileFormData, useProfileForm } from "./profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowRight } from "lucide-react";
import Image from "next/image"
import imgTest from '../../../../../../public/foto1.png'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import { updateProfile } from "../_actions/update-profile";
import { toast } from "sonner";
import { formatPhone } from "@/utils/formaPhone";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AvatarProfile } from "./profile-avatar";

type UserWithSubscription = Prisma.UserGetPayload<{
    include: {
        subscription: true;
    }
}>;

interface ProfileContentProps {
    user: UserWithSubscription;
}



export function ProfileContent( {user}: ProfileContentProps) {  
    const router = useRouter();
    const { update } = useSession();
    const [selectedHours, setSelectedHours] = useState<string[]>(user.times || []);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    const form = useProfileForm({
        name: user.name, 
        address: user.address, 
        phone: user.phone, 
        status: user.status, 
        timeZone: user.timeZone
    });

    // Quando o servidor manda user atualizado (após refresh), sincroniza o formulário
    useEffect(() => {
      form.reset({
        name: user.name || "",
        address: user.address || "",
        phone: user.phone || "",
        status: user.status ? "active" : "inactive",
        timeZone: user.timeZone || "",
      });
      setSelectedHours(user.times || []);
    }, [user.id, user.updatedAt, user.name, user.address, user.phone, user.status, user.timeZone, user.times]);



    function generateTimeSlots():  string[]{ // aqui é a função para gerar os horários da clinica
        const hours: string[] = []; 

        for (let i = 8; i < 24; i++) {  // aqui é o loop para gerar os horários da clinica
           for (let j = 0; j < 2; j++) { // aqui é o loop para gerar os minutos da clinica
            const hour = i.toString().padStart(2, '0');  
            const minute = (j * 30).toString().padStart(2, '0');
            hours.push(`${hour}:${minute}`);
        }
        }

        return hours;
    }

    const hours = generateTimeSlots();
    
   

    function toggHour(hour: string) { // aqui é a função para selecionar o horário da clinica
        setSelectedHours((prev) => prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour].sort());
    }
    function removeHours(hour: string) { // aqui é a função para remover o horário da clinica
        setSelectedHours((prev) => prev.filter((h) => h !== hour));
    }


    const timeZone = Intl.supportedValuesOf("timeZone").filter((zone: string)=> 
          zone.startsWith("America/Sao_Paulo") ||
         zone.startsWith("America/Brasilia") ||
         zone.startsWith("America/Belem") ||
         zone.startsWith("America/Manaus") 
         
    );

     async function onSubmit(values: ProfileFormData) {

        
      
        const profileData = {
            ...values,
            times: selectedHours,
        } 
      const response = await updateProfile({
        name: values.name,
        address: values.address,
        phone: values.phone,
        status: values.status === "active" ? true : false,
        timeZone: values.timeZone, 
        times: selectedHours || [] ,
      }); 


      if ( response.error) {
        toast(response.error, {closeButton: true, style: {backgroundColor: "red", color: "white"}});
        return;
      } 

      toast(response.success, {closeButton: true, style: {backgroundColor: "green", color: "white"}});
      router.refresh();
      }


      async function handleLogout() {
        setIsLoggingOut(true);
        toast("Deslogando da conta...", {
          closeButton: true,
          style: { backgroundColor: "#1f2937", color: "white" },
        });

        await signOut({ redirect: false });
        await update();
        router.replace("/");
      }
      
        
    




    return (
        <div className='mx-auto '>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil do usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <AvatarProfile
                                 avatarUrl={user.image} 
                                 userId={user.id}
                                  />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className=" font-semibold">Nome completo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Digite seu nome  da clinica..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className=" font-semibold">Endereço completo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Digite seu endereço..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className=" font-semibold">Telefone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="(41) 98776-2657"
                                                    onChange={(e) => {  // aqui é o onChange para formatar o numero de telefone
                                                        const formattedValue = formatPhone(e.target.value);
                                                        field.onChange(formattedValue);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => ( // aqui é o campo de status da clinica
                                        <FormItem>
                                            <FormLabel className=" font-semibold cursor-pointer">
                                                Status da clinica
                                            </FormLabel>
                                            <FormControl>

                                                <Select onValueChange={field.onChange}
                                                    defaultValue={field.value ? "active" : "inactive"}>

                                                    <SelectTrigger className="cursor-pointer">
                                                        <SelectValue placeholder="Selecione o status da clinica" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">active (clinica aberta)</SelectItem>
                                                        <SelectItem value="inactive">inactive (clinica fechada)</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col gap-2"> 
                                    <Label className="cursor-pointer font-semibold">
                                        Configurar horários da clinica
                                    </Label>

                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger
                                            render={
                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer w-full justify-between"
                                                />
                                            }
                                        >
                                            Clique aqui para selecionar horários
                                            <ArrowRight className="w-5 h-5" />
                                        </DialogTrigger>

                                        <DialogContent> 
                                            <DialogHeader>
                                                <DialogTitle> Horários da clinica</DialogTitle>
                                                <DialogDescription>
                                                    Selecione abaixo  os horários da clinica:                                                    
                                                </DialogDescription>
                                            </DialogHeader>

                                            <section className="py-4">
                                                <p className="text-sm text-muted-foreground cursor-pointer mb-2">
                                                  Clique aqui para selecionar os horários da clinica:
                                                    </p>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {hours.map((hour) => (
                                                            <Button key={hour}
                                                             variant="outline"
                                                             className={cn('h-10', selectedHours.includes(hour) && "border-2 border-blue-400 text-primary")}
                                                             onClick={() => toggHour(hour)}
                                                              >
                                                                {hour}
                                                            </Button>
                                                        ))}
                                                    </div>
                                            </section>

                                            <Button className="w-full cursor-pointer"
                                            onClick={() => setDialogOpen(false)}
                                            >
                                            fechar modal                                              
                                             </Button>

                                        </DialogContent>
                                    </Dialog>


                                </div>

                                <FormField
                                    control={form.control}
                                    name="timeZone"
                                    render={({ field }) => ( // aqui é o campo de status da clinica
                                        <FormItem>
                                            <FormLabel className=" font-semibold cursor-pointer">
                                                Selecione o fuso horário da clinica
                                            </FormLabel>
                                            <FormControl>

                                                <Select onValueChange={field.onChange}
                                                    defaultValue={field.value ? "active" : "inactive"}>

                                                    <SelectTrigger className="cursor-pointer">
                                                        <SelectValue placeholder="Selecione o fuso horário da clinica" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {timeZone.map((zone: string) => (
                                                        <SelectItem key={zone} value={zone}>
                                                        {zone}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                </Select>

                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Button 
                                type="submit"
                                className="w-full bg-blue-400 text-white cursor-pointer hover:bg-blue-500"
                                >
                                Salvar alterações
                                </Button> 
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>

            <section  className="mt-4 cursor-pointer">
                <Button 
                variant= "destructive"
                disabled={isLoggingOut}
                onClick={handleLogout}
                >
                {isLoggingOut ? "Deslogando..." : "Sair da conta"}
                </Button>
            </section>
        </div>
    );
}