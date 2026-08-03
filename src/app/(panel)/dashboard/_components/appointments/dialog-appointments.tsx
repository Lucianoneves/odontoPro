"use client";

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SlotOccupation } from "./appointments-list";

interface DialogAppointmentsProps {
    appointment: SlotOccupation | null;
}

export function DialogAppointments({ appointment }: DialogAppointmentsProps) {
    if (!appointment) {
        return null;
    }

    const { appointment: data } = appointment;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalhes do agendamento</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-2 text-sm">
                <p>
                    <span className="font-medium">Nome:</span> {data.name}
                </p>
                <p>
                    <span className="font-medium">Email:</span> {data.email}
                </p>
                <p>
                    <span className="font-medium">Telefone:</span> {data.phone}
                </p>
                <p>
                    <span className="font-medium">Horário:</span> {data.time}
                </p>
                <p>
                    <span className="font-medium">Serviço:</span>{" "}
                    {data.service.name}
                </p>
                <p>
                    <span className="font-medium">Duração:</span>{" "}
                    {data.service.duration} min
                </p>
            </div>
        </DialogContent>
    );
}
