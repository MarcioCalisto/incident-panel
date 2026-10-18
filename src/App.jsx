// src/App.jsx
import { useEffect, useState } from "react";
import IncidentForm from "./components/IncidentForm.jsx";
import IncidentList from "./components/IncidentList";

const initial = [
  { id: 1, title: "Sem acesso ao ERP", priority: "alta", resolved: false },
  { id: 2, title: "Impressora offline", priority: "baixa", resolved: false }
];

export default function App() {
  const [incidents, setIncidents] = useState(initial);

  useEffect(() => {
    const pending = incidents.filter((i) => !i.resolved).length;
    document.title = `Incidentes (${pending})`;
  }, [incidents]);

  const handleCreate = (data) => {
    const next = { id: Date.now(), ...data, resolved: false };
    setIncidents((prev) => [...prev, next]);
  };

  const handleToggle = (id) =>
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i))
    );

  const handleRemove = (id) =>
    setIncidents((prev) => prev.filter((i) => i.id !== id));

  return (
    <main className="container">
      <h1>Painel de Incidentes</h1>
      <IncidentForm onSubmit={handleCreate} />
      <IncidentList
        incidents={incidents}
        onToggle={handleToggle}
        onRemove={handleRemove}
      />
    </main>
  );
}
