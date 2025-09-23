const trainButtons = document.querySelectorAll('.train-button');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeButton = modal.querySelector('.close-button');


trainButtons.forEach(button => {
    button.addEventListener('click', openModal);
});

async function openModal(event) {
    modal.classList.add('show');
    modalOverlay.classList.add('show');
}


closeButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

async function closeModal(event) {
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
}

        