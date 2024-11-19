let asmChart = null;

async function updateASMPlot() {
    const medicationName = document.getElementById('medication-select').value;
    const days = document.getElementById('timeframe-select').value;
    
    // Show loading state
    const canvas = document.getElementById('asmLevelsChart');
    canvas.style.opacity = '0.5';
    
    try {
        const response = await fetch(`/api/drug_levels/${medicationName}?days=${days}`);
        const data = await response.json();
        
        // Destroy existing chart if it exists
        if (asmChart) {
            asmChart.destroy();
        }
        
        // Create new chart
        const ctx = canvas.getContext('2d');
        asmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.times.map(t => new Date(t).toLocaleString()),
                datasets: [{
                    label: `${medicationName} Concentration`,
                    data: data.concentrations,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.4
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
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Concentration (mg/L)'
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 8,
                            maxRotation: 0,
                            callback: function(value, index, values) {
                                const date = new Date(this.getLabelForValue(value));
                                return date.toLocaleDateString();
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching ASM levels:', error);
    } finally {
        canvas.style.opacity = '1';
    }
}

// Initialize plot when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateASMPlot();
});
