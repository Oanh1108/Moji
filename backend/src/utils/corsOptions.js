const normalizeOrigin = (origin = "") => origin.trim().replace(/\/$/, "");

export const getAllowedOrigins = () =>
    (process.env.CLIENT_URL || "")
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean);

export const isOriginAllowed = (origin) => {
    if (!origin) {
        return true;
    }

    return getAllowedOrigins().includes(normalizeOrigin(origin));
};

export const corsOptions = {
    origin(origin, callback) {
        callback(null, isOriginAllowed(origin));
    },
    credentials: true,
    optionsSuccessStatus: 204,
};
