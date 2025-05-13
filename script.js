// API Configuration
const apiKey = 'f7115191c672dff4de58da14cac090eb'; 
const baseUrl = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const forecastInfo = document.getElementById('forecast-info');

// Event Listeners
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && fetchWeather());

// Fetch Weather Data
function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError(weatherInfo, "Please enter a city name.");
        return;
    }

    // Show loading state
    weatherInfo.innerHTML = '<div class="loading">🌤️ Loading weather...</div>';
    forecastInfo.innerHTML = '<div class="loading">📅 Loading forecast...</div>';

    // Fetch current weather
    fetch(`${baseUrl}weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(handleResponse)
        .then(data => displayCurrentWeather(data))
        .catch(error => showError(weatherInfo, error.message));

    // Fetch 5-day forecast
    fetch(`${baseUrl}forecast?q=${city}&units=metric&appid=${apiKey}`)
        .then(handleResponse)
        .then(data => displayForecast(data))
        .catch(error => showError(forecastInfo, "Could not load forecast."));
}

// Handle API response
function handleResponse(response) {
    if (!response.ok) {
        throw new Error(response.status === 404 ? "City not found." : "API error.");
    }
    return response.json();
}

// Display Current Weather
function displayCurrentWeather(data) {
    const { name, sys, weather, main, wind } = data;
    const { icon, description } = weather[0];
    
    weatherInfo.innerHTML = `
        <div class="weather-card">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <div>
                <h3>${name}, ${sys.country}</h3>
                <p>${description.replace(/^\w/, c => c.toUpperCase())}</p>
                <p>🌡️ Temp: ${Math.round(main.temp)}°C</p>
                <p>💧 Humidity: ${main.humidity}%</p>
                <p>🌬️ Wind: ${wind.speed} m/s</p>
            </div>
        </div>
    `;
}

// Display 5-Day Forecast
function displayForecast(data) {
    const forecastDays = data.list.filter((_, index) => index % 8 === 0).slice(0, 5); // Daily at ~12PM
    forecastInfo.innerHTML = forecastDays.map(day => {
        const date = new Date(day.dt * 1000);
        const { icon, description } = day.weather[0];
        return `
            <div class="forecast-day">
                <h4>${date.toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                <p>${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</p>
            </div>
        `;
    }).join('');
}

// Show error message
function showError(element, message) {
    element.innerHTML = `<p class="error">⚠️ ${message}</p>`;
}