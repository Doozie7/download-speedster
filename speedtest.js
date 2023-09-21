/**
 * @fileOverview This file provides functions for calculating internet network speed.
 * @author John Powell
 * @version 1.0
 */

(function() {
    const MAX_RUNS = 20;
    const WAIT_DURATION = 1000;
    const DOWNLOAD_SIZE = 1063179;
    const DOWNLOAD_URL = "blob.data";
    
    let speedData = [];
    let labelData = [];
    let counter = 0;
    
    function updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    function startDownloadTest() {
        const startTime = Date.now();

        fetch(DOWNLOAD_URL, { cache: 'no-store' })
            .then(response => response.blob())
            .then(blob => {
                const endTime = Date.now();
                const duration = (endTime - startTime) / 1000;
                const bitsLoaded = DOWNLOAD_SIZE * 8;
                const speedBps = bitsLoaded / duration;
                const speedMbps = (speedBps / 1000000).toFixed(2);
                
                speedData.push(speedMbps);
                labelData.push(counter.toString());
                
                updateElementText("downloadSpeed", speedMbps);
            })
            .catch(error => {
                console.error("Error in download test:", error);
                updateElementText("downloadSpeed", "Error");
            });
    }

    function continuousTest() {
        if (counter < MAX_RUNS) {
            startDownloadTest();
            let op = 100 - ((counter / MAX_RUNS) * 100);
            document.getElementById("loadingPic").style="opacity: " + op.toString() + "%";
            console.log(`Test run: ${counter}`);
            counter++;
            setTimeout(continuousTest, WAIT_DURATION);
        } else {
            document.getElementById("loadingPic").style="display: none";
            drawChart();
        }
    }

    function calculateAverage(data) {
        const sum = data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        return sum / data.length;
    }

    function drawChart() {
        let averageSpeed = calculateAverage(speedData);

        // Create a graph using Chart.js
        let ctx = document.getElementById('speedChart').getContext('2d');
        let speedChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelData, 
                datasets: [{
                    label: 'Speed (Mbps)',
                    data: speedData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    annotation: {
                        annotations: {
                            averageLine: {
                                type: 'line',
                                yMin: averageSpeed,
                                yMax: averageSpeed,
                                borderColor: 'rgb(26, 179, 148)',
                                borderWidth: 2,
                                label: {
                                    enabled: true,
                                    content: 'Average',
                                    position: 'start'
                                }
                            }
                        }
                    }
                }
            }
        });
    
        document.getElementById('speedChart').style = "display: block;";
        document.getElementById("downloadSpeed").textContent = averageSpeed.toFixed(2);
    }


    function fetchIPAddress() {
        // Using ipify.org to get the IP address
        fetch('https://api.ipify.org/?format=json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("ipAddress").textContent = data.ip;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
            document.getElementById("ipAddress").textContent = 'Error fetching IP address';
        });
    }

    fetchIPAddress();
    continuousTest();
})();





