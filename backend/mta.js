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

        const station = {}
        const now = Date.now();

        feed.entity.forEach((entity) => {
            if (!entity.tripUpdate) return;
            if (entity.tripUpdate.trip.routeId !== trainLine) return;

            entity.tripUpdate.stopTimeUpdate.
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

