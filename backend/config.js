export const MTA_ENDPOINTS = {
    '1234567S': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
    'ACE': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
    'BDFM': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
    'G': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
    'JZ': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
    'L': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
    'NQRW': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
    'SI': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si',
}

export const TRAIN_TO_ENDPOINT_MAP = {
    '1': '1234567S',
    '2': '1234567S',
    '3': '1234567S',
    '4': '1234567S',
    '5': '1234567S',
    '6': '1234567S',
    '7': '1234567S',
    'S': '1234567S',
    'A': 'ACE',
    'C': 'ACE',
    'E': 'ACE',
    'B': 'BDFM',
    'D': 'BDFM',
    'F': 'BDFM',
    'M': 'BDFM',
    'G': 'G',
    'J': 'JZ',
    'Z': 'JZ',
    'L': 'L',
    'N': 'NQRW',
    'Q': 'NQRW',
    'R': 'NQRW',
    'W': 'NQRW',
    'SI': 'SI',
}

export function getEndpoint(line) {
    return MTA_ENDPOINTS[TRAIN_TO_ENDPOINT_MAP[line]] || null;
}