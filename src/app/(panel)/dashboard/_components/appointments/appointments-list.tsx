"use client";
import { useState } from "react";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelAppointment } from "../../_actions/cancel-appointment";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DialogAppointments } from "./dialog-appointments";
import { ButtonPickerAppointment } from "./button-date";

interface AppointmentWithService {
    id: string;
    name: string;
    email: string;
    phone: string;
    time: string;
    appointmentDate: string;
    serviceId: string;
    service: {
        id: string;
        name: string;
        duration: number;
        price: number;
    };
}

 export type SlotOccupation = {
     appointment: AppointmentWithService;
    isStart: boolean;
};

 interface AppointmentsListProps {
    times: string[];
}

export function AppointmentsList({ times }: AppointmentsListProps) {
    const searchParams = useSearchParams();
    const date = searchParams.get("date");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [detailsAppointment, setDetailsAppointment] = useState<SlotOccupation | null>(null);



    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["get-appointments", date],
        queryFn: async () => {
            const activeDate = date || format(new Date(), "yyyy-MM-dd");

            const response = await fetch(
                `/api/clinic/appointments?date=${activeDate}`
            );

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || "Erro ao buscar agendamentos");
            }

            return json as AppointmentWithService[];
        },
    });

    const appointments = data ?? [];

    const occupiedSlots = useMemo(() => {
        const map = new Map<string, SlotOccupation>();

        for (const appointment of appointments) {
            const startIndex = times.indexOf(appointment.time);
            if (startIndex === -1) {
                continue;
            }

            const requiredSlots = Math.ceil(
                (appointment.service?.duration ?? 30) / 30
            );

            for (let i = 0; i < requiredSlots; i++) {
                const slot = times[startIndex + i];
                if (!slot) {
                    break;
                }

                map.set(slot, {
                    appointment,
                    isStart: i === 0,
                });
            }
        }

        return map;
    }, [appointments, times]);

    async function handleCancelAppointment(appointmentId: string) {
        const response = await cancelAppointment({
            appointmentId: appointmentId,
        });

        if (response?.error) {
            toast.error(response.error);
            return;
        }

        await refetch(); // refetch é um metodo do useQuery para refetchar os dados da consulta
        toast.success(response.data);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-2xl font-bold">
                    Agendamentos
                </CardTitle>

                <ButtonPickerAppointment />
            </CardHeader>

            <CardContent>
                {isLoading && (
                    <p className="text-sm text-gray-500 mb-2">
                        Carregando agendamentos...
                    </p>
                )}

                {error && (
                    <p className="text-sm text-red-500 mb-2">
                        Erro ao carregar agendamentos.
                    </p>
                )}

                {times.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Nenhum horário disponível. Cadastre os horários no
                        perfil da clínica.
                    </p>
                ) : (
                    <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-15rem)] pr-4">
                        {times.map((slot) => {
                            const occupation = occupiedSlots.get(slot);

                            return (
                                <div
                                    key={slot}
                                    className={`flex flex-row items-center border-t last:border-b py-2 gap-3 ${
                                        occupation ? "bg-red-50" : ""
                                    }`}
                                >
                                    <div className="text-sm font-medium w-14 shrink-0">
                                        {slot}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {occupation ? (
                                            occupation.isStart ? (
                                                <p className="text-sm font-medium text-red-500 truncate">
                                                    {occupation.appointment.name}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-red-400 italic">
                                                    Em atendimento
                                                </p>
                                            )
                                        ) : (
                                            <span className="text-sm font-medium text-green-500">
                                                Disponível
                                            </span>
                                        )}
                                    </div>

                                    {occupation?.isStart && (
                                        <div className="flex items-center shrink-0 ml-auto">
                                            <DialogTrigger >
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDetailsAppointment(occupation)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            </DialogTrigger>


                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCancelAppointment(occupation.appointment.id)}
                                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
        <DialogAppointments 
         appointment={detailsAppointment ?? null}
         />
        </Dialog>
    );
}
