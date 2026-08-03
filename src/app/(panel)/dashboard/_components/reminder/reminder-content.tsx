"use client";

import { Button } from "@/components/ui/button";
import { useReminderForm, ReminderFormData } from "./reminder-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { createReminder } from "../../_actions/create-reminder";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReminderContentProps { 
    closeDialog: () => void;

}

    export function ReminderContent({ closeDialog }: ReminderContentProps) {
    const form = useReminderForm();
    const router = useRouter();


        async function onSubmit(data: ReminderFormData) {

        const response = await createReminder({ description: data.description });

        if (response && response.error) {
            toast.error(response.error);
            return;
        }


        toast.success("Lembrete criado com sucesso!");
        router.refresh();
        closeDialog();
    }


    return (
        <div className="flex flex-col gap-4">
            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Digite o nome do lembrete!"
                                        className="resize-none max-h-52"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Criar Lembrete
                    </Button>
                </form>
            </Form>
        </div>
    );
}
