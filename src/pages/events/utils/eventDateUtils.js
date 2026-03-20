export function formatDateInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatEventDateParts(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return {
            day: "--",
            month: "---",
            time: "--:--",
            fullDate: "Fecha no disponible",
        };
    }

    return {
        day: date.toLocaleDateString("es-ES", { day: "2-digit" }),
        month: date
            .toLocaleDateString("es-ES", { month: "short" })
            .replace(".", "")
            .toUpperCase(),
        time: date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        fullDate: date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
    };
}
