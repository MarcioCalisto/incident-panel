// src/components/IncidentForm.jsx
import { useState } from 'react';
import { PRIORITES, hasErrors, validateIncident } from '../utils/validateIncident';

const EMPTY = { title: "", description: "", priority: "media" };

export default function IncidentForm({ onSubmit, initialValues = EMPTY }) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;
        const next = { ...values, [name]: value };
        setValues(next);
        if (touched[name]) setErrors(validateIncident(next));
    }

    function handleBlur(event) {
        const { name } = event.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors(validateIncident(values));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const found = validateIncident(values);
        setErrors(found);
        setTouched({ title: true, description: true, priority: true });
        if (hasErrors(found)) return;

        setSubmitting(true);
        setSubmitError("");
        try {
            await onSubmit({ ...values, title: values.title.trim() });
            setValues(EMPTY);
            setTouched({});
            setErrors({});
        } catch (error) {
            setSubmitError(error.message || "Não foi possível salvar o incidente");
        } finally {
            setSubmitting(false);
        }
    }

    const showError = (name) => touched[name] && errors[name];

    return (
        <form onSubmit={handleSubmit} noValidate className="form">
            <div className="field">
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(showError("title"))}
                    aria-describedby={showError("title") ? "title-error" : undefined}
                />
                {showError("title") && (
                    <p id="title-error" role="alert" className="error">{errors.title}</p>
                )}
            </div>

            <div className="field">
                <label htmlFor="description">Descrição</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(showError("description"))}
                    aria-describedby={showError("description") ? "description-error" : undefined}
                />
                {showError("description") && (
                    <p id="description-error" role="alert" className="error">{errors.description}</p>
                )}
            </div>

            <div className="field">
                <label htmlFor="priority">Prioridade</label>
                <select
                    id="priority"
                    title="Prioridade"
                    name="priority"
                    value={values.priority}
                    onChange={handleChange}
                    onBlur={handleBlur}
                >
                    {PRIORITES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                {showError("priority") && (
                    <p id="priority-error" role="alert" className="error">{errors.priority}</p>
                )}
            </div>

            {submitError && <p role="alert" className="error">{submitError}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar incidente"}
            </button>
        </form>
    );
}