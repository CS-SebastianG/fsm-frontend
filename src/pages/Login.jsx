import { useState } from 'react';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { entrar } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await entrar(usuario.trim(), password);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login">
      <form className="tarjeta" onSubmit={enviar}>
        <h1>FSM SaaS</h1>
        <p className="sub">Gestión de servicios en campo · Grupo 5</p>

        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
