class Calendar {
    constructor(elementId, type) {
        this.element = document.getElementById(elementId);
        this.type = type;
        if (!this.element) return;
        
        this.currentDate = new Date();
        this.events = [];
        
        this.init();
        this.fetchEvents();
    }

    init() {
        this.render();
        // Add click event listener to the calendar
        this.element.addEventListener('click', (e) => {
            const dayCell = e.target.closest('.calendar-day');
            if (dayCell && dayCell.dataset.date) {
                this.handleDayClick(dayCell.dataset.date);
            }
        });
    }

    async handleDayClick(dateStr) {
        try {
            const response = await fetch(`/api/daily-logs/${dateStr}`);
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            
            // Format date for display
            const displayDate = new Date(dateStr).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            document.getElementById('selectedDate').textContent = displayDate;

            // Render medications
            const medHtml = data.medications.length ? 
                data.medications.map(med => `
                    <div class="daily-log-item">
                        <strong>${med.name}</strong> - ${med.dosage}
                        <div>${new Date(med.time).toLocaleTimeString()}</div>
                    </div>
                `).join('') : '<p class="no-logs">No medications logged</p>';
            
            // Render seizures
            const seizureHtml = data.seizures.length ?
                data.seizures.map(seizure => `
                    <div class="daily-log-item">
                        <div>Type: ${seizure.type}</div>
                        <div>Severity: ${seizure.severity}/10</div>
                        <div>Duration: ${seizure.duration} minutes</div>
                    </div>
                `).join('') : '<p class="no-logs">No seizures logged</p>';

            // Render triggers
            const triggerHtml = data.triggers.length ?
                data.triggers.map(trigger => `
                    <div class="daily-log-item">
                        <div>Type: ${trigger.type}</div>
                        <div>Notes: ${trigger.notes || 'No notes'}</div>
                    </div>
                `).join('') : '<p class="no-logs">No triggers logged</p>';

            // Check if we're on a specific log page or dashboard
            const isDashboard = document.querySelector('.dashboard-grid');
            
            if (isDashboard) {
                // Update all sections for dashboard
                document.getElementById('medicationLogs').innerHTML = `
                    <div class="daily-log-section">
                        <h4>Medications</h4>
                        ${medHtml}
                    </div>`;
                document.getElementById('seizureLogs').innerHTML = `
                    <div class="daily-log-section">
                        <h4>Seizures</h4>
                        ${seizureHtml}
                    </div>`;
                document.getElementById('triggerLogs').innerHTML = `
                    <div class="daily-log-section">
                        <h4>Triggers</h4>
                        ${triggerHtml}
                    </div>`;
            } else {
                // On individual pages, only show relevant section
                if (this.type === 'medication') {
                    document.getElementById('medicationLogs').innerHTML = `
                        <div class="daily-log-section">
                            <h4>Medications</h4>
                            ${medHtml}
                        </div>`;
                } else if (this.type === 'seizure') {
                    document.getElementById('seizureLogs').innerHTML = `
                        <div class="daily-log-section">
                            <h4>Seizures</h4>
                            ${seizureHtml}
                        </div>`;
                } else if (this.type === 'trigger') {
                    document.getElementById('triggerLogs').innerHTML = `
                        <div class="daily-log-section">
                            <h4>Triggers</h4>
                            ${triggerHtml}
                        </div>`;
                }
            }

            // Show the modal
            document.getElementById('dailyLogsModal').style.display = 'block';
        } catch (error) {
            console.error('Error fetching daily logs:', error);
        }
    }

    async fetchEvents() {
        try {
            const response = await fetch(`/api/events/${this.type}`);
            this.events = await response.json();
            this.render();
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    render() {
        const daysInMonth = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            0
        ).getDate();

        const firstDay = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            1
        ).getDay();

        let html = `
            <div class="calendar-header">
                <button onclick="calendars['${this.element.id}'].previousMonth()">&lt;</button>
                <h3>${this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onclick="calendars['${this.element.id}'].nextMonth()">&gt;</button>
            </div>
            <div class="calendar-grid">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
        `;

        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const hasEvent = this.events.some(event => {
                const eventDate = new Date(event.date);
                return eventDate.toDateString() === date.toDateString();
            });

            const isToday = date.toDateString() === new Date().toDateString();

            html += `
                <div class="calendar-day ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}" 
                     data-date="${date.toISOString().split('T')[0]}"
                     onclick="calendar.handleDayClick('${date.toISOString().split('T')[0]}')">
                    ${day}
                    ${hasEvent ? `<span class="event-dot ${this.type}"></span>` : ''}
                </div>
            `;
        }

