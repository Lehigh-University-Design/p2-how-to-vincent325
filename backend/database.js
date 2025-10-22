import pg from 'pg';
const { Pool } = pg;

let pool;

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS favorite_stations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        train VARCHAR(10) NOT NULL,
        stop_id VARCHAR(10) NOT NULL,
        stop_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

async function initializeDatabase() {
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        await pool.query(createTableQuery);
        console.log("Favorite stations table is ready");
    } catch (err) {
        console.error("Error creating table:", err);
    }
}

export { pool, initializeDatabase };
