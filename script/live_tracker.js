// Color mapping
var TRAIN_COLORS = {
    'green': '#009952',
    'red': '#EE352E',
    'blue': '#0062CF',
    'purple': '#9A38A1',
    'orange': '#EB6800',
    'yellow': '#F6BC26',
    'gray': '#7C858C',
    'brown': '#8E5C33',
    'light-green': '#799534',
    'mta-blue': '#08179C'
};

// Get DOM elements
var modal = document.getElementById('modal');
var modalOverlay = document.getElementById('modal-overlay');
var closeButton = modal.querySelector('.close-button');
var modalTitle = document.getElementById('modal-title');
var trainButtons = document.querySelectorAll('.train-button');

// Add click listeners
for (var i = 0; i < trainButtons.length; i++) {
    trainButtons[i].addEventListener('click', function(event) {
        var button = event.currentTarget;
        var trainLine = button.getAttribute('data-train');
        
        if (!trainLine) {
            return;
        }
        
        openModal(button, trainLine);
    });
}

// Helper function to create loading message
function createLoadingElement() {
    var loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Loading train data...';
    return loading;
}

// Helper function to create error message
function createErrorElement(message) {
    var error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    return error;
}

// Helper function to clear element content
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Open modal
function openModal(button, trainLine) {
    var buttonColor = getButtonColor(button);
    
    modal.classList.add('show');
    modalOverlay.classList.add('show');
    
    modalTitle.textContent = trainLine + ' Train - Loading...';
    modalTitle.style.color = buttonColor;
    
    var trainLineElement = document.getElementById('train-line');
    clearElement(trainLineElement);
    trainLineElement.appendChild(createLoadingElement());
    
    loadTrainData(trainLine, buttonColor);
}

// Get button color
function getButtonColor(button) {
    if (button.classList.contains('green')) return TRAIN_COLORS.green;
    if (button.classList.contains('red')) return TRAIN_COLORS.red;
    if (button.classList.contains('blue')) return TRAIN_COLORS.blue;
    if (button.classList.contains('purple')) return TRAIN_COLORS.purple;
    if (button.classList.contains('orange')) return TRAIN_COLORS.orange;
    if (button.classList.contains('yellow')) return TRAIN_COLORS.yellow;
    if (button.classList.contains('gray')) return TRAIN_COLORS.gray;
    if (button.classList.contains('brown')) return TRAIN_COLORS.brown;
    if (button.classList.contains('light-green')) return TRAIN_COLORS['light-green'];
    if (button.classList.contains('mta-blue')) return TRAIN_COLORS['mta-blue'];
    return TRAIN_COLORS.gray;
}

// Load train data
function loadTrainData(trainLine, buttonColor) {
    var apiUrl = 'http://localhost:3000/api/train/' + trainLine;
    
    fetch(apiUrl)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('API Error');
            }
            return response.json();
        })
        .then(function(data) {
            modalTitle.textContent = trainLine + ' Train';
            modalTitle.style.color = buttonColor;
            
            buildTrainLine(data, buttonColor);
        })
        .catch(function(error) {
            var trainLineElement = document.getElementById('train-line');
            clearElement(trainLineElement);
            trainLineElement.appendChild(createErrorElement('Failed to load train data. Please try again.'));
        });
}

// Build train line
function buildTrainLine(data, buttonColor) {
    var trainLineElement = document.getElementById('train-line');
    clearElement(trainLineElement);
    
    // Set the CSS variable for the train line color
    trainLineElement.style.setProperty('--train-line-color', buttonColor);
    
    if (!data.stations || data.stations.length === 0) {
        trainLineElement.appendChild(createErrorElement('No stations found'));
        return;
    }
    
    for (var i = 0; i < data.stations.length; i++) {
        var station = data.stations[i];
        var stationElement = createStation(
            station.stopName || 'Unknown Station',
            station.northbound || [],
            station.southbound || [],
            buttonColor
        );
        trainLineElement.appendChild(stationElement);
    }
}

// Create station
function createStation(name, northbound, southbound, color) {
    var station = document.createElement('div');
    station.className = 'station';
    
    var dot = document.createElement('div');
    dot.className = 'station-dot';
    dot.style.borderColor = color;
    
    var tooltip = document.createElement('div');
    tooltip.className = 'arrival-tooltip';
    
    var northSection = createArrivalSection('Northbound', northbound);
    tooltip.appendChild(northSection);
    
    var southSection = createArrivalSection('Southbound', southbound);
    tooltip.appendChild(southSection);
    
    var nameLabel = document.createElement('div');
    nameLabel.className = 'station-name-label';
    nameLabel.textContent = name;
    
    station.appendChild(dot);
    station.appendChild(tooltip);
    station.appendChild(nameLabel);
    
    return station;
}

// Create arrival section
function createArrivalSection(direction, times) {
    var section = document.createElement('div');
    section.className = 'arrival-section';
    
    var label = document.createElement('strong');
    label.textContent = direction + ':';
    section.appendChild(label);
    
    if (times && times.length > 0) {
        var maxTimes = times.length > 3 ? 3 : times.length;
        for (var i = 0; i < maxTimes; i++) {
            var timeDiv = document.createElement('div');
            timeDiv.className = 'time';
            timeDiv.textContent = '• ' + times[i] + ' min';
            section.appendChild(timeDiv);
        }
    } else {
        var noService = document.createElement('div');
        noService.className = 'time';
        noService.textContent = 'No service';
        section.appendChild(noService);
    }
    
    return section;
}

// Close modal
closeButton.addEventListener('click', function() {
    closeModal();
});

modalOverlay.addEventListener('click', function() {
    closeModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

function closeModal() {
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    clearElement(document.getElementById('train-line'));
    modalTitle.textContent = '';
}