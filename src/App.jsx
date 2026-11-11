import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './pages/Layout.jsx';
import Login from './pages/Login.jsx';
import Inicio from './pages/Inicio.jsx';
import Lista from './pages/Lista.jsx';
import { MODULOS } from './modulos.js';

function Protegida({ children }) {
  const { sesion } = useAuth();
  return sesion ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { sesion } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={sesion ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <Protegida>
            <Layout />
          </Protegida>
        }
      >
        <Route index element={<Inicio />} />
        {MODULOS.map((m) => (
          <Route key={m.ruta} path={m.ruta} element={<Lista key={m.ruta} modulo={m} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
