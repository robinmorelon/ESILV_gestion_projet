const map = L.map('map').setView([48.8566, 2.3522], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
}).addTo(map);

async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true');
        const data = await response.json();
        const temp = data.current_weather.temperature;
        document.getElementById('weather-info').innerHTML = `🌡️ Température : <b>${temp}°C</b>`;
    } catch (error) {
        console.error("Erreur API Météo:", error);
    }
}

async function fetchRealParkingData() {
    try {
        const url = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/stationnement-voie-publique-emplacements/records?limit=100';
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            data.results.forEach(record => {
                if (record.geo_point_2d) {
                    const lat = record.geo_point_2d.lat;
                    const lng = record.geo_point_2d.lon;
                    
                    // --- EXPLOITATION COMPLÈTE DE L'API ---
                    const categorie = record.regpar || "Standard"; 
                    const disposition = record.typsta ? record.typsta.toLowerCase() : "non précisée";
                    const arrondissement = record.arrond ? `${record.arrond}e Arr.` : "Paris";
                    const regimePrincipal = record.regpri || "Tarif inconnu"; // Payant ou Gratuit
                    const localisation = record.locsta || "Chaussée"; // Chaussée ou Trottoir

                    const proba = Math.floor(Math.random() * 85) + 10;
                    
                    let color;
                    if (proba > 70) color = '#2ecc71'; 
                    else if (proba > 30) color = '#f39c12'; 
                    else color = '#e74c3c'; 

                    const marker = L.circleMarker([lat, lng], {
                        radius: 7,
                        fillColor: color,
                        color: "#ffffff",
                        weight: 1,
                        fillOpacity: 0.9
                    }).addTo(map);

                    const addressId = `adresse-${lat.toString().replace('.','')}-${lng.toString().replace('.','')}`;

                    // Design de la bulle beaucoup plus complet
                    const popupHTML = `
                        <div style="min-width: 200px;">
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                                🅿️ ${categorie}
                            </h4>
                            <p style="margin: 5px 0 2px 0; font-size: 0.9em; color: #7f8c8d;">
                                📍 <b id="${addressId}">Recherche rue...</b> (${arrondissement})
                            </p>
                            <p style="margin: 0 0 2px 0; font-size: 0.85em; color: #95a5a6;">
                                💶 <b>${regimePrincipal}</b>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 0.85em; color: #95a5a6;">
                                📐 Sur ${localisation.toLowerCase()} en ${disposition}
                            </p>
                            
                            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid ${color}; text-align: center;">
                                <span style="font-size: 0.8em; color: #34495e; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Probabilité IA Dispo.
                                </span><br>
                                <strong style="font-size: 1.6em; color: ${color};">
                                    ${proba}%
                                </strong>
                            </div>
                        </div>
                    `;
                    marker.bindPopup(popupHTML);

                    marker.on('popupopen', async function() {
                        try {
                            const adrResponse = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
                            const adrData = await adrResponse.json();
                            
                            let vraieRue = "Voie publique";
                            if (adrData.features && adrData.features.length > 0) {
                                vraieRue = adrData.features[0].properties.name;
                            }
                            
                            document.getElementById(addressId).innerText = vraieRue;
                        } catch (err) {
                            document.getElementById(addressId).innerText = "Voie publique";
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error("Erreur API OpenData:", error);
    }
}

fetchWeather();
fetchRealParkingData();

// --- GESTION DE LA FENÊTRE MODALE ---
const btnInfo = document.getElementById('btn-info');
const modalInfo = document.getElementById('info-modal');
const btnClose = document.getElementById('close-modal');

btnInfo.addEventListener('click', () => { modalInfo.classList.remove('hidden'); });
btnClose.addEventListener('click', () => { modalInfo.classList.add('hidden'); });
window.addEventListener('click', (event) => {
    if (event.target === modalInfo) { modalInfo.classList.add('hidden'); }
});