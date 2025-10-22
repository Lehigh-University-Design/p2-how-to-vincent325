// Train line to color mapping
const ALL_TRAIN_COLORS = {
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

const ALL_TRAIN_LINES = ['1', '2', '3', '4', '5', '6', '7', 
                      'A', 'C', 'E', 'B', 'D', 'F', 'M', 
                      'G', 'J', 'Z', 'L', 'S', 
                      'N', 'Q', 'R', 'W', 'SI'];

const API_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://localhost:3000'
    : 'https://mta-live-tracker.onrender.com';

const favoriteModal = document.getElementById('favorites-modal');
const favoriteModalOverlay = document.querySelector('.modal-overlay');
const favoriteCloseButton = favoriteModal.querySelector('.close-button');
const favoriteModalTitle = favoriteModal.querySelector('.modal-title');
const favoriteModalContent = favoriteModal.querySelector('.favorites-container');

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

    card.appendChild(createHeaderElement(favorite.trainLine, favorite.stopName, favorite.stopId));

    const arrivalSection = element('div', 'favorite-content');
    arrivalSection.appendChild(createFavoriteArrivalSection("Northbound: ", favorite.northbound));
    arrivalSection.appendChild(createFavoriteArrivalSection("Southbound: ", favorite.southbound));
    card.appendChild(arrivalSection);
    return card;
};

const createHeaderElement = (trainLine, stationName, stopId) => {
    const header = element('div', 'favorite-header');
    header.style.backgroundColor = ALL_TRAIN_COLORS[trainLine] || '#000';

    header.appendChild(element('span', 'favorite-train-icon', trainLine));
    header.appendChild(element('span', 'favorite-station-name', stationName));

    const deleteButton = element('span', 'favorite-delete-button');
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1zM4.934 21.071 4 8h16l-.934 13.071a1 1 0 0 1-1 .929H5.931a1 1 0 0 1-.997-.929zM15 18a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0z"/></svg>';
    deleteButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteFavoriteStation(trainLine, stopId);
    });

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

// Create new favorite. Linked to modal 
const createNewFavoriteCard = () => {
    const card = element('div', 'favorite-card new-favorite-card');
    const addButton = element('div', 'new-favorite-button', '+');
  
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        openFavoriteModal();
    });

    card.appendChild(addButton);
    return card;    
}

const openFavoriteModal = () => {
    favoriteModal.classList.add('show');
    favoriteModalOverlay.classList.add('show');
    loadFavoriteModalContent();
};

let selectedStation = null;
let selectedTrainLine = null;

const loadFavoriteModalContent = async () => {
    favoriteModalContent.replaceChildren();

    const leftPanel = element('div', 'train-list-left');
    ALL_TRAIN_LINES.forEach(line => {
        const button = element('button', 'train-button', line);
        button.addEventListener('click', () => {
            handleTrainLineSelection(line, button);
        });
        button.style.backgroundColor = ALL_TRAIN_COLORS[line] || '#000';
        leftPanel.appendChild(button);
    });

    const rightPanel = element('div', 'station-list-right');
    const createFavoriteButton = element('button', 'create-favorite-button', 'Add New Favorite');
    createFavoriteButton.disabled = true;

    createFavoriteButton.addEventListener('click', async () => {
        if (selectedStation && selectedTrainLine) {
            await addFavoriteToDatabase(selectedTrainLine, selectedStation);
        }
    });

    favoriteModalContent.appendChild(leftPanel);
    favoriteModalContent.appendChild(rightPanel);
    favoriteModalContent.appendChild(createFavoriteButton);
};

const handleTrainLineSelection = async (trainLine, button) => {
    const leftPanel = favoriteModalContent.querySelector('.train-list-left');
    const rightPanel = favoriteModalContent.querySelector('.station-list-right');
    const createButton = favoriteModalContent.querySelector('.create-favorite-button');
    
    leftPanel.querySelectorAll('.train-button').forEach(btn => 
        btn.classList.remove('selected')
    );

    button.classList.add('selected');

    rightPanel.replaceChildren();
    selectedStation = null;
    selectedTrainLine = trainLine;
    createButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/stations/${trainLine}`);
        const data = await response.json();
        
        data.stations.forEach(station => {
            const stationButton = element('button', 'station-button', station.stopName);
            
            stationButton.addEventListener('click', () => {
                // clear previous selection
                rightPanel.querySelectorAll('.station-button').forEach(btn => 
                    btn.classList.remove('selected')
                );
                stationButton.classList.add('selected');
                
                // set selected station
                selectedStation = station.stopId;
                
                createButton.disabled = false;
            });
            
            rightPanel.appendChild(stationButton);
        });
    } catch (error) {
        console.error('Error loading stations:', error);
    }
};

const addFavoriteToDatabase = async (trainLine, stopId) => {
    const uuid = localStorage.getItem('uuid');
    const apiUrl = `${API_BASE}/api/favorites/${uuid}`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainLine, stopId })
    });
    
    if (response.ok) {
        closeFavoriteModal();
        await loadFavoriteStations();
    }
};

const closeFavoriteModal = () => {
    favoriteModal.classList.remove('show');
    favoriteModalOverlay.classList.remove('show');
    clearElement(favoriteModalContent);
};

// Event listeners for closing modal
favoriteCloseButton.addEventListener('click', closeFavoriteModal);
favoriteModalOverlay.addEventListener('click', closeFavoriteModal);

// Delete
const deleteFavoriteStation = async (trainLine, stopId) => {
    try {
        const uuid = localStorage.getItem('uuid');
        const apiUrl = `${API_BASE}/api/favorites/${uuid}`;

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trainLine, stopId }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete favorite station');
        }
        
        await loadFavoriteStations();
    } catch (error) {
        console.error(error);
    }
};

// Helper to create elements
const element = (tag, className, textContent) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

