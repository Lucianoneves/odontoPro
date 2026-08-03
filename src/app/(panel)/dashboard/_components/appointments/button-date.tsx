"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export function ButtonPickerAppointment() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");

    const [selectedDate, setSelectedDate] = useState(
        dateParam || format(new Date(), "yyyy-MM-dd")
    );

    useEffect(() => {
        if (dateParam) {
            setSelectedDate(dateParam);
        }
    }, [dateParam]);

    function handleChangeDate(e: React.ChangeEvent<HTMLInputElement>) {
        const newDate = e.target.value;
        setSelectedDate(newDate);

        const url = new URL(window.location.href);
        url.searchParams.set("date", newDate);
        router.push(`${url.pathname}?${url.searchParams.toString()}`);
    }

    return (
        <input
            type="date"
            id="appointment-date"
            className="border-2 px-2 py-1 rounded-md text-sm md:text-base"
            value={selectedDate}
            onChange={handleChangeDate}
        />
    );
}
