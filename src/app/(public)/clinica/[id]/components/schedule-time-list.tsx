"use client";

import { Button } from "@/components/ui/button";
import { TimeSlot } from "./schedule-content";
import { cn } from "@/lib/utils";
import {
    isSlotInThePast,
    isSlotSequenceAvailable,
    isToday,
} from "./schedule-utils";

interface ScheduleTimeListProps {
    selectedDate: string;
    selectedTime: string | undefined;
    requiredSlots: number;
    blockedTimes: string[];
    availableTimesSlots: TimeSlot[];
    clinicTimes: string[];
    onSelectTime: (time: string) => void;
}

export function ScheduleTimeList({
    selectedDate,
    selectedTime,
    requiredSlots,
    blockedTimes,
    availableTimesSlots,
    clinicTimes,
    onSelectTime,
}: ScheduleTimeListProps) {
    const dateIsToday = isToday(selectedDate);

    const slots =
        availableTimesSlots.length > 0
            ? availableTimesSlots
            : clinicTimes.map((time) => ({
                  time,
                  available: true,
              }));

    if (slots.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Nenhum horário cadastrado no perfil da clínica.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {slots.map((slot) => {
                const sequenceOK = isSlotSequenceAvailable(
                    slot.time,
                    requiredSlots,
                    clinicTimes,
                    blockedTimes
                );
                const slotIsPast = dateIsToday && isSlotInThePast(slot.time);
                const slotEnable = slot.available && sequenceOK && !slotIsPast;

                return (
                    <Button
                        key={slot.time}
                        type="button"
                        variant="outline"
                        disabled={!slotEnable}
                        onClick={() => slotEnable && onSelectTime(slot.time)}
                        className={cn(
                            "h-10 select-none",
                            selectedTime === slot.time &&
                                "border-2 border-blue-500 text-blue-600 bg-blue-50",
                            !slotEnable && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        {slot.time}
                    </Button>
                );
            })}
        </div>
    );
}
