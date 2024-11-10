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
            const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Check if we're on the dashboard or a specific log page
            const isDashboard = document.querySelector('.dashboard-grid');
            
            if (isDashboard) {
                // Update modal content for dashboard
                document.getElementById('selectedDate').textContent = displayDate;
                
                // Update medication logs with time at the top
                const medLogsHtml = data.medications.length ? 
                    data.medications.map(med => `
                        <div class="daily-log-item">
                            <div>${formatTime(med.time)}</div>
                            <strong>${med.name}</strong> - ${med.dosage}
                        </div>
                    `).join('') : '<p class="no-logs">No medications logged</p>';
                
                // Update seizure logs with formatted time
                const seizureLogsHtml = data.seizures.length ?
                    data.seizures.map(seizure => `
                        <div class="daily-log-item">
                            <div>${formatTime(seizure.date_time)}</div>
                            <div>Type: ${seizure.type}</div>
                            <div>Severity: ${seizure.severity}/10</div>
                            <div>Duration: ${seizure.duration} minutes</div>
                        </div>
                    `).join('') : '<p class="no-logs">No seizures logged</p>';
                
                // Update trigger logs with formatted time
                const triggerLogsHtml = data.triggers.length ?
                    data.triggers.map(trigger => `
                        <div class="daily-log-item">
                            <div>${formatTime(trigger.date_time)}</div>
                            <div>Type: ${trigger.type}</div>
                            <div>Notes: ${trigger.notes || 'No notes'}</div>
                        </div>
                    `).join('') : '<p class="no-logs">No triggers logged</p>';

                // Insert the HTML for dashboard
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
            } else {
                // Individual pages: show detailed logs with date
                const logsSection = document.getElementById('selected-day-logs');
                if (logsSection) {
                    if (this.type === 'medication') {
                        const medHtml = data.medications.length ? 
                            `<div class="log-date-section">
                                <h3>${displayDate}</h3>
                             </div>
                             ${data.medications.map(med => `
                                <div class="log-item">
                                    <div class="log-time">${formatTime(med.time)}</div>
                                    <div class="log-item-details">
                                        <div class="log-item-row">
                                            <span class="log-item-label">Medication:</span>
                                            <span>${med.name}</span>
                                        </div>
                                        <div class="log-item-row">
                                            <span class="log-item-label">Dosage:</span>
                                            <span>${med.dosage}</span>
                                        </div>
                                    </div>
                                </div>
                             `).join('')}` : 
                            `<p class="no-logs"><em>There are no logs for ${displayDate}.</em></p>`;
                        logsSection.innerHTML = medHtml;
                    } else if (this.type === 'seizure') {
                        const seizureHtml = data.seizures.length ?
                            `<div class="log-date-section">
                                <h3>${displayDate}</h3>
                             </div>
                             ${data.seizures.map(seizure => `
                                <div class="log-item">
                                    <div class="log-time">${formatTime(seizure.date_time)}</div>
                                    <div class="log-item-details">
                                        <div class="log-item-row">
                                            <span class="log-item-label">Type:</span>
                                            <span>${seizure.type}</span>
                                        </div>
                                        <div class="log-item-row">
                                            <span class="log-item-label">Severity:</span>
                                            <span>${seizure.severity}/10</span>
                                        </div>
                                        <div class="log-item-row">
                                            <span class="log-item-label">Duration:</span>
                                            <span>${seizure.duration} minutes</span>
                                        </div>
                                    </div>
                                </div>
                             `).join('')}` :
                            `<p class="no-logs"><em>There are no logs for ${displayDate}.</em></p>`;
                        logsSection.innerHTML = seizureHtml;
                    } else if (this.type === 'trigger') {
                        const triggerHtml = data.triggers.length ?
                            `<div class="log-date-section">
                                <h3>${displayDate}</h3>
                             </div>
                             ${data.triggers.map(trigger => `
                                <div class="log-item">
                                    <div class="log-time">${formatTime(trigger.date_time)}</div>
                                    <div class="log-item-details">
                                        <div class="log-item-row">
                                            <span class="log-item-label">Type:</span>
                                            <span>${trigger.type}</span>
                                        </div>
                                        <div class="log-item-row">
                                            <span class="log-item-label">Notes:</span>
                                            <span>${trigger.notes || 'No notes'}</span>
                                        </div>
                                    </div>
                                </div>
                             `).join('')}` :
                            `<p class="no-logs"><em>There are no logs for ${displayDate}.</em></p>`;
                        logsSection.innerHTML = triggerHtml;
                    }
                }
            }

            // Show the modal only for dashboard view
            if (isDashboard) {
                document.getElementById('dailyLogsModal').style.display = 'block';
            }

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
                    <div>${formatTime(med.time)}</div>
                    <strong>${med.name}</strong> - ${med.dosage}
                </div>
            `).join('') : '<p class="no-logs">No medications logged</p>';
        
        // Update seizure logs
        const seizureLogsHtml = seizures.length ?
            seizures.map(seizure => `
                <div class="daily-log-item">
                    <div>${formatTime(seizure.date_time)}</div>
                    <div>Type: ${seizure.type}</div>
                    <div>Severity: ${seizure.severity}/10</div>
                    <div>Duration: ${seizure.duration} minutes</div>
                </div>
            `).join('') : '<p class="no-logs">No seizures logged</p>';
        
        // Update trigger logs
        const triggerLogsHtml = triggers.length ?
            triggers.map(trigger => `
                <div class="daily-log-item">
                    <div>${formatTime(trigger.date_time)}</div>
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

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true
    });
}

// Function to format time as HH:MM AM/PM
function formatTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}