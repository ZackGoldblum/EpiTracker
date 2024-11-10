// Function to format current date and time to match datetime-local input format
function getCurrentDateTime() {
    const now = new Date();
    // Format: YYYY-MM-DDThh:mm
    return new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

// Function to set current date time for all datetime inputs when modals are opened
function setCurrentDateTime() {
    const datetimeInputs = document.querySelectorAll('input[type="datetime-local"]');
    const currentDateTime = getCurrentDateTime();
    
    datetimeInputs.forEach(input => {
        input.value = currentDateTime;
    });
}

// Add event listeners to modal trigger buttons
document.addEventListener('DOMContentLoaded', () => {
    // For medication modal
    const addMedButton = document.querySelector('[onclick="showAddMedicationModal()"]');
    if (addMedButton) {
        addMedButton.addEventListener('click', setCurrentDateTime);
    }

    // For seizure modal
    const addSeizureButton = document.querySelector('[onclick="showAddSeizureModal()"]');
    if (addSeizureButton) {
        addSeizureButton.addEventListener('click', setCurrentDateTime);
    }

    // For trigger modal
    const addTriggerButton = document.querySelector('[onclick="showAddTriggerModal()"]');
    if (addTriggerButton) {
        addTriggerButton.addEventListener('click', setCurrentDateTime);
    }
}); 