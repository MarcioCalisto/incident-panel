import { useCallback, useEffect, useState } from "react";
import { incidentsApi } from "./incidentsApi.js";

export function useIncidents() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError("");
        try {
            const data = await incidentsApi.list(signal);
            setIncidents(data);
        } catch (err) {
            if (err.name === "AbortError") return;
            setError(err.message || "Falha ao carregar incidentes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const create = useCallback(async (payload) => {
        const created = await incidentsApi.create(payload);
        setIncidents((prev) => [created, ...prev]);
        return created;
    }, []);

    const update = useCallback(async (id, changes) => {
        const updated = await incidentsApi.update(id, changes);
        setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
        return updated;
    }, []);

    const remove = useCallback(async (id) => {
        await incidentsApi.remove(id);
        setIncidents((prev) => prev.filter((i) => i.id !== id));
    }, []);

    return { incidents, loading, error, reload: () => load(), create, update, remove };
}