import { Pool } from 'pg';

// verificamos que exista la variable de entorno
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en .env');
}

// pool de conexion a postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// si hay error en el pool lo mostramos
pool.on('error', (_err) => {
  console.error('Error en la conexion');
  process.exit(-1);
});

// funcion para hacer queries a la base de datos
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Query ejecutado', { text: text.substring(0, 50), duration, rows: result.rowCount });
    }
    return result.rows as T[];
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
}

// para usar transacciones
export async function getClient() {
  const client = await pool.connect();
  return client;
}

// cerrar conexion
export async function closePool() {
  await pool.end();
}

export default pool;
