"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import imgTest from "../../../../../../public/doctor-hero.png";
import { MapPinIcon } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";
import { useAppointmentForm, AppointmentFormData } from "./schedule-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScheduleTimeList } from "./schedule-time-list";
import { generateTimeSlots } from "@/utils/generate-time-slots";
import { CreateNewAppointments } from "./create-appointments";
import {
    getClientAppointments,
    UpdateAppointmentTime,
} from "./update-appointment";
import { toast } from "sonner";
import { DateTimePicker } from "./date-picker";

type UserWithServicesAndSubscription = Prisma.UserGetPayload<{
    include: {
        subscription: true;
        services: true;
    };
}>;

type ClientAppointment = {
    id: string;
    name: string;
    email: string;
    phone: string;
    time: string;
    serviceId: string;
    appointmentDate: Date | string;
    service: {
        id: string;
        name: string;
        duration: number;
    };
};

interface ScheduleContentProps {
    clinic: UserWithServicesAndSubscription;
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

function formatDateInput(date: Date | string) {
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
        return date.slice(0, 10);
    }

    const value = typeof date === "string" ? new Date(date) : date;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTodayDateString() {
    return formatDateInput(new Date());
}

function toLocalDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function ScheduleContent({ clinic }: ScheduleContentProps) {
    const form = useAppointmentForm();
    const { watch, setValue, reset } = form;

    const selectedDate = watch("date");
    const selectedServiceId = watch("service");

    const allTimes = generateTimeSlots();

    const [mode, setMode] = useState<"create" | "reschedule">("create");
    const [selectedTime, setSelectedTime] = useState<string | undefined>();
    const [availableTimesSlots, setAvailableTimesSlots] = useState<TimeSlot[]>(
        () => generateTimeSlots().map((time) => ({ time, available: true }))
    );
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
    const [lookupEmail, setLookupEmail] = useState("");
    const [clientAppointments, setClientAppointments] = useState<
        ClientAppointment[]
    >([]);
    const [editingAppointmentId, setEditingAppointmentId] = useState<
        string | undefined
    >();
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const pendingKeepTimeRef = useRef<string | undefined>(undefined);

    const todayDate = getTodayDateString();

    const requiredSlots = Math.ceil(
        (clinic.services.find((service) => service.id === selectedServiceId)
            ?.duration ?? 30) / 30
    );

    const fetchBlockedTimes = useCallback(
        async (
            date: string,
            excludeId?: string,
            signal?: AbortSignal
        ): Promise<string[]> => {
            setLoadingSlots(true);
            try {
                const params = new URLSearchParams({
                    userId: clinic.id,
                    date,
                });

                if (excludeId) {
                    params.set("excludeId", excludeId);
                }

                const response = await fetch(
                    `/api/schedule/get-appointments?${params.toString()}`,
                    { signal }
                );

                const json = await response.json();
                if (signal?.aborted) {
                    return [];
                }

                setLoadingSlots(false);
                return Array.isArray(json) ? json : [];
            } catch (error) {
                if (signal?.aborted) {
                    return [];
                }
                console.log(error);
                setLoadingSlots(false);
                return [];
            }
        },
        [clinic.id]
    );

    useEffect(() => {
        if (!selectedDate) {
            return;
        }

        const controller = new AbortController();
        const times = generateTimeSlots();
        const keepTime = pendingKeepTimeRef.current;

        fetchBlockedTimes(
            selectedDate,
            editingAppointmentId,
            controller.signal
        ).then((blocked) => {
            if (controller.signal.aborted) {
                return;
            }

            setBlockedTimes(blocked);

            const finalSlots = times.map((time) => ({
                time,
                available: !blocked.includes(time),
            }));

            setAvailableTimesSlots(finalSlots);

            if (keepTime && !blocked.includes(keepTime)) {
                setSelectedTime(keepTime);
                pendingKeepTimeRef.current = undefined;
            } else if (!editingAppointmentId) {
                setSelectedTime((current) =>
                    current && !blocked.includes(current) ? current : undefined
                );
            }
        });

        return () => controller.abort();
    }, [
        selectedDate,
        selectedServiceId,
        fetchBlockedTimes,
        editingAppointmentId,
    ]);

    function switchToCreate() {
        setMode("create");
        setEditingAppointmentId(undefined);
        setClientAppointments([]);
        setLookupEmail("");
        setSelectedTime(undefined);
        reset({
            name: "",
            email: "",
            phone: "",
            date: todayDate,
            service: "",
        });
    }

    function switchToReschedule() {
        setMode("reschedule");
        setEditingAppointmentId(undefined);
        setSelectedTime(undefined);
        reset({
            name: "",
            email: "",
            phone: "",
            date: todayDate,
            service: "",
        });
    }

    async function handleLookupAppointments() {
        if (!lookupEmail.trim()) {
            toast.error("Informe o email usado no agendamento.");
            return;
        }

        setLoadingAppointments(true);
        const response = await getClientAppointments(clinic.id, lookupEmail);
        setLoadingAppointments(false);

        if (response.error) {
            toast.error(response.error);
            setClientAppointments([]);
            return;
        }

        const data = (response.data ?? []) as ClientAppointment[];
        setClientAppointments(data);

        if (data.length === 0) {
            toast.error("Nenhum agendamento futuro encontrado para este email.");
        }
    }

    function handleSelectAppointment(appointment: ClientAppointment) {
        const appointmentDate = formatDateInput(appointment.appointmentDate);

        pendingKeepTimeRef.current = appointment.time;
        setEditingAppointmentId(appointment.id);
        setSelectedTime(appointment.time);
        setValue("name", appointment.name);
        setValue("email", appointment.email);
        setValue("phone", appointment.phone);
        setValue("service", appointment.serviceId);
        setValue("date", appointmentDate);
    }

    async function handleRegisterAppointment(formData: AppointmentFormData) {
        if (!selectedTime) {
            toast.error("Selecione um horário.");
            return;
        }

        if (mode === "reschedule") {
            if (!editingAppointmentId) {
                toast.error("Selecione o agendamento que deseja alterar.");
                return;
            }

            const response = await UpdateAppointmentTime({
                appointmentId: editingAppointmentId,
                email: formData.email,
                clinicId: clinic.id,
                date: formData.date,
                time: selectedTime,
                serviceId: formData.service,
            });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success("Horário alterado com sucesso");
            switchToCreate();

            const blocked = await fetchBlockedTimes(formData.date);
            setBlockedTimes(blocked);
            setAvailableTimesSlots(
                generateTimeSlots().map((time) => ({
                    time,
                    available: !blocked.includes(time),
                }))
            );
            return;
        }

        const response = await CreateNewAppointments({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            serviceId: formData.service,
            time: selectedTime,
            clinicId: clinic.id,
        });

        if (response.error) {
            toast.error(response.error);
            return;
        }

        toast.success("Agendamento cadastrado com sucesso");

        const bookedDate = formData.date;
        reset({
            name: "",
            email: "",
            phone: "",
            date: bookedDate,
            service: "",
        });
        setSelectedTime(undefined);

        const blocked = await fetchBlockedTimes(bookedDate);
        setBlockedTimes(blocked);
        setAvailableTimesSlots(
            generateTimeSlots().map((time) => ({
                time,
                available: !blocked.includes(time),
            }))
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="h-32 bg-blue-400" />
            <section className="container mx-auto px-4 -mt-16">
                <div className="max-w-2xl mx-auto">
                    <article className="flex flex-col items-center mb-8">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white mb-4 shadow-md">
                            <Image
                                src={clinic.image ? clinic.image : imgTest}
                                alt={clinic.name ?? "Foto da clinica"}
                                className="object-cover"
                                fill
                                sizes="160px"
                            />
                        </div>

                        <h1 className="text-2xl font-bold mb-2">
                            {clinic.name ?? "Clinica"}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPinIcon className="w-4 h-4" />
                            <span>
                                {clinic.address
                                    ? clinic.address
                                    : "Endereço não informado"}
                            </span>
                        </div>
                    </article>

                    <div className="flex gap-2 mb-4">
                        <Button
                            type="button"
                            variant={mode === "create" ? "default" : "outline"}
                            className={
                                mode === "create"
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : ""
                            }
                            onClick={switchToCreate}
                        >
                            Novo agendamento
                        </Button>
                        <Button
                            type="button"
                            variant={
                                mode === "reschedule" ? "default" : "outline"
                            }
                            className={
                                mode === "reschedule"
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : ""
                            }
                            onClick={switchToReschedule}
                        >
                            Alterar horário
                        </Button>
                    </div>

                    {mode === "reschedule" && (
                        <div className="bg-white p-4 rounded-md shadow-md mb-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Email do agendamento</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={lookupEmail}
                                        onChange={(event) =>
                                            setLookupEmail(event.target.value)
                                        }
                                        placeholder="Digite o email usado no agendamento"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleLookupAppointments}
                                        disabled={loadingAppointments}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        {loadingAppointments
                                            ? "Buscando..."
                                            : "Buscar"}
                                    </Button>
                                </div>
                            </div>

                            {clientAppointments.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Selecione o agendamento</Label>
                                    <div className="space-y-2">
                                        {clientAppointments.map(
                                            (appointment) => {
                                                const dateLabel = formatDateInput(
                                                    appointment.appointmentDate
                                                );
                                                const selected =
                                                    editingAppointmentId ===
                                                    appointment.id;

                                                return (
                                                    <button
                                                        key={appointment.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectAppointment(
                                                                appointment
                                                            )
                                                        }
                                                        className={`w-full text-left border rounded-md p-3 transition ${
                                                            selected
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-gray-200 hover:border-blue-300"
                                                        }`}
                                                    >
                                                        <p className="font-medium">
                                                            {
                                                                appointment
                                                                    .service
                                                                    .name
                                                            }{" "}
                                                            — {appointment.time}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {dateLabel} ·{" "}
                                                            {appointment.name}
                                                        </p>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(
                                async (formData) =>
                                    await handleRegisterAppointment(formData)
                            )}
                            className="space-y-8 bg-white p-4 rounded-md shadow-md mb-10"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Nome completo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Digite seu nome completo"
                                                disabled={mode === "reschedule"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Digite seu email"
                                                disabled={mode === "reschedule"}
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
                                    <FormItem className="space-y-2">
                                        <FormLabel>Telefone</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Digite seu telefone"
                                                disabled={mode === "reschedule"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>
                                            Data de agendamento
                                        </FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                minDate={new Date()}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                initialDate={
                                                    field.value
                                                        ? toLocalDate(field.value)
                                                        : new Date()
                                                }
                                                onChange={(date) => {
                                                    field.onChange(
                                                        formatDateInput(date)
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="service"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">
                                            Selecione o serviço
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={mode === "reschedule"}
                                            items={clinic.services.map(
                                                (service) => ({
                                                    value: service.id,
                                                    label: `${service.name} - ${Math.floor(service.duration / 60)}h ${service.duration % 60}min`,
                                                })
                                            )}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o serviço" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clinic.services.map(
                                                    (service) => (
                                                        <SelectItem
                                                            key={service.id}
                                                            value={service.id}
                                                        >
                                                            {service.name} -{" "}
                                                            {Math.floor(
                                                                service.duration /
                                                                    60
                                                            )}
                                                            h{" "}
                                                            {service.duration %
                                                                60}
                                                            min
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <Label className="font-semibold">
                                    Selecione o horário
                                </Label>
                                <div className="bg-gray-100 p-4 rounded-lg min-h-30">
                                    {loadingSlots ? (
                                        <p>
                                            Carregando horários disponíveis...
                                        </p>
                                    ) : (
                                        <ScheduleTimeList
                                            onSelectTime={(time) =>
                                                setSelectedTime(time)
                                            }
                                            selectedDate={
                                                selectedDate || todayDate
                                            }
                                            selectedTime={selectedTime}
                                            blockedTimes={blockedTimes}
                                            availableTimesSlots={
                                                availableTimesSlots
                                            }
                                            clinicTimes={allTimes}
                                            requiredSlots={requiredSlots}
                                        />
                                    )}
                                </div>
                            </div>

                            {clinic.status ? (
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                                    disabled={
                                        !watch("name") ||
                                        !watch("email") ||
                                        !watch("phone") ||
                                        !watch("date") ||
                                        !watch("service") ||
                                        !selectedTime ||
                                        (mode === "reschedule" &&
                                            !editingAppointmentId)
                                    }
                                >
                                    {mode === "reschedule"
                                        ? "Salvar novo horário"
                                        : "Agendar horário"}
                                </Button>
                            ) : (
                                <p className="bg-red-500 text-white p-2 rounded-md text-center">
                                    A clinica esta fechada!!!
                                </p>
                            )}
                        </form>
                    </Form>
                </div>
            </section>
        </div>
    );
}
