# FSM SaaS · Frontend (base + login)

Base del frontend del proyecto (Grupo 5). React + Vite, pensado para publicarse en AWS Amplify.

## Qué incluye
- **Login** con empresa (tenant), usuario y contraseña, conectado a `POST /usuarios/login`.
- La sesión (token, tenant, rol) se guarda en el navegador y se cierra sola cuando vence el token (60 min).
- **Menú base** y una lista (solo lectura, con "Cargar más" y búsqueda) para cada módulo: órdenes, visitas, clientes, sitios, técnicos, repuestos y facturas (con botón para ver el PDF).
- Todas las llamadas pasan por `src/api.js`, que entiende los dos formatos de respuesta del backend: `{"statusCode": ..., "body": ...}` (HTTP siempre 200) y la respuesta HTTP normal.

## Cómo correrlo
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas de la capa de API
npm run build      # genera dist/
```

## Dónde cambiar las URLs
`src/config.js` trae por defecto las URLs del despliegue actual. Para usar otras, copia `.env.example` a `.env` y cambia los valores `VITE_API_*`. En Amplify se definen como variables de entorno.

## Cómo agregar una pantalla
1. Agrega el módulo en `src/modulos.js` (servicio, ruta, colección y columnas).
2. Si necesita algo más que una lista, crea la página en `src/pages/` y agrégala en `src/App.jsx`.
3. Usa `const { pedir } = useAuth()` para llamar al backend con el token: `await pedir('ordenes', '/ordenes', { metodo: 'POST', cuerpo: {...} })`.

## Despliegue en Amplify
El archivo `amplify.yml` ya tiene los pasos de build (`npm ci` y `npm run build`, carpeta `dist`). El router usa `#` en las rutas, así que no hace falta configurar redirecciones.

## Usuarios de prueba
Tenants `tenant-1`, `tenant-2` y `tenant-3`; usuarios `admin1`, `despachador1` y `tecnico1`; contraseña `Fsm2026!`.
