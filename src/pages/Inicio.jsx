import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { MODULOS } from '../modulos.js';

function minutosRestantes(expires) {
  return Math.max(0, Math.round((new Date(expires).getTime() - Date.now()) / 60000));
}

export default function Inicio() {
  const { sesion } = useAuth();
  const [minutos, setMinutos] = useState(minutosRestantes(sesion.expires));

  useEffect(() => {
    const id = setInterval(() => setMinutos(minutosRestantes(sesion.expires)), 30000);
    return () => clearInterval(id);
  }, [sesion.expires]);

  return (
    <>
      <h1>Hola, {sesion.nombre || sesion.user_id}</h1>
      <p className="sub">
        Empresa <strong>{sesion.tenant_id}</strong> · rol <strong>{sesion.rol}</strong> · la sesión vence en{' '}
        <strong>{minutos} min</strong>
      </p>
      <div className="rejilla">
        {MODULOS.map((m) => (
          <Link key={m.ruta} to={`/${m.ruta}`} className="modulo">
            <h2>{m.titulo}</h2>
            <p>{m.descripcion}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
