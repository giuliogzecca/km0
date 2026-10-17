// --- CERVELLO DELLA MAPPA INTERATTIVA (OFFRO / CERCO) ---

let mappaTrentino = null;
let layerSegnaposto = null;
let modalitàMappaCorrente = 'offro'; // Modalità iniziale: Offro (Mostra i Compratori)
let sezioneAttiva = 'Orto & Frutteto';

// Dati simulati di esempio sul territorio trentino
const puntiMappaEsempio = [
    // COMPRATORI (Visibili in modalità 'OFFRO')
    { nome: "Osteria del Tipico", tipo: "compratore", comune: "Trento", lat: 46.0678, lng: 11.1211, cerca: "Cerca miele biologico di castagno e legna da faggio" },
    { nome: "Bottega della Valle", tipo: "compratore", comune: "Cles (Val di Non)", lat: 46.3663, lng: 11.0342, cerca: "Cerca ortaggi freschi e bancali di pellet A1" },
    { nome: "Rifugio Alpe Verde", tipo: "compratore", comune: "Val di Fiemme", lat: 46.2833, lng: 11.5667, cerca: "Cerca faggio stagionato per stufa e formaggi" },
    
    // VENDITORI (Visibili in modalità 'CERCO')
    { nome: "Azienda Agricola MelaTrentina", tipo: "venditore", comune: "Val di Non", lat: 46.3500, lng: 11.0500, offre: "Offre cassette di mele Renetta e Golden" },
    { nome: "Legna & Pellet Val di Fiemme", tipo: "venditore", comune: "Cavalese", lat: 46.2889, lng: 11.4603, offre: "Offre legna di faggio secca in bancali e pellet" },
    { nome: "Apicoltura Castagni del Trentino", tipo: "venditore", comune: "Rovereto", lat: 45.8911, lng: 11.0401, offre: "Offre miele di castagno, millefiori e marroni freschi" }
];

function inizializzaMappa() {
    const contenitoreMappa = document.getElementById('mappa-interattiva');
    if (!contenitoreMappa) return;

    mappaTrentino = L.map('mappa-interattiva').setView([46.1000, 11.1000], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mappaTrentino);

    layerSegnaposto = L.layerGroup().addTo(mappaTrentino);
    aggiornaPuntiMappa();
}

function impostaModalitaMappa(modalita) {
    modalitàMappaCorrente = modalita;
    
    const btnOffro = document.getElementById('btn-map-offro');
    const btnCerco = document.getElementById('btn-map-cerco');
    const testoLegenda = document.getElementById('mappa-legenda-testo');

    if (modalita === 'offro') {
        btnOffro.className = 'btn-toggle-map attivo-offro';
        btnCerco.className = 'btn-toggle-map';
        testoLegenda.innerHTML = "🎁 Modalità OFFRO: Sulla mappa sono evidenziati i <b>COMPRATORI</b> che cercano i prodotti di questa sezione.";
    } else {
        btnOffro.className = 'btn-toggle-map';
        btnCerco.className = 'btn-toggle-map attivo-cerco';
        testoLegenda.innerHTML = "🔍 Modalità CERCO: Sulla mappa sono evidenziati i <b>VENDITORI</b> che offrono i prodotti di questa sezione.";
    }

    aggiornaPuntiMappa();
}

function aggiornaPuntiMappa() {
    if (!layerSegnaposto) return;
    layerSegnaposto.clearLayers();

    puntiMappaEsempio.forEach(punto => {
        if (modalitàMappaCorrente === 'offro' && punto.tipo === 'compratore') {
            const marker = L.marker([punto.lat, punto.lng]).addTo(layerSegnaposto);
            marker.bindPopup(`
                <div style="font-family: sans-serif;">
                    <h4 style="margin:0 0 5px 0; color:#1b4332;">${punto.nome}</h4>
                    <p style="margin:0; font-weight:bold; color:#00b4d8;">📍 ${punto.comune}</p>
                    <p style="margin:5px 0 0 0; font-size:13px;">${punto.cerca}</p>
                </div>
            `);
        } else if (modalitàMappaCorrente === 'cerco' && punto.tipo === 'venditore') {
            const marker = L.marker([punto.lat, punto.lng]).addTo(layerSegnaposto);
            marker.bindPopup(`
                <div style="font-family: sans-serif;">
                    <h4 style="margin:0 0 5px 0; color:#1b4332;">${punto.nome}</h4>
                    <p style="margin:0; font-weight:bold; color:#2d6a4f;">📍 ${punto.comune}</p>
                    <p style="margin:5px 0 0 0; font-size:13px;">${punto.offre}</p>
                </div>
            `);
        }
    });
}

window.aggiornaSezioneMappa = function(nomeSezione) {
    sezioneAttiva = nomeSezione;
    if (mappaTrentino) {
        setTimeout(() => { mappaTrentino.invalidateSize(); }, 300);
    }
};

document.addEventListener('DOMContentLoaded', inizializzaMappa);
