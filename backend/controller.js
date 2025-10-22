import { TRAIN_TO_ENDPOINT_MAP } from './config.js';
import { pool } from './database.js';
import { stationMap, orderedStations, getTrainArrivalData } from './mtaService.js';

export async function getTrainArrivals(req, res) {
    try {
        const trainLine = req.params.trainLine.toUpperCase();
        const result = await getTrainArrivalData(trainLine);
        res.json({
            trainLine,
            stations: result,
        })

        // res.json(feed);
    } catch (error) {
        console.error("Error fetching train arrivals:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getUserFavoriteStations(req, res) {
    const uuid =  req.params.uuid;
    try {
        const userEntries = `
            SELECT *
            FROM favorite_stations
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;

        const result = await pool.query(userEntries, [uuid]);
        const favorites = result.rows;

        // Batch call with Promise.all so we don't make the same call to the same endpoint 
        const uniqueTrains = new Set();
        for (const fav of favorites) {
            uniqueTrains.add(fav.train);
        }

        const endpointsArray = Array.from(uniqueTrains);
        const promises = endpointsArray.map( async (train) => {
            const data = await getTrainArrivalData(train); 
            return { train, data };
        })

        const results = await Promise.all(promises);
        // Map of endpoint to fetched data
        const endpointsData = new Map();
        for (const result of results) {
            endpointsData.set(result.train, result.data);
        }

        const finalResult = [];
        // Filter down the station that we need
        for (const favorite of favorites) {
            const data = endpointsData.get(favorite.train);

            const favoriteStation = data.find(
                station => station.stopId === favorite.stop_id 
            );

            finalResult.push({
                trainLine: favorite.train,
                stopId: favorite.stop_id,
                stopName: favorite.stop_name,
                northbound: favoriteStation ? favoriteStation.northbound : [], 
                southbound: favoriteStation ? favoriteStation.southbound : [] 
            })
        }

        res.json({ finalResult });

    } catch (error) {
        console.log("Error fetching favorites:", error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};

export async function addFavoriteStation(req, res) {
    const { uuid } = req.params;
    const { trainLine, stopId } = req.body;
    const stopName = stationMap.get(stopId);

    if (!trainLine || !stopId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!stopName) {
        return res.status(404).json({ error: 'Station not found' });
    }

    try {
        const insertQuery = `
            INSERT INTO favorite_stations (user_id, train, stop_id, stop_name)
            VALUES ($1, $2, $3, $4);
        `;

        await pool.query(insertQuery, [uuid, trainLine, stopId, stopName]);
        res.status(201).json({ message: 'Favorite added successfully' });
    } catch (error) {
        console.log("Error adding favorite:", error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
}

export async function deleteUserFavoriteStation(req, res) {
    const { uuid } = req.params;
    const { trainLine, stopId } = req.body;

    if (!trainLine || !stopId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const deleteQuery = `
            DELETE FROM favorite_stations
            WHERE user_id = $1 AND train = $2 AND stop_id = $3
        `;

        const result = await pool.query(deleteQuery, [uuid, trainLine, stopId])
        res.status(200).json({ message: 'Favorite deleted successfully' });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).json({ error: 'Failed to delete favorite' });
    }
}

export async function getStationsForTrainLine(req, res) {
    const trainLine = req.params.trainLine;

    const stopIds = orderedStations.get(trainLine);
    if (!stopIds) {
        return res.status(404).json({ error: 'Train line not found' });
    }

    const result = [];
    for (const stopId of stopIds) {
        const stopName = stationMap.get(stopId);
        result.push({ stopId, stopName });
    }

    res.json({ 
        trainLine, 
        stations: result
    })
}