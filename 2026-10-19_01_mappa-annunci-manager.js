// --- CERVELLO DOPPIA MAPPA (OFFRO / CERCO) ---

let mappaIstanza = null;
let gruppoSpilline = null;
let modalitaMappaAttuale = 'offro'; // Modalità predefinita: OFFRO (Vedo chi Vende)

// Dizionario geografico dei principali comuni del Trentino
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
    "ala": [45.8211, 11.0031],
    "pinzolo": [46.1592, 10.7661],
    "tione di trento": [46.0347, 10.7262],
    "cembra": [46.1758, 11.2208],
    "val di non": [46.3500, 11.0333],
    "val di sole": [46.3167, 10.8000],
    "val di fiemme": [46.2833, 11.4500],
    "val di fassa": [46.4333, 11.6833],
    "valsugana": [46.0500, 11.4500]
};

// Inizializza la mappa centrata sul Trentino
function inizializzaMappaAnnunci() {
    const contenitoreMappa = document.getElementById('mappa-interattiva');
    if (!contenitoreMappa) return;

    if (!mappaIstanza) {
        mappaIstanza = L.map('mappa-interattiva').setView([46.0679, 11.1211], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap'
        }).addTo(mappaIstanza);

        gruppoSpilline = L.layerGroup().addTo(mappaIstanza);
    }
}

// Commuta la visualizzazione tra Mappa OFFRO (Venditori) e Mappa CERCO (Compratori)
function impostaModalitaMappa(modalita) {
    modalitaMappaAttuale = modalita;
    
    // Aggiorna la grafica dei due pulsanti interruttore
    const btnOffro = document.getElementById('btn-map-offro');
    const btnCerco = document.getElementById('btn-map-cerco');
    const testoLegenda = document.getElementById('mappa-legenda-testo');

    if (modalita === 'offro') {
        if (btnOffro) btnOffro.className = "btn-toggle-map attivo-offro";
        if (btnCerco) btnCerco.className = "btn-toggle-map";
        if (testoLegenda) testoLegenda.innerHTML = "🎁 Modalità <b>OFFRO</b>: Sulla mappa vedi i <b>VENDITORI E PRODUTTORI</b> con i loro prodotti disponibili.";
    } else {
        if (btnOffro) btnOffro.className = "btn-toggle-map";
        if (btnCerco) btnCerco.className = "btn-toggle-map attivo-cerco";
        if (testoLegenda) testoLegenda.innerHTML = "🔍 Modalità <b>CERCO</b>: Sulla mappa vedi gli <b>ACQUIRENTI (Ristoranti, Botteghe, Cittadini)</b> che stanno cercando prodotti in questa sezione.";
    }

    // Rinfresca le spilline sulla mappa in base alla modalità scelta
    if (window.annunciCaricatiCorrenti) {
        aggiornaSpillineMappa(window.annunciCaricatiCorrenti);
    }
}

// Disegna le spilline filtrate per la modalità attiva (OFFRO o CERCO)
async function aggiornaSpillineMappa(listaAnnunci) {
    inizializzaMappaAnnunci();
    if (!gruppoSpilline) return;

    gruppoSpilline.clearLayers();

    // Filtra gli annunci: mostra solo quelli corrispondenti alla mappa selezionata
    const annunciFiltrati = listaAnnunci.filter(item => {
        const tipo = (item.tipo_annuncio || 'offro').toLowerCase();
        return tipo === modalitaMappaAttuale;
    });

    for (const item of annunciFiltrati) {
        if (!item.comune) continue;

        const nomeComunePulito = item.comune.trim().toLowerCase();
        let coords = null;

        for (const chiave in coordinateTrentino) {
            if (nomeComunePulito.includes(chiave)) {
                coords = coordinateTrentino[chiave];
                break;
            }
        }

        if (!coords) {
            try {
                const risposta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.comune + ' Trentino Italia')}`);
                const datiGeografici = await risposta.json();
                if (datiGeografici && datiGeografici.length > 0) {
                    coords = [parseFloat(datiGeografici[0].lat), parseFloat(datiGeografici[0].lon)];
                }
            } catch (err) {
                console.log("Coordinate non trovate per:", item.comune);
            }
        }

        if (coords) {
            const latFuzzy = coords[0] + (Math.random() - 0.5) * 0.012;
            const lonFuzzy = coords[1] + (Math.random() - 0.5) * 0.012;

            const foto = item.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
            const badgeTipo = item.tipo_annuncio === 'cerco' ? '🔍 CERCO' : '🎁 OFFRO';
            const coloreEtichetta = item.tipo_annuncio === 'cerco' ? '#00b4d8' : '#2e7d32';

            const contenutoFumetto = `
                <div style="text-align:center; max-width:200px;">
                    <span style="background:${coloreEtichetta}; color:white; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:bold;">${badgeTipo}</span>
                    <img src="${foto}" style="width:100%; height:90px; object-fit:cover; border-radius:8px; margin:8px 0 5px 0;">
                    <h4 style="margin:0 0 5px 0; color:#1b4332;">${item.titolo}</h4>
                    <p style="margin:0; font-size:0.85rem; color:#555;">👤 <b>${item.venditore || 'Utente'}</b></p>
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
