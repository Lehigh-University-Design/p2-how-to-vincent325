import express from 'express';
import { 
    getTrainArrivals, 
    getUserFavoriteStations, 
    addFavoriteStation,
    deleteUserFavoriteStation, 
    getStationsForTrainLine 
} from './controller.js';

const router = express.Router();

// Main train tracker endpoint
router.get('/train/:trainLine', getTrainArrivals);

// Favorite stations endpoints (updates database)
router.get('/favorites/:uuid', getUserFavoriteStations);
router.post('/favorites/:uuid', addFavoriteStation);
router.delete('/favorites/:uuid', deleteUserFavoriteStation);

// Helper endpoint to get stations for a train line
router.get('/stations/:trainLine', getStationsForTrainLine);

export default router;