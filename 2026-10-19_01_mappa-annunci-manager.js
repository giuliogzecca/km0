// --- CERVELLO PER TRADURRE GLI ANNUNCI IN SPILLINE SULLA MAPPA ---

// Memoria per salvare i segnaposto creati
let mappaIstanza = null;
let gruppoSpilline = null;

// Dizionario geografico dei principali comuni e valli del Trentino (Coordinate GPS veloci)
const coordinateTrentino = {
    "trento": [46.0679, 11.1211],
    "rovereto": [45.8906, 11.0401],
    "cles": [46.3582, 11.0336],
    "riva del garda": [45.8858, 10.8412],
    "arco": [45.9177, 10.8867],
    "cavalese": [46.2911, 11.4602],
    "predazzo": [46.3125, 11.6015],
    "borgo valsugana": [46.0522, 11.4552],
    "pieve tesino": [46.0688, 11.6083],
    "mezzolombardo": [46.2144, 11.0911],
    "mezzocorona": [46.2191, 11.1189],
    "pergine valsugana": [46.0614, 11.2386],
    "mori": [45.8519, 10.9808],
    "aleno": [45.8853, 11.0112],
    "pinzolo": [46.1592, 10.7661],
    "tione di trento": [46.0347, 10.7262],
    "cembra": [46.1758, 11.2208],
    "val di non": [46.3500, 11.0333],
    "val di sole": [46.3167, 10.8000],
    "val di fiemme": [46.2833, 11.4500],
    "val di fassa": [46.4333, 11.6833],
    "valsugana": [46.0500, 11.4500],
    "giudicarie": [46.0333, 10.7333],
    "alto garda": [45.8900, 10.8500]
};

// Funzione che crea la mappa centro Trentino se non è ancora stata creata
function inizializzaMappaAnnunci() {
    const contenitoreMappa = document.getElementById('mappa-interattiva');
    if (!contenitoreMappa) return;

    if (!mappaIstanza) {
        // Centro del Trentino (Trento/Monte Bondone)
        mappaIstanza = L.map('mappa-interattiva').setView([46.0679, 11.1211], 9);

        // Disegna lo sfondo della mappa di OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap'
        }).addTo(mappaIstanza);

        gruppoSpilline = L.layerGroup().addTo(mappaIstanza);
    }
}

// Funzione che prende la lista degli annunci e crea le spilline sulla mappa
async function aggiornaSpillineMappa(listaAnnunci) {
    inizializzaMappaAnnunci();
    if (!gruppoSpilline) return;

    // Pulisce le vecchie spilline
    gruppoSpilline.clearLayers();

    for (const item of listaAnnunci) {
        if (!item.comune) continue;

        const nomeComunePulito = item.comune.trim().toLowerCase();
        let coords = null;

        // 1. Cerca prima nel nostro dizionario geografico trentino
        for (const chiave in coordinateTrentino) {
            if (nomeComunePulito.includes(chiave)) {
                coords = coordinateTrentino[chiave];
                break;
            }
        }

        // 2. Se non lo trova nel dizionario, chiede al navigatore di OpenStreetMap
        if (!coords) {
            try {
                const risposta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.comune + ' Trentino Italia')}`);
                const datiGeografici = await risposta.json();
                if (datiGeografici && datiGeografici.length > 0) {
                    coords = [parseFloat(datiGeografici[0].lat), parseFloat(datiGeografici[0].lon)];
                }
            } catch (err) {
                console.log("Impossibile trovare le coordinate per:", item.comune);
            }
        }

        // 3. Se abbiamo trovato la posizione GPS, piantiamo la spillina verde!
        if (coords) {
            // Aggiunge un piccolo spostamento casuale se ci sono più annunci nello stesso paese
            const latFuzzy = coords[0] + (Math.random() - 0.5) * 0.012;
            const lonFuzzy = coords[1] + (Math.random() - 0.5) * 0.012;

            const foto = item.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

            const contenutoFumetto = `
                <div style="text-align:center; max-width:200px;">
                    <img src="${foto}" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
                    <h4 style="margin:0 0 5px 0; color:#1b4332;">${item.titolo}</h4>
                    <p style="margin:0; font-size:0.85rem; color:#555;">🏡 <b>${item.venditore || 'Produttore'}</b></p>
                    <p style="margin:2px 0; font-size:0.85rem; color:#2e7d32;">📍 ${item.comune}</p>
                    <p style="margin:5px 0; font-size:0.9rem; font-weight:bold; color:#1b4332;">💰 ${item.prezzo}</p>
                    <a href="tel:${item.contatto}" style="display:inline-block; background:#2e7d32; color:white; padding:5px 10px; border-radius:6px; text-decoration:none; font-size:0.8rem; margin-top:5px; font-weight:bold;">📞 Contatta</a>
                </div>
            `;

            L.marker([latFuzzy, lonFuzzy])
                .addTo(gruppoSpilline)
                .bindPopup(contenutoFumetto);
        }
    }
}
