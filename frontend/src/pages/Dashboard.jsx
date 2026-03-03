import { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [categoria, setCategoria] = useState(""); // ✅ ARREGLADO

  const [editando, setEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDosis, setEditDosis] = useState("");
  const [editCategoria, setEditCategoria] = useState("");

  const token = localStorage.getItem("token");

  // ======================
  // CARGAR MEDICAMENTOS
  // ======================
  const fetchMedicamentos = async () => {
    try {
      const res = await fetch("http://localhost:3001/medicamentos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERROR GET medicamentos:", data);
        setMedicamentos([]);
        return;
      }

      setMedicamentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("ERROR fetchMedicamentos:", err);
      setMedicamentos([]);
    }
  };

  useEffect(() => {
    fetchMedicamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================
  // AGREGAR
  // ======================
  const agregarMedicamento = async () => {
    if (!nombre || !dosis || !categoria) return;

    try {
      const res = await fetch("http://localhost:3001/medicamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, dosis, categoria }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERROR POST medicamentos:", data);
        alert(data?.error || "No se pudo agregar el medicamento");
        return;
      }

      setNombre("");
      setDosis("");
      setCategoria("");
      fetchMedicamentos();
    } catch (err) {
      console.error("ERROR agregarMedicamento:", err);
      alert("Error de conexión con el servidor");
    }
  };

  // ======================
  // CAMBIAR ESTADO
  // ======================
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3001/medicamentos/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERROR PATCH estado:", data);
        alert(data?.error || "No se pudo cambiar el estado");
        return;
      }

      fetchMedicamentos();
    } catch (err) {
      console.error("ERROR cambiarEstado:", err);
      alert("Error de conexión con el servidor");
    }
  };

  // ======================
  // ELIMINAR
  // ======================
  const eliminarMedicamento = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/medicamentos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERROR DELETE medicamento:", data);
        alert(data?.error || "No se pudo eliminar");
        return;
      }

      fetchMedicamentos();
    } catch (err) {
      console.error("ERROR eliminarMedicamento:", err);
      alert("Error de conexión con el servidor");
    }
  };

  // ======================
  // EDITAR
  // ======================
  const abrirEditor = (med) => {
    setEditando(med.id);
    setEditNombre(med.nombre);
    setEditDosis(med.dosis);
    setEditCategoria(med.categoria);
  };

  const guardarEdicion = async () => {
    try {
      const res = await fetch(`http://localhost:3001/medicamentos/${editando}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: editNombre,
          dosis: editDosis,
          categoria: editCategoria,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERROR PUT medicamento:", data);
        alert(data?.error || "No se pudo guardar la edición");
        return;
      }

      setEditando(null);
      fetchMedicamentos();
    } catch (err) {
      console.error("ERROR guardarEdicion:", err);
      alert("Error de conexión con el servidor");
    }
  };

  const puedeAgregar = Boolean(nombre && dosis && categoria);

  return (
    <div className="dash">
      <h1>💊 Panel de Medicamentos</h1>

      {/* FORMULARIO */}
      <div className="form-row">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          placeholder="Dosis"
          value={dosis}
          onChange={(e) => setDosis(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Categoría</option>
          <option value="Antibiótico">Antibiótico</option>
          <option value="Analgésico">Analgésico</option>
          <option value="Vitaminas">Vitaminas</option>
        </select>

        <button onClick={agregarMedicamento} disabled={!puedeAgregar}>
          Agregar
        </button>
      </div>

      {/* TABLA */}
      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dosis</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {medicamentos.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: 18 }}>
                No hay ningún medicamento aún
              </td>
            </tr>
          ) : (
            medicamentos.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td>{m.dosis}</td>
                <td>{m.categoria}</td>

                <td>
                  <span className={`badge ${m.estado === "tomado" ? "tomado" : "pendiente"}`}>
                    {m.estado === "tomado" ? "✓ Tomado" : "⏳ Pendiente"}
                  </span>
                </td>

                <td>
                  <div className="actions-modern">
                    <button
                      className={`action-btn success ${m.estado === "tomado" ? "active" : ""}`}
                      onClick={() => cambiarEstado(m.id, "tomado")}
                      disabled={m.estado === "tomado"}
                      title="Marcar como tomado"
                    >
                      ✓
                    </button>

                    <button
                      className={`action-btn warning ${m.estado === "pendiente" ? "active" : ""}`}
                      onClick={() => cambiarEstado(m.id, "pendiente")}
                      disabled={m.estado === "pendiente"}
                      title="Marcar como pendiente"
                    >
                      ⏳
                    </button>

                    <button className="action-btn edit" onClick={() => abrirEditor(m)} title="Editar">
                      ✏
                    </button>

                    <button className="action-btn delete" onClick={() => eliminarMedicamento(m.id)} title="Borrar">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {editando && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Editar medicamento</h3>

            <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
            <input value={editDosis} onChange={(e) => setEditDosis(e.target.value)} />

            <select value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)}>
              <option value="Antibiótico">Antibiótico</option>
              <option value="Analgésico">Analgésico</option>
              <option value="Vitaminas">Vitaminas</option>
            </select>

            <div className="modal-actions">
              <button className="btn-save" onClick={guardarEdicion}>
                Guardar
              </button>
              <button className="btn-cancel" onClick={() => setEditando(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}