import { Pool } from "pg";

let pool;

export const getDb = () => {
  if (pool) return pool;
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("WARNING: DATABASE_URL is not set");
    return null;
  }

  pool = new Pool({
    connectionString,
    // Add some robustness for different providers
    ssl: connectionString.includes("supabase.co") || connectionString.includes("neon.tech") || connectionString.includes("railway.app") 
      ? { rejectUnauthorized: false } 
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return pool;
};
