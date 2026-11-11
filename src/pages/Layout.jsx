import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { MODULOS } from '../modulos.js';

export default function Layout() {
  const { sesion, salir } = useAuth();
  return (
    <div className="app">
      <header className="barra">
        <strong className="marca">FSM SaaS</strong>
        <nav>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          {MODULOS.map((m) => (
            <NavLink key={m.ruta} to={`/${m.ruta}`}>
              {m.titulo}
            </NavLink>
          ))}
        </nav>
        <div className="usuario">
          <span className="insignia">{sesion.tenant_id}</span>
          <span>
            {sesion.nombre || sesion.user_id} · {sesion.rol}
          </span>
          <button className="secundario" onClick={salir}>
            Salir
          </button>
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
