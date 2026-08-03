export function isToday(date: Date | string) {
    const selected =
        typeof date === "string"
            ? (() => {
                  const [year, month, day] = date.split("-").map(Number);
                  return new Date(year, month - 1, day);
              })()
            : date;

    const today = new Date();

    return (
        selected.getDate() === today.getDate() &&
        selected.getMonth() === today.getMonth() &&
        selected.getFullYear() === today.getFullYear()
    );
}

// Verificar se o slot está no passado
export function isSlotInThePast(slotTime: string) {
    const [slotHours, slotMinutes] = slotTime.split(":").map(Number);

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (slotHours < currentHours) {
        return true;
    }

    if (slotHours === currentHours && slotMinutes <= currentMinutes) {
        return true;
    }

    return false;
}

// Verifica se há slots consecutivos livres a partir do horário inicial
export function isSlotSequenceAvailable(
    startSlot: string,
    requiredSlots: number,
    allSlots: string[],
    blockedSlots: string[]
) {
    const startIndex = allSlots.indexOf(startSlot);

    if (startIndex === -1 || startIndex + requiredSlots > allSlots.length) {
        return false;
    }

    for (let i = startIndex; i < startIndex + requiredSlots; i++) {
        const slotTime = allSlots[i];

        if (blockedSlots.includes(slotTime)) {
            return false;
        }
    }

    return true;
}
