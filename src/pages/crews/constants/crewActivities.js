// Definimos la lista de actividades y subactividades
export const ACTIVITY_OPTIONS = [
    {
        value: "Deportes",
        label: "Deportes",
        subactivities: [
            "Fútbol",
            "Baloncesto",
            "Pádel",
            "Tenis",
            "Running",
            "Ciclismo",
            "Gimnasio",
            "Balonmano",
            "Boxeo",
            "Voleibol",
            "Natación",
            "Escalada",
            "Surf",
            "Skate",
            "Esquí",
            "Snowboard",
        ],
    },
    {
        value: "Ocio",
        label: "Ocio",
        subactivities: [
            "Juegos de mesa",
            "Videojuegos",
            "Cine",
            "Escape room",
            "Quedadas sociales",
            "Teatro",
        ],
    },
    {
        value: "Música",
        label: "Música",
        subactivities: [
            "Rock",
            "Jazz",
            "Clásica",
            "Electrónica",
            "Pop",
            "Rap",
            "Hip-Hop",
            "Reggae",
            "Blues",
            "Country",
            "Folk",
            "Conciertos",
            "DJ / Producción",
        ],
    },
    {
        value: "Estudios",
        label: "Estudios",
        subactivities: [
            "Grupos de estudio",
            "Preparación de exámenes",
            "Cursos",
            "Talleres",
            "Formación online",
        ],
    },
    {
        value: "Trabajo y Proyectos",
        label: "Trabajo y Proyectos",
        subactivities: [
            "Proyecto académico",
            "Proyecto personal",
            "Startup / Idea",
            "Equipo de trabajo",
            "Networking",
            "Reuniones",
            "Colaboraciones",
        ],
    },
    {
        value: "Eventos y Comunidades",
        label: "Eventos y Comunidades",
        subactivities: [
            "Eventos puntuales",
            "Eventos semanales",
            "Eventos mensuales",
            "Comunidad local",
            "Asociaciones",
            "Voluntariado",
            "Grupos de interés",
            "Meetups",
            "Conferencias",
            "Ferias",
            "Festivales",
        ],
    },
    {
        value: "Otros",
        label: "Otros",
        subactivities: [
            "Otra actividad",
        ],
    },
];

// Definimos unos estilos basicos para que cada actividad tenga su propia identidad visual
export const ACTIVITY_STYLES = {
    "Deportes": { bg: "#e8f5e9", accent: "#2e7d32", dot: "#4caf50" },
    "Música": { bg: "#fce4ec", accent: "#880e4f", dot: "#e91e63" },
    "Ocio": { bg: "#fff8e1", accent: "#e65100", dot: "#ff9800" },
    "Trabajo y Proyectos": { bg: "#e3f2fd", accent: "#0d47a1", dot: "#2196f3" },
    "Estudios": { bg: "#f3e5f5", accent: "#4a148c", dot: "#9c27b0" },
    "Eventos y Comunidades": { bg: "#e0f7fa", accent: "#006064", dot: "#00bcd4" },
    "Otros": { bg: "#f5f5f5", accent: "#333", dot: "#999" },
};

// Estilo por defecto para actividades no reconocidas
export const DEFAULT_ACTIVITY_STYLE = {
    bg: "#f5f5f5",
    accent: "#333",
    dot: "#999",
};

// Función auxiliar para obtener las subactividades de una actividad dada
export const getSubactivitiesFor = (activity) => {
    const match = ACTIVITY_OPTIONS.find((option) => option.value === activity);
    return match ? match.subactivities : [];
};
