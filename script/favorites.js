// Train line to color mapping
const NUMBER_COLORS = {
    '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',  // Red
    '4': '#009952', '5': '#009952', '6': '#009952',  // Green
    '7': '#9A38A1',  // Purple
    'A': '#0062CF', 'C': '#0062CF', 'E': '#0062CF',  // Blue
    'B': '#EB6800', 'D': '#EB6800', 'F': '#EB6800', 'M': '#EB6800',  // Orange
    'G': '#799534',  // Light Green
    'J': '#8E5C33', 'Z': '#8E5C33',  // Brown
    'L': '#7C858C', 'S': '#7C858C',  // Gray
    'N': '#F6BC26', 'Q': '#F6BC26', 'R': '#F6BC26', 'W': '#F6BC26',  // Yellow
    'SI': '#08179C'  // MTA Blue
};

const API_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://localhost:3000'
    : 'https://mta-live-tracker.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('uuid')) {
        localStorage.setItem('uuid', crypto.randomUUID());
    }
    loadFavoriteStations();
});

const loadFavoriteStations = async () => {
    const container = document.querySelector('.favorite-stations-container');
    container.replaceChildren(createNewFavoriteCard());

    try {
        const uuid = localStorage.getItem('uuid');
        const apiUrl = `${API_BASE}/api/favorites/${uuid}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('API Error');
        }
        const data = await response.json();

        (data.finalResult || []).forEach(favorite => {
            const card = createFavoriteCard(favorite);
            container.appendChild(card);
        });
    } catch (error) {
        console.log(error);
    }
};

const createFavoriteCard = (favorite) => {
    const card = element('div', 'favorite-card');
    card.appendChild(createHeaderElement(favorite.trainLine, favorite.stopName));

    const arrivalSection = element('div', 'favorite-content');
    arrivalSection.appendChild(createFavoriteArrivalSection("Northbound: ", favorite.northbound));
    arrivalSection.appendChild(createFavoriteArrivalSection("Southbound: ", favorite.southbound));
    card.appendChild(arrivalSection);
    return card;
};

const createHeaderElement = (trainLine, stationName) => {
    const header = element('div', 'favorite-header');
    header.style.backgroundColor = NUMBER_COLORS[trainLine] || '#000';

    header.appendChild(element('span', 'favorite-train-icon', trainLine));
    header.appendChild(element('span', 'favorite-station-name', stationName));

    const deleteButton = element('span', 'favorite-delete-button');
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1zM4.934 21.071 4 8h16l-.934 13.071a1 1 0 0 1-1 .929H5.931a1 1 0 0 1-.997-.929zM15 18a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0z"/></svg>';
    header.appendChild(deleteButton);

    return header;
}

const createFavoriteArrivalSection = (direction, times) => {
    const section = element('div', 'favorite-arrival-section');
    const label = element('strong', 'favorite-arrival-label', direction);
    section.appendChild(label);

    if (times?.length > 0) {
        times.forEach(time => {
            const timeDiv = element('div', 'favorite-time', `• ${time} min`);
            section.appendChild(timeDiv);
        });
    } else {
        section.appendChild(element('div', 'favorite-no-arrivals', 'No arrivals'));
    }
    return section;
}

const createNewFavoriteCard = () => {

}

const element = (tag, className, textContent) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

