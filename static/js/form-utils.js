function updateSeverityValue(value) {
    document.getElementById('severity-value').textContent = value;
}

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

function handleMedicationSelect(select) {
    const customInput = document.getElementById('custom-med-name');
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
        select.name = ''; // Remove the name attribute from select
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        select.name = 'name'; // Restore the name attribute
    }
}

function handleSeizureTypeSelect(select) {
    const customInput = document.getElementById('custom-seizure-type');
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
        select.name = ''; // Remove the name attribute from select
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        select.name = 'type'; // Restore the name attribute
    }
}

function setDuration(minutes) {
    document.getElementById('seizure-duration').value = minutes;
    // Remove active class from all buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Add event listener to update button states when manual input changes
document.addEventListener('DOMContentLoaded', function() {
    const durationInput = document.getElementById('seizure-duration');
    if (durationInput) {
        durationInput.addEventListener('input', function() {
            // Remove active class from all buttons when manually typing
            document.querySelectorAll('.duration-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        });
    }
});

// Common notes/details for different triggers
const TRIGGER_NOTES = {
    'Stress': [
        'Work-related stress',
        'Family stress',
        'Financial stress',
        'School/Study stress'
    ],
    'Lack of Sleep': [
        'Less than 6 hours of sleep',
        'Interrupted sleep',
        'Changed sleep schedule',
        'Insomnia'
    ],
    'Missed Medication': [
        'Missed morning dose',
        'Missed evening dose',
        'Delayed dose',
        'Ran out of medication'
    ],
    'Alcohol': [
        'Beer/Wine',
        'Mixed drinks',
        'More than usual',
        'Combined with lack of sleep'
    ],
    'Flashing Lights': [
        'TV/Computer screen',
        'Video games',
        'Strobe lights',
        'Sunlight through trees'
    ],
    'Illness/Fever': [
        'High temperature',
        'Cold/Flu symptoms',
        'Stomach illness',
        'Headache/Migraine'
    ],
    'Exercise': [
        'Intense workout',
        'Overexertion',
        'Dehydrated during exercise',
        'Hot weather exercise'
    ],
    'Dehydration': [
        'Forgot to drink water',
        'Hot weather',
        'During exercise',
        'Alcohol-related'
    ]
};

function handleTriggerSelect(select) {
    const customInput = document.getElementById('custom-trigger-type');
    const quickNotesContainer = document.getElementById('quick-notes');
    
    // Handle custom trigger input display
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
        select.name = '';
        quickNotesContainer.innerHTML = ''; // Clear quick notes
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        select.name = 'type';
        updateQuickNotes(select.value);
    }
}

function updateQuickNotes(triggerType) {
    const quickNotesContainer = document.getElementById('quick-notes');
    quickNotesContainer.innerHTML = ''; // Clear existing buttons
    
    if (!triggerType || triggerType === 'custom') return;
    
    const notes = TRIGGER_NOTES[triggerType] || [];
    
    notes.forEach(note => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-note-btn';
        btn.textContent = note;
        btn.onclick = () => addNoteDetail(note);
        quickNotesContainer.appendChild(btn);
    });
}

function addNoteDetail(note) {
    const notesTextarea = document.getElementById('trigger-notes');
    const currentNotes = notesTextarea.value.split('\n').map(line => line.trim());
    
    // Check if the note is already present
    const noteIndex = currentNotes.indexOf('• ' + note);
    
    if (noteIndex === -1) {
        // Add the new note with a bullet point
        if (currentNotes[0]) {
            notesTextarea.value += '\n• ' + note;
        } else {
            notesTextarea.value = '• ' + note;
        }
        
        // Visual feedback for the clicked button
        event.target.classList.add('active');
    } else {
        // Remove the note
        currentNotes.splice(noteIndex, 1);
        notesTextarea.value = currentNotes.join('\n').trim();
        
        // Remove active class from the button
        event.target.classList.remove('active');
    }
} 