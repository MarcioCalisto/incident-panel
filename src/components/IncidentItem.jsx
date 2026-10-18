// src/components/IncidentItem.jsx
export default function IncidentItem ({ incident, onToggle, onRemove}) {
    const {id, title, priority, resolved } = incident;

    return (
        <li className={resolved ? "item resolved" : "item"} > 
            <label>
                <input
                    type="checkbox"
                    checked={resolved}
                    onChange={() => onToggle(id)}
                />
                <span>{title}</span>
            </label>
            <span className={`badge badge-${priority}`}>{priority}</span>
            <button type="button" onClick={() => onRemove(id)} aria-label="Remover">
                Remover
            </button>
        </li>
    )
}