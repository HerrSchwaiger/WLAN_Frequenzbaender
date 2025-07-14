document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('frequencyCanvas');
    const ctx = canvas.getContext('2d');

    const frequencyBands = {
        '2.4GHz': { start: 2412, step_size: 5, channel_n: 13, channel_width: 20 },
        //'5GHz': { start: 5150, end: 2.4835 },
        //'6Ghz': { start: 2.4, end: 2.5 }
        // Weitere Standards hinzufügen
    };

    // Track objects
    let semicircles = [];
    let tickPositions = [];
    let current_Band = '2.4GHz';

    // constants
    const offset = canvas.width / 7;
    const width = canvas.width - 2 * offset;
    const scaleX = width / frequencyBands[current_Band].channel_n;
    const semicircle_offset = 50;
    const line_offset_top = 45;
    const line_offset_bottom = 30;

    // Function to draw the frequency range
    function drawFrequencyRange() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the number line
        for (let i = 0; i < frequencyBands[current_Band].channel_n; i++) {
            const x = i * scaleX + offset;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - line_offset_bottom);
            ctx.lineTo(x, canvas.height - line_offset_top);
            ctx.stroke();
            tickPositions.push(x);

            // Add numbering to the semicircles
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText((i + 1).toString(), x - 5, canvas.height - 15);
            ctx.font = '10px Arial';
            ctx.fillText((frequencyBands[current_Band].start + i * frequencyBands[current_Band].step_size).toString(), x - 10, canvas.height - 5);
        }

        // Redraw existing semicircles
        semicircles.forEach(semicircle => {
            ctx.beginPath();
            ctx.arc(semicircle.x, semicircle.y, semicircle.r, Math.PI, 2 * Math.PI);
            ctx.fillStyle = semicircle.color;
            ctx.fill();
        });
    }

    // Function to check for overlaps
    function checkOverlaps() {
        for (let i = 0; i < semicircles.length; i++) {
            let overlap = false;
            for (let j = 0; j < semicircles.length; j++) {
                if (i !== j) {
                    const dx = semicircles[i].x - semicircles[j].x;
                    const dy = semicircles[i].y - semicircles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < semicircles[i].r + semicircles[j].r) {
                        overlap = true;
                    }
                }
            }
            semicircles[i].color = overlap ? 'red' : 'green';
        }
        const initialRange = frequencyBands['2.4GHz'];
        drawFrequencyRange();
    }

    // Event listener for clicks on the canvas
    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const y = canvas.height - semicircle_offset; // Fixed y position for semicircles
        const r = 2 * scaleX; // Radius of semicircles

        // Find the nearest tick position to the clicked x-coordinate
        const nearestTickX = tickPositions.reduce((prev, curr) => {
            return (Math.abs(curr - clickX) < Math.abs(prev - clickX) ? curr : prev);
        });

        // Check if a semicircle already exists near the nearest tick position
        const existingSemicircleIndex = semicircles.findIndex(sc => Math.abs(sc.x - nearestTickX) < r / 4);

        if (existingSemicircleIndex !== -1) {
            // Remove the existing semicircle
            semicircles.splice(existingSemicircleIndex, 1);
        } else {
            // Add a new semicircle
            semicircles.push({ x: nearestTickX, y, r, color: 'green' });
        }

        // Redraw the frequency range and check for overlaps
        drawFrequencyRange();
        checkOverlaps();
    });

    // Initial call to draw the frequency range
    drawFrequencyRange();
});
