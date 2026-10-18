// src/services/http.js
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

export async function request (path, { method = 'GET', body, signal } = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        method, 
        signal, 
        headers: body ? {"Content-Type": "application/json"} : undefined,
        body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);

    if(!response.ok) {
        throw new ApiError(
            data?.detail?.toString() ?? `Erro HTTP ${response.status}`,
            response.status,
            data
        );
    }
    return data;
}