import express from 'express';
import { getTrainArrivals } from './mta.js';

const router = express.Router();
router.get('/train/:trainLine', getTrainArrivals);

export default router;