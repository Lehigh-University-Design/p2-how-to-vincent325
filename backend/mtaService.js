import fetch from 'node-fetch';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { getEndpoint } from './config.js';
import fs from 'fs';

const stationMap = new Map();
const orderedStations = new Map();

try {
    const train_data = fs.readFileSync('./data/train_data.json', 'utf8');
    const trainData = JSON.parse(train_data);

    for (const [stopId, stopName] of Object.entries(trainData.stationNames)) {
        stationMap.set(stopId, stopName);
    }

    for (const [route, stops] of Object.entries(trainData.orderedRoutes)) {
        orderedStations.set(route, stops);
    }

} catch (error) {
    console.error("Error loading station names:", error);
}

export { stationMap, orderedStations };

export async function getTrainArrivalData(trainLine) {
    
    const endpoint = getEndpoint(trainLine);
        if (!endpoint) {
            throw new Error(`No endpoint found for train line: ${trainLine}`);
        }

        const response = await fetch(endpoint);
        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        const stations = {}
        const now = Date.now();

        for (const entity of feed.entity) {
            if (!entity.tripUpdate) continue;
            if (entity.tripUpdate.trip.routeId !== trainLine) continue;

            for (const stop of entity.tripUpdate.stopTimeUpdate) {
                const fullStopId = stop.stopId;
                const stopId = fullStopId.slice(0, -1);
                const letter = fullStopId.slice(-1);
                const direction = letter === 'N' ? 'Northbound' : (letter === 'S' ? 'Southbound' : 'Unknown');
                
                const arrivalTime = stop.arrival?.time;
                const trainDate = new Date(arrivalTime * 1000);
                const minutesAway = Math.round((trainDate - now) / 60000);

                if (minutesAway < 0 || isNaN(minutesAway)) {
                    continue;
                }

                if (!stations[stopId]) {
                    stations[stopId] = {
                        northbound: [],
                        southbound: []
                    };
                }

                if (direction === 'Northbound') {
                    stations[stopId].northbound.push(minutesAway);
                } else if (direction === 'Southbound') {
                    stations[stopId].southbound.push(minutesAway);
                }

            };
        };

        for (const stopId in stations) {
            stations[stopId].northbound.sort((a, b) => a - b);
            stations[stopId].southbound.sort((a, b) => a - b);
        }

        const result = [];
        const orderedStops = orderedStations.get(trainLine);
        if (orderedStops) {
            for (const stopId of orderedStops) {
                if (stations[stopId]) {
                    result.push({
                        stopId,
                        stopName: stationMap.get(stopId) || 'Unknown Station',
                        northbound: stations[stopId].northbound.slice(0, 3),
                        southbound: stations[stopId].southbound.slice(0, 3),
                    });
                }
            }
        }

        return result;
}

            