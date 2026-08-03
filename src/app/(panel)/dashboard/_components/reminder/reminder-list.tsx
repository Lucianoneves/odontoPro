"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import type { Reminder } from "@/generated/prisma/client";
import { Plus, PlusIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deleteReminder } from "../../_actions/delete-reminder";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ReminderContent } from "./reminder-content";
import { useRouter } from "next/navigation";

interface ReminderListProps {
    reminder: Reminder[];
}

export function ReminderList({ reminder }: ReminderListProps) {
    
     const router = useRouter();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    

    async function handleDeleteReminder(id: string) {
        const response = await deleteReminder({ reminderId: id });

        if (response?.error) {
            toast.error(response.error);
            return;
        }

        toast.success(response?.success ?? "Lembrete deletado com sucesso");
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-2xl">
                        Lembretes
                    </CardTitle>

                    <Dialog open= {isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger >
                            <Button variant="ghost" className=" w-9 -p0">
                                <Plus className=" w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                         
                         

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo Lembrete</DialogTitle>
                                <DialogDescription>Adicione um novo lembrete para se lembrar!!!.</DialogDescription>
                            </DialogHeader>

                            <ReminderContent
                             closeDialog={() => setIsDialogOpen(false)}
                             />                          
                        </DialogContent>

                    </Dialog>

                </CardHeader>

                <CardContent>
                    {reminder.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Nenhum lembrete registrado!!!
                        </p>
                    )}

                    <ScrollArea className="h-[350px] lg:max-h-[calc(100vh-15rem)] pr-0 w-full flex-1">
                        {reminder.map((item) => (
                            <article
                                key={item.id}
                                className="flex flex-wrap flex-row items-center justify-between py-2 bg-yellow-200 mb-2 px-2 rounded-md"
                            >
                                <p className="text-sm lg:text-base">
                                    {item.description}
                                </p>
                                <Button
                                    className="bg-red-400 hover:bg-red-300 shadow-none rounded-full p-2"
                                    size="sm"
                                    onClick={() => handleDeleteReminder(item.id)}
                                >
                                    <Trash2Icon className="w-4 h-4 text-white" />
                                </Button>
                            </article>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
