class Calendar {
    constructor(elementId, type) {
        this.element = document.getElementById(elementId);
        this.type = type;
        if (!this.element) return;

        this.currentDate = new Date();
        this.events = [];
        this.selectedDay = null;

        this.init();
        this.fetchEvents();

        // Add month navigation event listeners
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('prev-month')) {
                this.previousMonth();
            } else if (e.target.classList.contains('next-month')) {
                this.nextMonth();
            }
        });
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

        // Initialize form submissions
        this.initFormSubmissions();
    }

    initFormSubmissions() {
        // Add event listeners to all add forms
        const forms = document.querySelectorAll('.add-log-form');
        forms.forEach(form => {
            // Remove any existing event listeners first
            form.removeEventListener('submit', this.handleFormSubmit);
            
            // Add a single event listener
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); // Prevent the default form submission
                e.stopPropagation(); // Stop event bubbling
                
                // Check if form is already being submitted
                if (form.dataset.submitting === 'true') {
                    return;
                }
                
                // Mark form as being submitted
                form.dataset.submitting = 'true';
                
                try {
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.disabled = true;
                    }

                    const formData = new FormData(form);
                    const response = await fetch(form.action, {
                        method: form.method || 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Close the modal
                        const modal = form.closest('.modal');
                        if (modal) {
                            modal.style.display = 'none';
                        }

                        // Re-fetch events and update calendar
                        await this.fetchEvents();
                        
                        // Update daily logs if date is available
                        if (result.date) {
                            await this.handleDayClick(result.date);
                        }
                        
                        // Reset the form
                        form.reset();
                    } else {
                        console.error('Form submission error:', result.error);
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                } finally {
                    // Re-enable submit button and clear submitting flag
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                    form.dataset.submitting = 'false';
                }
            }, { once: false }); // Allow multiple submissions, but not simultaneously
        });
    }

    async handleDayClick(dateStr) {
        try {
            // Remove previous selection
            if (this.selectedDay) {
                this.selectedDay.classList.remove('selected');
            }

            // Add selection to clicked day
            const clickedDay = this.element.querySelector(`[data-date="${dateStr}"]`);
            if (clickedDay) {
                clickedDay.classList.add('selected');
                this.selectedDay = clickedDay;
            }

            const response = await fetch(`/api/daily-logs/${dateStr}`);
            const data = await response.json();
            
            // Format date for display
            const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (this.type === 'unified') {
                // Dashboard view
                document.getElementById('selectedDate').textContent = displayDate;
                
                // Update medication logs
                const medLogsHtml = data.medications.length ?
                    data.medications.map(med => `
                        <div class="daily-log-item">
                            <div class="log-time-display">${formatTime(med.timestamp)}</div>
                            <div class="log-content">
                                <strong>${med.name}</strong> - ${med.dosage}
                            </div>
                        </div>
                    `).join('') : '<p class="no-logs">No medications logged</p>';

                // Update seizure logs
                const seizureLogsHtml = data.seizures.length ?
                    data.seizures.map(seizure => `
                        <div class="daily-log-item">
                            <div class="log-time-display">${formatTime(seizure.timestamp)}</div>
                            <div class="log-content">
                                <div>Type: ${seizure.type}</div>
                                <div>Severity: ${seizure.severity}/10</div>
                                <div>Duration: ${seizure.duration} minutes</div>
                            </div>
                        </div>
                    `).join('') : '<p class="no-logs">No seizures logged</p>';

                // Update trigger logs
                const triggerLogsHtml = data.triggers.length ?
                    data.triggers.map(trigger => `
                        <div class="daily-log-item">
                            <div class="log-time-display">${formatTime(trigger.timestamp)}</div>
                            <div class="log-content">
                                <div>Type: ${trigger.type}</div>
                                <div>Notes: ${trigger.notes || 'No notes'}</div>
                            </div>
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
                    
                document.getElementById('dailyLogsModal').style.display = 'block';
            } else {
                // Individual calendar views
                document.getElementById('selectedDateView').textContent = displayDate;
                
                const logContent = `
                    ${this.formatLogs(data[`${this.type}s`], this.type)}
                `;
                
                const logViewId = `${this.type}LogsView`;
                const logView = document.getElementById(logViewId);
                if (logView) {
                    logView.innerHTML = logContent;
                }
                
                document.getElementById('dailyLogsViewModal').style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching daily logs:', error);
        }
    }

    async fetchEvents() {
        try {
            if (this.type === 'unified') {
                const [medications, seizures, triggers] = await Promise.all([
                    fetch('/api/events/medication').then(r => r.json()),
                    fetch('/api/events/seizure').then(r => r.json()),
                    fetch('/api/events/trigger').then(r => r.json())
                ]);

                this.events = {
                    medication: medications,
                    seizure: seizures,
                    trigger: triggers
                };
            } else {
                // For individual calendar pages
                const response = await fetch(`/api/events/${this.type}`);
                const events = await response.json();
                this.events = {
                    [this.type]: events
                };
            }
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
                <button class="prev-month">&lt;</button>
                <h3>${this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button class="next-month">&gt;</button>
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
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === new Date().toDateString();

            let eventDots = '';

            if (this.type === 'unified') {
                // For dashboard: show all event types
                const hasEvents = {
                    medication: this.events.medication?.some(event => event.date.startsWith(dateStr)),
                    seizure: this.events.seizure?.some(event => event.date.startsWith(dateStr)),
                    trigger: this.events.trigger?.some(event => event.date.startsWith(dateStr))
                };

                eventDots = Object.entries(hasEvents)
                    .filter(([_, has]) => has)
                    .map(([type, _]) => `<span class="event-dot ${type}"></span>`)
                    .join('');
            } else {
                // For individual pages: show only that type's events
                const hasEvent = this.events[this.type]?.some(event => event.date.startsWith(dateStr));
                if (hasEvent) {
                    eventDots = `<span class="event-dot ${this.type}"></span>`;
                }
            }

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" 
                     data-date="${dateStr}"
                     onclick="calendar.handleDayClick('${dateStr}')">
                    ${day}
                    <div class="event-indicators">
                        ${eventDots}
                    </div>
                </div>
            `;
        }

        html += '</div>';

        // Add legend based on calendar type
        if (this.type === 'unified') {
            html += `
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="event-dot medication"></span>
                        <span>Medication</span>
                    </div>
                    <div class="legend-item">
                        <span class="event-dot seizure"></span>
                        <span>Seizure</span>
                    </div>
                    <div class="legend-item">
                        <span class="event-dot trigger"></span>
                        <span>Trigger</span>
                    </div>
                </div>
            `;
        } else {
            // Add single legend item for individual pages
            const legendLabels = {
                medication: 'Medication',
                seizure: 'Seizure',
                trigger: 'Trigger'
            };
            
            html += `
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="event-dot ${this.type}"></span>
                        <span>${legendLabels[this.type]}</span>
                    </div>
                </div>
            `;
        }

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

        // Add selected class if this is the selected day
        if (this.selectedDay && this.selectedDay.dataset.date === date.toISOString().split('T')[0]) {
            dayElement.classList.add('selected');
        }

        return dayElement;
    }

    formatLogs(logs, type) {
        if (!logs || logs.length === 0) {
            return `<p class="no-logs"><em>There are no logs for this day.</em></p>`;
        }

        const formatters = {
            medication: logs => `
                ${logs.map(log => `
                    <div class="daily-log-item">
                        <div class="log-time">${formatTime(log.timestamp)}</div>
                        <div class="log-item-details">
                            <div class="log-item-row">
                                <span class="log-item-label">Medication:</span>
                                <span>${log.name}</span>
                            </div>
                            <div class="log-item-row">
                                <span class="log-item-label">Dosage:</span>
                                <span>${log.dosage}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}`,

            seizure: logs => `
                ${logs.map(log => `
                    <div class="daily-log-item">
                        <div class="log-time">${formatTime(log.timestamp)}</div>
                        <div class="log-item-details">
                            <div class="log-item-row">
                                <span class="log-item-label">Type:</span>
                                <span>${log.type}</span>
                            </div>
                            <div class="log-item-row">
                                <span class="log-item-label">Severity:</span>
                                <span>${log.severity}/10</span>
                            </div>
                            <div class="log-item-row">
                                <span class="log-item-label">Duration:</span>
                                <span>${log.duration} minutes</span>
                            </div>
                        </div>
                    </div>
                `).join('')}`,

            trigger: logs => `
                ${logs.map(log => `
                    <div class="daily-log-item">
                        <div class="log-time">${formatTime(log.timestamp)}</div>
                        <div class="log-item-details">
                            <div class="log-item-row">
                                <span class="log-item-label">Type:</span>
                                <span>${log.type}</span>
                            </div>
                            <div class="log-item-row">
                                <span class="log-item-label">Notes:</span>
                                <span>${log.notes || 'No notes'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}`
        };

        return formatters[type](logs);
    }

    static closeModal(event) {
        if (!event || event.target.classList.contains('modal')) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            
            // Clear selected day highlighting from all calendars
            document.querySelectorAll('.calendar-day.selected').forEach(day => {
                day.classList.remove('selected');
            });
        }
    }
}

// Handle the transition between modals
function openFormFromDailyLogs() {
    // Get the selected date from the daily logs modal
    const selectedDateText = document.getElementById('selectedDateView').textContent;
    const selectedDate = new Date(selectedDateText);
    
    // Close the daily logs modal
    document.getElementById('dailyLogsViewModal').style.display = 'none';
    
    // Set the time to 00:00 (midnight)
    selectedDate.setHours(0);
    selectedDate.setMinutes(0);
    
    // Format the date for the datetime-local input (YYYY-MM-DDT00:00)
    const formattedDateTime = new Date(selectedDate - selectedDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    
    // Set the datetime in the form that's about to open
    setTimeout(() => {
        const datetimeInputs = document.querySelectorAll('input[type="datetime-local"]');
        datetimeInputs.forEach(input => {
            input.value = formattedDateTime;
        });
    }, 0);
}

// Helper function to get current formatted datetime
function getCurrentFormattedDateTime() {
    const now = new Date();
    return new Date(now - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
}

function showAddMedicationModal(fromDailyLogs = false) {
    if (fromDailyLogs) {
        openFormFromDailyLogs();
    } else {
        setTimeout(() => {
            const datetimeInput = document.querySelector('#medication-datetime');
            if (datetimeInput) {
                datetimeInput.value = getCurrentFormattedDateTime();
            }
        }, 0);
    }
    document.getElementById('addMedicationModal').style.display = 'block';
}

function showAddSeizureModal(fromDailyLogs = false) {
    if (fromDailyLogs) {
        openFormFromDailyLogs();
    } else {
        setTimeout(() => {
            const datetimeInput = document.querySelector('#seizure-datetime');
            if (datetimeInput) {
                datetimeInput.value = getCurrentFormattedDateTime();
            }
        }, 0);
    }
    document.getElementById('addSeizureModal').style.display = 'block';
}

function showAddTriggerModal(fromDailyLogs = false) {
    if (fromDailyLogs) {
        openFormFromDailyLogs();
    } else {
        setTimeout(() => {
            const datetimeInput = document.querySelector('#trigger-datetime');
            if (datetimeInput) {
                datetimeInput.value = getCurrentFormattedDateTime();
            }
        }, 0);
    }
    document.getElementById('addTriggerModal').style.display = 'block';
}

function closeModal(event) {
    Calendar.closeModal(event);
}

// Initialize calendars
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all calendars
    const calendars = {
        'medication-calendar': new Calendar('medication-calendar', 'medication'),
        'seizure-calendar': new Calendar('seizure-calendar', 'seizure'),
        'trigger-calendar': new Calendar('trigger-calendar', 'trigger'),
        'unified-calendar': new Calendar('unified-calendar', 'unified')
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
    
    // Add click event listeners to all modals for background click closing
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(e);
            }
        });
    });
});

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
                    <div>${formatTime(med.timestamp)}</div>
                    <strong>${med.name}</strong> - ${med.dosage}
                </div>
            `).join('') : '<p class="no-logs">No medications logged</p>';

        // Update seizure logs
        const seizureLogsHtml = seizures.length ?
            seizures.map(seizure => `
                <div class="daily-log-item">
                    <div>${formatTime(seizure.timestamp)}</div>
                    <div>Type: ${seizure.type}</div>
                    <div>Severity: ${seizure.severity}/10</div>
                    <div>Duration: ${seizure.duration} minutes</div>
                </div>
            `).join('') : '<p class="no-logs">No seizures logged</p>';

        // Update trigger logs
        const triggerLogsHtml = triggers.length ?
            triggers.map(trigger => `
                <div class="daily-log-item">
                    <div>${formatTime(trigger.timestamp)}</div>
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

function closeDailyLogsModal(event) {
    if (!event || event.target.classList.contains('modal')) {
        const modal = document.getElementById('dailyLogsViewModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Clear selected day highlighting
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
    }
}