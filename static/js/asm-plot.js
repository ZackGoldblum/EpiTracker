let asmChart = null;

async function updateASMPlot() {
    const medicationName = document.getElementById('medication-select').value;
    const days = document.getElementById('timeframe-select').value;
    const showSeizures = document.getElementById('show-seizures').checked;
    
    // Show loading state
    const canvas = document.getElementById('asmLevelsChart');
    canvas.style.opacity = '0.5';
    
    try {
        const response = await fetch(`/api/drug_levels/${medicationName}?days=${days}&showSeizures=${showSeizures}`);
        const data = await response.json();
        
        // Destroy existing chart if it exists
        if (asmChart) {
            asmChart.destroy();
        }
        
        // Create new chart
        const ctx = canvas.getContext('2d');
        
        // Prepare annotations object
        const annotations = {};
        
        // Add seizure annotations if enabled
        if (showSeizures && data.seizures && data.seizures.length > 0) {
            data.seizures.forEach((seizure, index) => {
                annotations[`seizure-${index}`] = {
                    type: 'line',
                    xMin: seizure.timestamp,
                    xMax: seizure.timestamp,
                    borderColor: 'rgba(255, 0, 0, 0.5)',
                    borderWidth: 2,
                    label: {
                        enabled: true,
                        content: `${seizure.type} (Severity: ${seizure.severity})`,
                        position: 'top'
                    }
                };
            });
        }
        
        asmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.times,
                datasets: [{
                    label: `${medicationName} Concentration`,
                    data: data.concentrations,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} mg/L`;
                            }
                        }
                    },
                    annotation: {
                        annotations: annotations
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM dd, yyyy hh:mm a',
                            displayFormats: {
                                day: 'MMM dd, yyyy',
                                hour: 'MMM dd, yyyy hh:mm a'
                            }
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            maxRotation: 0,
                            source: 'auto'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Concentration (mg/L)'
                        }
                    }
                }
            }
        });
        
        // Reset opacity
        canvas.style.opacity = '1';
        
    } catch (error) {
        console.error('Error updating ASM plot:', error);
        alert('An error occurred while updating the plot. Please check the console for details.');
        canvas.style.opacity = '1';
    }
}

// Initialize plot when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateASMPlot();
});

function toggleSeizures(toggleElement) {
    toggleElement.classList.toggle('active');
    const checkbox = document.getElementById('show-seizures');
    checkbox.checked = toggleElement.classList.contains('active');
    updateASMPlot();
}
