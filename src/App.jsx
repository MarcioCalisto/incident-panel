// src/App.jsx
import { useEffect, useState } from "react";
import IncidentForm from "./components/IncidentForm.jsx";
import IncidentList from "./components/IncidentList.jsx";
import { useIncidents } from "./services/useIncidents.js";
import "./index.css";

export default function App() {
  const { incidents, loading, error, reload, create, update, remove } = useIncidents();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const pending = incidents.filter((i) => !i.resolved).length;
    document.title = `Incidentes (${pending})`;
  }, [incidents]);

  async function safe(action) {
    setActionError("");
    try {
      await action();
    } catch (e) {
      setActionError(e.message || "Não foi possível concluir a ação.");
    }
  }

  const handleToggle = (id) => {
    const current = incidents.find((i) => i.id === id);
    if (current) safe(() => update(id, { resolved: !current.resolved }));
  };

  const handleRemove = (id) => safe(() => remove(id));

  return (
    <main className="container">
      <h1>Painel de Incidentes</h1>

      <IncidentForm onSubmit={create} />

      {actionError && <p role="alert" className="error">{actionError}</p>}
      {loading && <p role="status">Carregando incidentes...</p>}

      {error && (
        <div role="alert">
          <p className="error">{error}</p>
          <button type="button" onClick={reload}>Tentar novamente</button>
        </div>
      )}

      {!loading && !error && (
        <IncidentList
          incidents={incidents}
          onToggle={handleToggle}
          onRemove={handleRemove}
        />
      )}
    </main>
  );
}