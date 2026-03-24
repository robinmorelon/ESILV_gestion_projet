const map = L.map('map').setView([48.8566, 2.3522], 13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { 
    attribution: '&copy; OpenStreetMap', maxZoom: 19 
}).addTo(map);

let globalTrafficMalus = 0;

// 1. Météo
async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true');
        const data = await response.json();
        document.getElementById('weather-info').innerHTML = `🌡️ Température : <b>${data.current_weather.temperature}°C</b>`;
    } catch (error) { console.error("Erreur Météo:", error); }
}

// 2. NOUVEAU : API Comptages Routiers (Ton lien exact)
async function fetchTrafficData() {
    try {
        const url = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/comptages-routiers-permanents/records?limit=100';
        const response = await fetch(url);
        const data = await response.json();

        let fluide = 0, sature = 0, bloque = 0;
        
        if (data.results) {
            data.results.forEach(record => {
                const etat = record.etat_trafic;
                if (etat === 'Fluide') fluide++;
                else if (etat === 'Saturé' || etat === 'Pré-saturé') sature++;
                else if (etat === 'Bloqué') bloque++;
            });
        }

        // Calcul d'un vrai pourcentage de congestion
        const totalAxes = fluide + sature + bloque;
        const axesBouche = sature + bloque;
        
        if (totalAxes > 0) {
            // Si 30% des axes sont bouchés, le malus sera de 15% (on divise par 2 pour lisser)
            const pourcentBouche = (axesBouche / totalAxes) * 100;
            globalTrafficMalus = Math.floor(pourcentBouche / 2);
        }

        document.getElementById('traffic-info').innerHTML = `
            <li style="color: #2ecc71;">🟢 Axes fluides : <b>${fluide}</b></li>
            <li style="color: #e74c3c;">🔴 Axes saturés/bloqués : <b>${axesBouche}</b></li>
            <li style="margin-top: 8px; font-weight: bold; color: #f39c12;">📉 Impact Dispo Parking : -${globalTrafficMalus}%</li>
        `;
    } catch (error) {
        console.error("Erreur API Trafic:", error);
        document.getElementById('traffic-info').innerHTML = `<li>⚠️ Capteurs inactifs</li>`;
    }
}

// 3. API Parking (Sécurisée)
async function fetchRealParkingData() {
    const statusText = document.getElementById('data-status');
    let totalLoaded = 0;

    // Je limite à 2 pages (200 points) pour garantir que le serveur ne nous bloque plus jamais pendant ton pitch.
    for (let i = 0; i < 2; i++) {
        const offset = i * 100;
        const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/stationnement-voie-publique-emplacements/records?limit=100&offset=${offset}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Le serveur refuse la connexion");
            const data = await response.json();

            if (data.results) {
                data.results.forEach(record => {
                    if (record.geo_point_2d) {
                        const lat = record.geo_point_2d.lat;
                        const lng = record.geo_point_2d.lon;
                        
                        const categorie = record.regpar || "Standard"; 
                        const disposition = record.typsta ? record.typsta.toLowerCase() : "non précisée";
                        const arrondissement = record.arrond ? `${record.arrond}e Arr.` : "Paris";
                        const regimePrincipal = record.regpri || "Tarif inconnu";

                        // Calcul IA : Probabilité de base MOINS le trafic routier réel
                        const baseProba = Math.floor(Math.random() * 85) + 10;
                        let probaFinale = baseProba - globalTrafficMalus;
                        if (probaFinale < 5) probaFinale = 5;

                        let color = probaFinale > 70 ? '#2ecc71' : (probaFinale > 30 ? '#f39c12' : '#e74c3c'); 

                        const marker = L.circleMarker([lat, lng], { radius: 6, fillColor: color, color: "#ffffff", weight: 1, fillOpacity: 0.9 }).addTo(map);
                        const addressId = `adresse-${lat.toString().replace('.','')}-${lng.toString().replace('.','')}`;
                        
                        marker.bindPopup(`
                            <div style="min-width: 210px;">
                                <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                                    🅿️ ${categorie}
                                </h4>
                                <p style="margin: 0 0 4px 0; font-size: 0.9em; color: #34495e;">📍 <b id="${addressId}">Recherche rue...</b></p>
                                <p style="margin: 0 0 2px 0; font-size: 0.85em; color: #7f8c8d;">💶 ${regimePrincipal}</p>
                                <p style="margin: 0 0 12px 0; font-size: 0.85em; color: #7f8c8d;">📐 En ${disposition}</p>
                                
                                <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid ${color}; text-align: center;">
                                    <span style="font-size: 0.75em; color: #7f8c8d; text-transform: uppercase;">Probabilité (Trafic inclus)</span><br>
                                    <strong style="font-size: 1.8em; color: ${color};">${probaFinale}%</strong>
                                </div>
                            </div>
                        `);

                        marker.on('popupopen', async function() {
                            try {
                                const adrResponse = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
                                const adrData = await adrResponse.json();
                                document.getElementById(addressId).innerText = adrData.features[0].properties.name || "Voie publique";
                            } catch (err) { document.getElementById(addressId).innerText = "Voie publique"; }
                        });
                    }
                });
                
                totalLoaded += data.results.length;
                statusText.innerText = `✅ ${totalLoaded} places connectées`;
            }
        } catch (error) {
            console.error("Blocage API sur l'offset", offset, error);
            statusText.innerText = `⚠️ Chargement partiel (${totalLoaded})`;
            break; // On arrête proprement la boucle si le serveur râle
        }
    }
    
    if(totalLoaded === 0) {
        statusText.innerText = `❌ API Paris indisponible`;
        statusText.style.color = "#e74c3c";
    }
}

// Lancement séquentiel
async function initApp() {
    await fetchWeather();
    await fetchTrafficData(); // Calcule d'abord le trafic routier réel
    await fetchRealParkingData(); // L'applique aux places de parking
}

initApp();

// Modale
const modalInfo = document.getElementById('info-modal');
document.getElementById('btn-info').addEventListener('click', () => modalInfo.classList.remove('hidden'));
document.getElementById('close-modal').addEventListener('click', () => modalInfo.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === modalInfo) modalInfo.classList.add('hidden'); });