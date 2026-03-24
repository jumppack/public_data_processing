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
    
    // Chart 1: Overall Median Income Trend
    const medianIncome = data.map(d => d.median_income);
    new Chart(document.getElementById('incomeTrendChart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Median Household Income ($)',
                    data: medianIncome,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { type: 'linear', display: true, position: 'left' }
            }
        }
    });

    // Chart 2: Income Bracket Distribution
    // Sum across years isn't useful for a time series if we just want a breakdown, 
    // but a grouped bar chart by year works beautifully here.
    const bracket50 = data.map(d => d.income_bracket_50k_60k);
    const bracket100 = data.map(d => d.income_bracket_100k_125k);
    const bracket200 = data.map(d => d.income_bracket_200k_plus);

    new Chart(document.getElementById('incomeBracketChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '$50k - $60k',
                    data: bracket50,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                },
                {
                    label: '$100k - $125k',
                    data: bracket100,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4,
                },
                {
                    label: '$200k+',
                    data: bracket200,
                    backgroundColor: '#ec4899',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { title: { display: true, text: 'Total Households' } }
            }
        }
    });

    // Chart 3: Housing Affordability Metrics
    const medianRent = data.map(d => d.median_rent);
    const incomePerCapita = data.map(d => d.income_per_capita);
    new Chart(document.getElementById('housingChart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Income Per Capita',
                    data: incomePerCapita,
                    borderColor: '#8b5cf6',
                    borderWidth: 3,
                    tension: 0.3,
                    yAxisID: 'y1'
                },
                {
                    label: 'Median Rent',
                    data: medianRent,
                    borderColor: '#ec4899',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    tension: 0.3,
                    yAxisID: 'y'
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

    // Chart 4: Key Employment Sectors
    const empManagement = data.map(d => d.employed_management);
    const empManufacturing = data.map(d => d.employed_manufacturing);
    new Chart(document.getElementById('sectorChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Management & Business',
                    data: empManagement,
                    backgroundColor: '#0ea5e9',
                    borderRadius: 4,
                },
                {
                    label: 'Manufacturing',
                    data: empManufacturing,
                    backgroundColor: '#14b8a6',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { title: { display: true, text: 'Total Workers' } }
            }
        }
    });
}
