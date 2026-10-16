// src/utils/validateIncident.js
export const PRIORITES =["baixa", "alta", "media"];

export function validateIncident(values) {
    const errors = {};
    const title = values.title?.trim() ?? "";
    const description = values.description?.trim() ?? "";

    if (title.length < 5){
        errors.title = "O título devo ter pelo menos 5 caracteres.";
    } else if (title.length > 80) {
        errors.title = "O título deve ter no máximo 80 caractereres"
    }

    if (description.length > 500) {
        errors.description = "A descrição deve ter no máximo 500 caracteres"
    }

    if (!PRIORITES.includes(values.priority)) {
        errors.priority = "Selecione uma propriedade válida.";
    }

    return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;