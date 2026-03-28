const ERROR_RETURN_PATH_KEY = "app:error:return-path";
const ERROR_ROUTES = new Set(["/500", "/network-error"]);

const getCurrentPath = () =>
    `${window.location.pathname}${window.location.search}${window.location.hash}`;

export const rememberErrorReturnPath = (path?: string) => {
    if (typeof window === "undefined") return;

    const targetPath = path ?? getCurrentPath();
    if (!targetPath || ERROR_ROUTES.has(window.location.pathname)) return;

    try {
        window.sessionStorage.setItem(ERROR_RETURN_PATH_KEY, targetPath);
    } catch {
        // Ignore sessionStorage failures so error handling still works.
    }
};

export const getErrorReturnPath = () => {
    if (typeof window === "undefined") return "/";

    try {
        const storedPath = window.sessionStorage.getItem(ERROR_RETURN_PATH_KEY);
        return storedPath || "/";
    } catch {
        return "/";
    }
};

export const clearErrorReturnPath = () => {
    if (typeof window === "undefined") return;

    try {
        window.sessionStorage.removeItem(ERROR_RETURN_PATH_KEY);
    } catch {
        // Ignore sessionStorage failures so error handling still works.
    }
};

export const reloadErrorReturnPath = () => {
    if (typeof window === "undefined") return;

    const targetPath = getErrorReturnPath();
    clearErrorReturnPath();
    window.location.assign(targetPath);
};
