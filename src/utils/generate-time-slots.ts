export function generateTimeSlots(startHour = 8, endHour = 24): string[] {
    const hours: string[] = [];

    for (let i = startHour; i < endHour; i++) {
        for (let j = 0; j < 2; j++) {
            const hour = i.toString().padStart(2, "0");
            const minute = (j * 30).toString().padStart(2, "0");
            hours.push(`${hour}:${minute}`);
        }
    }

    return hours;
}
