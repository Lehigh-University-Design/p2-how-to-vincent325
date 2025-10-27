// Script to get all of database info and print it out to console
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// Check if --render flag is passed
const useRender = process.argv.includes('--render');
const dbUrl = useRender ? process.env.RENDER_DATABASE_URL : process.env.DATABASE_URL;

console.log(`\nConnecting to: ${useRender ? 'RENDER' : 'LOCAL'} database\n`);

async function getAllDatabaseInfo() {
    const pool = new Pool({
        connectionString: dbUrl,
        ...(useRender && { ssl: { rejectUnauthorized: false } })
    });

    try {
        // Get all favorite stations
        const res = await pool.query('SELECT * FROM favorite_stations ORDER BY created_at DESC');

        console.log('\n' + '='.repeat(120));
        console.log('DATABASE CONTENTS - FAVORITE_STATIONS TABLE');
        console.log('='.repeat(120));
        console.log(`Total records: ${res.rows.length}\n`);

        if (res.rows.length === 0) {
            console.log('No data found in the database.');
        } else {
            // Use console.table for horizontal table formatting
            console.table(res.rows);
        }

        console.log('\nDatabase query completed successfully!');

    } catch (err) {
        console.error('Error fetching data from database:', err);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}
getAllDatabaseInfo();

