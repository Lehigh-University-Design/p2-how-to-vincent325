// Color mapping
const TRAIN_COLORS = {
    green: '#009952',
    red: '#EE352E',
    blue: '#0062CF',
    purple: '#9A38A1',
    orange: '#EB6800',
    yellow: '#F6BC26',
    gray: '#7C858C',
    brown: '#8E5C33',
    'light-green': '#799534',
    'mta-blue': '#08179C'
};


// Get DOM elements
const modal = document.getElementById('modal');
const modalOverlay = document.querySelector('.modal-overlay');
const closeButton = modal.querySelector('.close-button');
const modalTitle = modal.querySelector('.modal-title');
const trainButtons = document.querySelectorAll('.train-button');

// Add click listeners
trainButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const trainLine = event.currentTarget.getAttribute('data-train');

        if (!trainLine) {
            return;
        }

        openModal(event.currentTarget, trainLine);
    });
});

// Helper function to create loading message
const createLoadingElement = () => {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Loading train data...';
    return loading;
};

// Helper function to create error message
const createErrorElement = (message) => {
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    return error;
};

// Helper function to clear element content
const clearElement = (element) => {
    element.replaceChildren();
};

// Open modal
const openModal = (button, trainLine) => {
    const buttonColor = getButtonColor(button);

    modal.classList.add('show');
    modalOverlay.classList.add('show');

    modalTitle.textContent = `${trainLine} Train - Loading...`;
    modalTitle.style.color = buttonColor;

    const trainLineElement = modal.querySelector('.train-line');
    clearElement(trainLineElement);
    trainLineElement.appendChild(createLoadingElement());

    loadTrainData(trainLine, buttonColor);
};

// Get button color
const getButtonColor = (button) => {
    const colorClass = Array.from(button.classList).find(cls => TRAIN_COLORS[cls]);
    return TRAIN_COLORS[colorClass] ?? TRAIN_COLORS.gray;
};

// Load train data
const loadTrainData = async (trainLine, buttonColor) => {
    // Detect if running locally or in production
    const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:3000'
        : 'https://mta-live-tracker.onrender.com';

    const apiUrl = `${API_BASE_URL}/api/train/${trainLine}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('API Error');
        }

        const data = await response.json();

        modalTitle.textContent = `${trainLine} Train`;
        modalTitle.style.color = buttonColor;

        buildTrainLine(data, buttonColor);
    } catch (error) {
        const trainLineElement = modal.querySelector('.train-line');
        clearElement(trainLineElement);
        trainLineElement.appendChild(createErrorElement('Failed to load train data. Please try again.'));
    }
};

// Build train line
const buildTrainLine = (data, buttonColor) => {
    const trainLineElement = modal.querySelector('.train-line');
    clearElement(trainLineElement);

    // Set the CSS variable for the train line color
    trainLineElement.style.setProperty('--train-line-color', buttonColor);

    if (!data?.stations?.length) {
        trainLineElement.appendChild(createErrorElement('No stations found'));
        return;
    }

    data.stations.forEach(station => {
        const stationElement = createStation(
            station.stopName ?? 'Unknown Station',
            station.northbound ?? [],
            station.southbound ?? [],
            buttonColor
        );
        trainLineElement.appendChild(stationElement);
    });
};

// Create station
const createStation = (name, northbound, southbound, color) => {
    const station = document.createElement('div');
    station.className = 'station';

    const dot = document.createElement('div');
    dot.className = 'station-dot';
    dot.style.borderColor = color;

    const tooltip = document.createElement('div');
    tooltip.className = 'arrival-tooltip';

    const northSection = createArrivalSection('Northbound', northbound);
    tooltip.appendChild(northSection);

    const southSection = createArrivalSection('Southbound', southbound);
    tooltip.appendChild(southSection);

    const nameLabel = document.createElement('div');
    nameLabel.className = 'station-name-label';
    nameLabel.textContent = name;

    station.appendChild(dot);
    station.appendChild(tooltip);
    station.appendChild(nameLabel);

    return station;
};

// Create arrival section
const createArrivalSection = (direction, times) => {
    const section = document.createElement('div');
    section.className = 'arrival-section';

    const label = document.createElement('strong');
    label.textContent = `${direction}:`;
    section.appendChild(label);

    if (times?.length > 0) {
        times.forEach(time => {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'time';
            timeDiv.textContent = `• ${time} min`;
            section.appendChild(timeDiv);
        });
    } else {
        const noService = document.createElement('div');
        noService.className = 'time';
        noService.textContent = 'No service';
        section.appendChild(noService);
    }

    return section;
};

// Close modal
const closeModal = () => {
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    clearElement(modal.querySelector('.train-line'));
    modalTitle.textContent = '';
};

// Event listeners for closing modal
closeButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});
