const env = import.meta.env || {};

export const API = {
  usuarios: env.VITE_API_USUARIOS || 'https://2b7uq0rt3a.execute-api.us-east-1.amazonaws.com/dev',
  ordenes: env.VITE_API_ORDENES || 'https://kwcidzwvsc.execute-api.us-east-1.amazonaws.com/dev',
  visitas: env.VITE_API_VISITAS || 'https://1x84gwm4p8.execute-api.us-east-1.amazonaws.com/dev',
  tecnicos: env.VITE_API_TECNICOS || 'https://7nhawyju57.execute-api.us-east-1.amazonaws.com/dev',
  clientes: env.VITE_API_CLIENTES || 'https://a9t6mwghaj.execute-api.us-east-1.amazonaws.com/dev',
  repuestos: env.VITE_API_REPUESTOS || 'https://r3f8aycbn2.execute-api.us-east-1.amazonaws.com/dev'
};

export const TENANTS = ['tenant-1', 'tenant-2', 'tenant-3'];
