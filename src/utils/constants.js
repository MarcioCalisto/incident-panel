// src/utils/constants.js
// Fonte única para o enum de prioridades.
// Tanto o validador (validateIncident) quanto o normalizador (incidentsApi)
// importam daqui para garantir consistência.
export const PRIORIDADES = ["baixa", "alta", "media"];

// Valor padrão usado quando a API não retorna prioridade.
export const PRIORIDADE_PADRAO = "media";
