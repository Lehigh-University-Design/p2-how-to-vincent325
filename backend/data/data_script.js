import fs from 'fs';

console.log("Running data script...");

// 1. Create a map of station Ids to station names (stops.csv)
let stationMap = new Map();
const data = fs.readFileSync('stops.csv', 'utf8');
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


// 2. Create a map of trips to routes (trips.csv)
let tripToRouteMap = new Map();
const tripData = fs.readFileSync('trips.csv', 'utf8');
const tripLines = tripData.split('\n');

for (let i=1; i<tripLines.length; i++) {
    const parts = tripLines[i].split(',');
    const routeId = parts[0];
    const tripId = parts[1];

    tripToRouteMap.set(tripId, routeId);
}
console.log("Trip to route map loaded:", tripToRouteMap.size, "trips.");

// 3. Create a map of routes to ordered list of stations (stop_times.csv)
const routeToAllTripPAtterns = new Map();
const stopTimeData = fs.readFileSync('stop_times.csv', 'utf8');
const stopTimeLines = stopTimeData.split('\n');

for (let i=1; i<stopTimeLines.length; i++) {
    const parts = stopTimeLines[i].split(',');

    if (parts.length < 5) {
        console.log(`Skipping malformed line ${i}: ${stopTimeLines[i]}`);
        continue;
    }

    const tripId = parts[0];
    const fullStopId = parts[1];
    const stopId = fullStopId.slice(0, -1);
    const stopSequence = parseInt(parts[4]);

    const train = tripToRouteMap.get(tripId);
    if (!routeToAllTripPAtterns.has(train)) {
        routeToAllTripPAtterns.set(train, new Map());
    }

    const tripPatterns = routeToAllTripPAtterns.get(train);
    if (!tripPatterns.has(tripId)) {
        tripPatterns.set(tripId, []);
    }

    const stopsWithSequenceArray = tripPatterns.get(tripId);
    stopsWithSequenceArray.push({
        stopId,
        stopSequence
    })
}

console.log("Route to trip patterns map loaded:", routeToAllTripPAtterns.size, "routes.");


// 4. For each route, determine the trip with the most stops and sort that trip to get ordered stations and return order stations
const finalOrderedRoutes = new Map();
for (const [train, tripPatterns] of routeToAllTripPAtterns.entries()) {
    let resultTrip = null;
    let maxStops = 0;

    for (const [tripId, stopsArray] of tripPatterns.entries()) {
        let numStops = stopsArray.length;
        if (numStops > maxStops) {
            maxStops = numStops;
            resultTrip = tripId;
        }
    }

    const highestNumberStopsTrip = tripPatterns.get(resultTrip);

    highestNumberStopsTrip.sort((a, b) => a.stopSequence - b.stopSequence);
    const orderedStopIds = highestNumberStopsTrip.map(item => item.stopId);

    finalOrderedRoutes.set(train, orderedStopIds);
}


// Write to JSON file

const output = {
    stationNames: Object.fromEntries(stationMap),
    orderedRoutes: Object.fromEntries(finalOrderedRoutes),
}
const jsonString = JSON.stringify(output, null, 2);
fs.writeFileSync('train_data.json', jsonString, 'utf8');



