"use client";
import { useState } from "react";
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    useDialogServiceForm,
    DialogServiceFormData,
} from "./dialog-service-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { convertRealToCents } from "@/utils/convertCurrency";
import { createService } from "../_actions/create-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateService } from "../_actions/update-service";

interface DialogServiceProps { // Interface para as props do DialogService
    closeModal: () => void;
    serviceId?: string;
    initialValues?: {
        name: string;
        price: string;
        hours: string;
        minutes: string;
    };
}


export function DialogService({ closeModal, serviceId, initialValues }: DialogServiceProps) { // Função para o DialogService
    const form = useDialogServiceForm({ initialValues });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();


    async function onSubmit(values: DialogServiceFormData) {
        setIsLoading(true);
        const priceInCents = convertRealToCents(values.price);
        const hours = parseInt(values.hours) || 0;
        const minutes = parseInt(values.minutes) || 0;

        //converter horas em minutos paraduração total em minutos
        const duration = (hours * 60) + minutes;

        if (serviceId) { //se o serviço existe, atualiza os dados
            await editServiceById({ //chama a função para atualizar o serviço
                serviceId: serviceId,
                name: values.name,
                priceInCents: priceInCents,
                duration: duration
            })

            setIsLoading(false);
            return;
        }

        const response = await createService({
            name: values.name,
            price: priceInCents,
            duration: duration
        })

        setIsLoading(false);



        if (response.error) {
            toast.error(response.error);
            return;
        }


        toast.success("Serviço cadastrado com sucesso!");
        closeModal();
        router.refresh();
    }

    async function editServiceById({
        serviceId,
        name,
        priceInCents,
        duration }: {

            serviceId: string
            name: string,
            priceInCents: number,
            duration: number
        }) {

        const response = await updateService({
            serviceId: serviceId,
            name: name,
            price: priceInCents,
            duration: duration
        })

        setIsLoading(false);

        if (response.error) {
            toast.error(response.error);
            return
        }

        toast.success(response.data);
        handleCloseModal();
        router.refresh();

    };



    function handleCloseModal() {
        form.reset();
        closeModal();

    }



    function changeCurrency(event: React.ChangeEvent<HTMLInputElement>) { // Função para remover caracteres não numéricos do input de preço
        let { value } = event.target;
        value = value.replace(/[^0-9]/g, "");


        if (value) {
            value = (parseInt(value, 10) / 100).toFixed(2)  // Converte o valor para reais
            value = value.replace(".", ","); // Substitui o ponto por vírgula
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona ponto a cada 3 dígitos
        }

        event.target.value = value; // Atualiza o valor do input de preço no DOM
        form.setValue("price", value); // Atualiza o valor do input de preço no formulário

    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {serviceId ? "Editar serviço" : "Novo serviço"}
                </DialogTitle>
                <DialogDescription>
                    {serviceId
                        ? "Atualize os dados do serviço"
                        : "Aqui voce pode cadastrar um novo servico"}
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form
                    className="space-y-8"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="my-2">
                                    <FormLabel className="font-semibold">
                                        Nome do serviço
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Nome do serviço..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem className="my-2">
                                    <FormLabel className="font-semibold">
                                        Preço (R$)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Preço do serviço..."
                                            onChange={changeCurrency}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <p className="font-semibold">Tempo de duração do serviço</p>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="hours"
                            render={({ field }) => (
                                <FormItem className="my-2">
                                    <FormLabel className="font-semibold">
                                        Horas
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Horas..."
                                            type="number"
                                            min="0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="minutes"
                            render={({ field }) => (
                                <FormItem className="my-2">
                                    <FormLabel className="font-semibold">
                                        Minutos
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="0"
                                            type="number"
                                            min="0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full cursor-pointer font-semibold text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "Carregando..." : `${serviceId ? "Atualizar serviço" : "Adicionar serviço"}`}

                    </Button>
                </form>
            </Form>
        </>
    );
}
