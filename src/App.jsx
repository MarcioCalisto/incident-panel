// src/App.jsx
import { useEffect, useState } from "react";
import IncidentList from "./components/IncidentList";
import "./index.css"; // Garante que o CSS seja carregado

const initial = [
  { id: 1, title: "Sem acesso ao ERP", priority: "alta", resolved: false },
  { id: 2, title: "Impressora offline", priority: "baixa", resolved: false }
];

export default function App() {
  const [incidents, setIncidents] = useState(initial);
  const [title, setTitle] = useState(""); 

  // efeito: atualiza o titulo da aba sempre que a lista mudar
  useEffect(() => {
    const pending = incidents.filter((i) => !i.resolved).length;
    document.title = `Incidentes (${pending})`;
  }, [incidents]);

  function handleAdd(event) {
    event.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    const next = { id: Date.now(), title: clean, priority: "media", resolved: false };
    setIncidents((prev) => [next, ...prev]);
    setTitle("");
  }

  const handleToggle = (id) =>
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i))
    );

  const handleRemove = (id) =>
    setIncidents((prev) => prev.filter((i) => i.id !== id));

  return (
    <main className="container">
      <h1>Painel de Incidentes</h1>
      <form onSubmit={handleAdd} className="row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Descreva o incidente"
        />
        <button type="submit">Adicionar</button>
      </form>
      <IncidentList
        incidents={incidents}
        onToggle={handleToggle}
        onRemove={handleRemove}
      />
    </main>
  );
}
