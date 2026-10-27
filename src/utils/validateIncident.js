import { PRIORIDADES } from "./constants.js";

export { PRIORIDADES };

export function validateIncident(values) {
    const errors = {};
    const title = values.title?.trim() ?? "";
    const description = values.description?.trim() ?? "";

    if (title.length < 5) {
        errors.title = "O título deve ter pelo menos 5 caracteres.";
    } else if (title.length > 80) {
        errors.title = "O título deve ter no máximo 80 caracteres.";
    }

    if (description.length > 500) {
        errors.description = "A descrição deve ter no máximo 500 caracteres.";
    }

    if (!PRIORIDADES.includes(values.priority)) {
        errors.priority = "Selecione uma prioridade válida.";
    }

    return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;