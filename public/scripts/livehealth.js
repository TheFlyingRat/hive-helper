alert("Please note as hive sensors are out of scope, all data here is randomly generated upon page load.");

document.addEventListener('DOMContentLoaded', async () => {
    // Get all the contexts
    const hiveSelect = document.getElementById('hiveSelect');
    const temperatureChartCtx = document.getElementById('temperatureChart').getContext('2d');
    const humidityChartCtx = document.getElementById('humidityChart').getContext('2d');
    const activityChartCtx = document.getElementById('activityChart').getContext('2d');

    let temperatureChart, humidityChart, activityChart;

    try {
        // Fetch all hives
        const hivesResponse = await fetch('/hive');
        const hives = await hivesResponse.json();

        // Populate the dropdown with hive names and store hive IDs as values
        hives.forEach(hive => {
            const option = document.createElement('option');
            option.value = hive.hive_id;
            option.textContent = hive.hive_name;
            hiveSelect.appendChild(option);
            simulateHiveSensors(hive.hive_id);
        });

        // Event listener for dropdown change
        hiveSelect.addEventListener('change', async (event) => {
            const hiveId = event.target.value;
            if (!hiveId) return;

            try {
                // Get the health data for the selected hive
                const healthResponse = await fetch(`/health/${hiveId}`);
                const healthData = await healthResponse.json();

                const currentTime = new Date();
                currentTime.setTime(currentTime.getTime()); // Timezone fix + 10 * 60 * 60 * 1000);

                // Data must be the latest 12 points, that are within the last minute. 
                // If theres 12, but they're not within last minute, empty list
                // If theres <12, and are within the last minute, show them
                const filteredData = healthData
                    .slice(-12)
                    .filter(data => (currentTime - new Date(data.timestamp)) <= 60000);

                // Map the data into an array
                const labels = filteredData.map(data => new Date(data.timestamp));
                const temperatureData = filteredData.map(data => data.temperature);
                const humidityData = filteredData.map(data => data.humidity);
                const activityData = filteredData.map(data => Number(data.activity_level));

                // Destroy the chart, then repopulate it for all charts
                if (temperatureChart) temperatureChart.destroy();
                temperatureChart = createLineChart(temperatureChartCtx, labels, temperatureData, 'Temperature');
                if (humidityChart) humidityChart.destroy();
                humidityChart = createLineChart(humidityChartCtx, labels, humidityData, 'Humidity');
                if (activityChart) activityChart.destroy();
                activityChart = createLineChart(activityChartCtx, labels, activityData, 'Activity Level');
            } catch (error) {
                console.error('Error fetching health data:', error);
            }
        });

        // Initialize the chart by emitting an event
        hiveSelect.dispatchEvent(new Event('change'));

        // Determining how much height the chart should have for mobile devices (a constraint Richard needed)
        const canvasHeight = window.innerWidth < 604 ? 200 : 70;
        temperatureChartCtx.canvas.height = canvasHeight;
        humidityChartCtx.canvas.height = canvasHeight;
        activityChartCtx.canvas.height = canvasHeight;
    } catch (error) {
        console.error('Error fetching hive data:', error);
    }
});

// Create a line chart using chart.js with time on x and the other unit on y. x is in seconds with a step of 5 seconds
function createLineChart(ctx, labels, chartData, label) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: chartData,
                borderColor: 'rgba(25, 25, 25, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            animation: { duration: 0 },
            scales: {
                x: {
                    type: 'time',
                    ticks: {stepSize: 5, min: 0 },
                    time: {
                        unit: 'second',
                        tooltipFormat: 'HH:mm:ss',
                        displayFormats: { minute: 'HH:mm:ss' }
                    },
                    title: { display: true, text: 'Time' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: label }
                }
            }
        }
    });
}

async function simulateHiveSensors(hiveId) {
    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function addRandomFluctuation(value) {
        // Add or subtract 10%
        return value + value * getRandomNumber(-0.1, 0.1);
    }

    while (true) {
        const data = {
            temperature: addRandomFluctuation(22.4), // Random magic numbers
            humidity: addRandomFluctuation(45), // Random magic numbers
            activity_level: addRandomFluctuation(41), // Random magic numbers
            hive_id: hiveId
        };

        try {
            await fetch('/health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            hiveSelect.dispatchEvent(new Event('change'));
        } catch (error) {
            console.error('Error simulating hive sensors:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
