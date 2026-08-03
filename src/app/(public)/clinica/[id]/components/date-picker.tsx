"use client";

import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale";

import "react-datepicker/dist/react-datepicker.css";

registerLocale("pt-BR", ptBR);

interface DateTimePickerProps {
    minDate?: Date;
    className?: string;
    initialDate?: Date;
    onChange: (date: Date) => void;
}

export function DateTimePicker({
    initialDate,
    className,
    minDate,
    onChange,
}: DateTimePickerProps) {
    const [startDate, setStartDate] = useState(initialDate || new Date());

    useEffect(() => {
        if (initialDate) {
            setStartDate(initialDate);
        }
    }, [initialDate]);

    function handleChange(date: Date | null) {
        if (date) {
            setStartDate(date);
            onChange(date);
        }
    }

    return (
        <DatePicker
            className={className}
            selected={startDate}
            locale="pt-BR"
            minDate={minDate ?? new Date()}
            onChange={handleChange}
            dateFormat="dd/MM/yyyy"
        />
    );
}
