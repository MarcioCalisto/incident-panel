// src/services/incidentsApi.js
import { request } from "./http.js";

const fromApi = (r) => ({
  id: r.id ?? r.Id ?? r._id,
  title: r.title ?? r.Title ?? r.titulo ?? r.Titulo ?? "",
  description: r.description ?? r.Description ?? r.descricao ?? r.Descricao ?? "",
  priority: String(r.priority ?? r.Priority ?? r.prioridade ?? r.Prioridade ?? "media").toLowerCase(),
  resolved: Boolean(r.resolved ?? r.Resolved ?? r.resolvido ?? r.Resolvido),
});

export const incidentsApi = {
  list: async (signal) => {
    const data = await request("/incidents", { signal });   // aqui `data` é declarada dentro da função
    console.log("FORMATO DA API:", data[0]);                // temporário
    return data.map(fromApi);
  },
  create: async (payload) =>
    fromApi(await request("/incidents", { method: "POST", body: payload })),
  update: async (id, payload) =>
    fromApi(await request(`/incidents/${id}`, { method: "PATCH", body: payload })),
  remove: (id) => request(`/incidents/${id}`, { method: "DELETE" }),
};