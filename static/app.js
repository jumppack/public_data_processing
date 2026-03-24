document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

// Common Chart.js styling variables
const textColor = '#94a3b8';
const gridColor = 'rgba(255, 255, 255, 0.05)';
const tooltipBg = 'rgba(15, 23, 42, 0.9)';

// Setup Default Chart API Options for Dark Mode
Chart.defaults.color = textColor;
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = tooltipBg;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.scale.grid.color = gridColor;

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/v1/dashboard-data');
        if (!response.ok) {
            const errBody = await response.json();
            throw new Error(errBody.detail || 'Failed to fetch data');
        }
        
        const json = await response.json();
        const data = json.data;
        
        // Hide loader, show grid
        document.getElementById('loading').style.display = 'none';
        const grid = document.getElementById('dashboards-grid');
        grid.style.display = 'grid';
        grid.style.animation = 'fadeIn 1s ease-out';
        
        renderCharts(data);
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        const errorContainer = document.getElementById('error-message');
        errorContainer.style.display = 'block';
        document.getElementById('error-text').innerText = error.message;
        console.error("Dashboard Error:", error);
    }
}

function renderCharts(data) {
    const labels = data.map(d => d.year);
    
    // Parse data arrays
    const medianIncome = data.map(d => d.median_income);
    const empManagement = data.map(d => d.employed_management);
    const empService = data.map(d => d.employed_service);
    const empArts = data.map(d => d.employed_arts);
    const empManufacturing = data.map(d => d.employed_manufacturing);
    
    // Chart 1: Income vs Profession
    new Chart(document.getElementById('incomeProfessionChart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Median Income ($)',
                    data: medianIncome,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Management/Business',
                    data: empManagement,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Service Workers',
                    data: empService,
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Manufacturing',
                    data: empManufacturing,
                    borderColor: '#8b5cf6',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Arts & Entertainment',
                    data: empArts,
                    borderColor: '#ec4899',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    // Chart 2: Housing Affordability 
    const medianRent = data.map(d => d.median_rent);
    const incomePerCapita = data.map(d => d.income_per_capita);
    new Chart(document.getElementById('housingChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Median Rent',
                    data: medianRent,
                    backgroundColor: '#ec4899',
                    borderRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Income Per Capita',
                    data: incomePerCapita,
                    type: 'line',
                    borderColor: '#8b5cf6',
                    borderWidth: 3,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', position: 'left', title: {display: true, text: 'Rent ($)'} },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: {display: true, text: 'Income ($)'} }
            }
        }
    });

    // Chart 3: Sector Employment Shifts
    new Chart(document.getElementById('sectorChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['2015', '2016', '2017', '2018'],
            datasets: [
                {
                    label: 'Arts/Service',
                    data: empArts,
                    backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'],
                    borderWidth: 0
                },
                {
                    label: 'Manufacturing',
                    data: empManufacturing,
                    backgroundColor: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // Chart 4: Infrastructure Load
    const totalPop = data.map(d => d.total_population);
    const totalCommute = data.map(d => d.aggregate_travel_time);
    new Chart(document.getElementById('infrastructureChart').getContext('2d'), {
        type: 'radar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Population Growth Ratio',
                    data: totalPop.map(p => p / totalPop[0]), // Normalized
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38bdf8',
                    pointBackgroundColor: '#38bdf8'
                },
                {
                    label: 'Commute Time Ratio',
                    data: totalCommute.map(c => c / totalCommute[0]), // Normalized
                    backgroundColor: 'rgba(236, 72, 153, 0.2)',
                    borderColor: '#ec4899',
                    pointBackgroundColor: '#ec4899'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: { color: textColor },
                    ticks: { display: false }
                }
            }
        }
    });
}
