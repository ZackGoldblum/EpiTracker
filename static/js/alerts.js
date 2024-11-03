function setupAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Fade out after 3 seconds
        setTimeout(() => {
            alert.style.opacity = '0';
            // Remove from DOM after fade animation completes
            setTimeout(() => {
                alert.remove();
            }, 300); // matches transition duration
        }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', setupAlerts);
