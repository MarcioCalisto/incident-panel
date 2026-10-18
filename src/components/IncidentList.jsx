// src/components/IncidentList.jsx
import IncidentItem from "./IncidentItem.jsx";

// CORREÇÃO: Certifique-se de usar "incidents" (plural)
export default function IncidentList ({ incidents, onToggle, onRemove }) {
    if (incidents.length === 0) {
        return <p>Nenhum incidente cadastrado.</p>;
    }

    return (
        <ul className="list">
            {/* CORREÇÃO: Alterado de incident.map para incidents.map */}
            {incidents.map((incident) => (
                <IncidenteItem
                    key={incident.id}
                    incident={incident}
                    onToggle={onToggle}
                    onRemove={onRemove}
                />
            ))}
        </ul>
    );
}
