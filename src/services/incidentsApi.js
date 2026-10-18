// src/services/incidentsApi.js
import { request } from "./http.js";

export const incidentsApi = {
    list: (signal) => request("/incidents", {signal}),
    create: (payload) => request("/incidents", {method: "POST", body: payload}),
    update: (id, payload) => 
        request(`/incidents/${id}`, {method: "PATCH", body: payload}),
    remove: (id) => request(`/incidents/${id}`, {method: "DELETE"})
};