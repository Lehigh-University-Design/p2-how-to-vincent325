import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import trainRoutes from './routes.js';
import { initializeDatabase } from './database.js';

await initializeDatabase();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', trainRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

