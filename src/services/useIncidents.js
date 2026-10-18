// src/services/useIncidents.js
import { useCallback, useEffect, useState} from "react";
import { incidentsApi } from "./incidentsApi";

export function useIncidents () {
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
            if (err.name === "AbortError") return; // requisição cancelada: ignore
            setError(err.message || "Falha ao carregar incidentes." )
        } finally  {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort(); // evita atualizar estado após desmontar
    }, [load]);

    const create = useCallback(async (payload) => {
        const created = await incidentsApi.create(payload);
        setIncidents((prev) => [created, ...prev]);
        return created;
    }, []);

    const update = useCallback(async (id, changes) => {
        const update = await incidentsApi.update(id, changes);
        setIncidents((prev) => prev.filter((i) => (i.Id === id ? update : i)));
        return update;
    }, []);

    const remove = useCallback(async (id) => {
        const remove = await incidentsApi.remove(id);
        setIncidents((prev) => prev.filter((i) => i.id !== id));
    }, []);

    return { incidents, loading, error, reload: () => load(), create, update, remove };
}