// src/components/IncidentList.jsx
import IncidentItem from "./IncidentItem.jsx";

export default function IncidentList({ incidents, onToggle, onRemove }) {
    if (incidents.length === 0) {
        return <p>Nenhum incidente cadastrado.</p>;
    }

    return (
        <ul className="list">
            {incidents.map((incident) => (
                <IncidentItem
                    key={incident.id}
                    incident={incident}
                    onToggle={onToggle}
                    onRemove={onRemove}
                />
            ))}
        </ul>
    );
}
