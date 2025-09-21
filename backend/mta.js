import fetch from 'node-fetch';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { getEndpoint } from './config.js';
import fs from 'fs';

console.log("Loading station names...");

let stationMap = new Map();

try {
    const data = fs.readFileSync('./data/stops.csv', 'utf8');
    const lines = data.split('\n');

    for (let i=1; i<lines.length; i++) {
        const parts = lines[i].split(',');
        const stopId = parts[0];

        if (stopId.endsWith('N') || stopId.endsWith('S')) {
            continue;
        }
        const stopName = parts[1];
        stationMap.set(stopId, stopName);
    }

    console.log("Station names loaded:", stationMap.size, "stations.");
} catch (error) {
    console.error("Error loading station names:", error);
}


export async function getTrainArrivals(req, res) {
    try {
        const trainLine = req.params.trainLine.toUpperCase();

        const endpoint = getEndpoint(trainLine);
        if (!endpoint) {
            return res.status(404).json({
                error: `Unknown train line: ${trainLine}`,
                availableTrains: '1,2,3,4,5,6,7,A,C,E,B,D,F,M,G,J,Z,N,Q,R,W,L,SI'
            });
        }

        const response = await fetch(endpoint);
        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        const stations = {}
        const now = Date.now();

        feed.entity.forEach((entity) => {
            if (!entity.tripUpdate) return;
            if (entity.tripUpdate.trip.routeId !== trainLine) return;

            entity.tripUpdate.stopTimeUpdate.forEach((stop) => {
                const fullStopId = stop.stopId;
                const stopId = fullStopId.slice(0, -1);
                const letter = fullStopId.slice(-1);
                const direction = letter === 'N' ? 'Northbound' : (letter === 'S' ? 'Southbound' : 'Unknown');
                
                const arrivalTime = stop.arrival?.time;
                const trainDate = new Date(arrivalTime * 1000);
                const minutesAway = Math.round((trainDate - now) / 60000);

                if (minutesAway < 0) {
                    return;
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

                stations[stopId].northbound.sort((a, b) => a - b);
                stations[stopId].southbound.sort((a, b) => a - b);

            });
        });
        
        const result = Object.keys(stations).map(stopId => {
            return {
                stopId,
                stopName: stationMap.get(stopId) || 'Unknown Station',
                northbound: stations[stopId].northbound.slice(0, 3),
                southbound: stations[stopId].southbound.slice(0, 3),
            }
        });


        res.json({
            trainLine,
            stations: result,
        })
    } catch (error) {
        console.error("Error fetching train arrivals:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