        html += '</div>';
        this.element.innerHTML = html;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.fetchEvents();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.fetchEvents();
    }

    renderDay(date, events = []) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        // Add the date attribute in YYYY-MM-DD format
        const dateStr = date.toISOString().split('T')[0];
        dayElement.dataset.date = dateStr;
        
        // ... rest of the renderDay method ...
        
        return dayElement;
    }
}

// Modal functions
function showAddMedicationModal() {
    document.getElementById('addMedicationModal').style.display = 'block';
}

function showAddSeizureModal() {
    document.getElementById('addSeizureModal').style.display = 'block';
}

function showAddTriggerModal() {
    document.getElementById('addTriggerModal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Initialize calendars
document.addEventListener('DOMContentLoaded', () => {
    window.calendars = {
        'medication-calendar': new Calendar('medication-calendar', 'medication'),
        'seizure-calendar': new Calendar('seizure-calendar', 'seizure'),
        'trigger-calendar': new Calendar('trigger-calendar', 'trigger')
    };

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    };
});

// Add this function
async function updateMedicationStatus(medicationId) {
    try {
        const response = await fetch(`/update_medication/${medicationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to update medication status');
        }
    } catch (error) {
        console.error('Error updating medication status:', error);
        // Revert checkbox state if there's an error
        const checkbox = event.target;
        checkbox.checked = !checkbox.checked;
    }
}

function initializeCalendar(calendarId, eventType) {
    const calendar = document.getElementById(calendarId);
    if (!calendar) return;

    // Add click event listener to calendar days
    calendar.addEventListener('click', async (e) => {
        const dayCell = e.target.closest('.calendar-day');
        if (dayCell) {
            const date = dayCell.dataset.date;
            if (date) {
                await showDailyLogs(date);
            }
        }
    });
}

async function showDailyLogs(date) {
    try {
        // Fetch logs for all types for the selected date
        const [medications, seizures, triggers] = await Promise.all([
            fetch(`/api/daily-logs/medication/${date}`).then(res => res.json()),
            fetch(`/api/daily-logs/seizure/${date}`).then(res => res.json()),
            fetch(`/api/daily-logs/trigger/${date}`).then(res => res.json())
        ]);

        // Update modal content
        document.getElementById('selectedDate').textContent = new Date(date).toLocaleDateString();
        
        // Update medication logs
        const medLogsHtml = medications.length ? 
            medications.map(med => `
                <div class="daily-log-item">
                    <strong>${med.name}</strong> - ${med.dosage}
                    <div>${new Date(med.time).toLocaleTimeString()}</div>
                </div>
            `).join('') : '<p class="no-logs">No medications logged</p>';
        
        // Update seizure logs
        const seizureLogsHtml = seizures.length ?
            seizures.map(seizure => `
                <div class="daily-log-item">
                    <div>Type: ${seizure.type}</div>
                    <div>Severity: ${seizure.severity}/10</div>
                    <div>Duration: ${seizure.duration} minutes</div>
                </div>
            `).join('') : '<p class="no-logs">No seizures logged</p>';
        
        // Update trigger logs
        const triggerLogsHtml = triggers.length ?
            triggers.map(trigger => `
                <div class="daily-log-item">
                    <div>Type: ${trigger.type}</div>
                    <div>Notes: ${trigger.notes || 'No notes'}</div>
                </div>
            `).join('') : '<p class="no-logs">No triggers logged</p>';

        // Insert the HTML
        document.getElementById('medicationLogs').innerHTML = `
            <div class="daily-log-section">
                <h4>Medications</h4>
                ${medLogsHtml}
            </div>`;
        document.getElementById('seizureLogs').innerHTML = `
            <div class="daily-log-section">
                <h4>Seizures</h4>
                ${seizureLogsHtml}
            </div>`;
        document.getElementById('triggerLogs').innerHTML = `
            <div class="daily-log-section">
                <h4>Triggers</h4>
                ${triggerLogsHtml}
            </div>`;

        // Show the modal
        document.getElementById('dailyLogsModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching daily logs:', error);
    }
}

// Add this after the Calendar class definition
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all calendars
    const calendars = {
        'medication-calendar': new Calendar('medication-calendar', 'medication'),
        'seizure-calendar': new Calendar('seizure-calendar', 'seizure'),
        'trigger-calendar': new Calendar('trigger-calendar', 'trigger')
    };

    // Add modal HTML to each log page if it doesn't exist
    if (!document.getElementById('dailyLogsModal')) {
        const modalHTML = `
            <div id="dailyLogsModal" class="modal">
                <div class="modal-content">
                    <h3>Logs for <span id="selectedDate"></span></h3>
                    <div id="dailyLogs">
                        <div id="medicationLogs"></div>
                        <div id="seizureLogs"></div>
                        <div id="triggerLogs"></div>
                    </div>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
});