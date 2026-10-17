// --- CERVELLO DELLA MAPPA INTERATTIVA (OFFRO / CERCO) ---

let mappaTrentino = null;
let layerSegnaposto = null;
let modalitàMappaCorrente = 'offro'; // Modalità iniziale: Offro (Mostra i Compratori)
let sezioneAttiva = 'Orto & Frutteto';

// Dati simulati di esempio sul territorio trentino (in attesa dei dati reali da Supabase)
const puntiMappaEsempio = [
    // COMPRATORI (Visibili quando l'interruttore è su 'OFFRO')
    { nome: "Osteria del Tipico", tipo: "compratore", ruolo: "🍽️ Ristorante", comune: "Trento", lat: 46.0678, lng: 11.1211, cerca: "Cerca mele e frutti di bosco freschi a KM0" },
    { nome: "Bottega della Valle", tipo: "compratore", ruolo: "🛒 Bottega Locale", comune: "Cles (Val di Non)", lat: 46.3663, lng: 11.0342, cerca: "Cerca ortaggi e succhi biologici" },
    { nome: "Bar Ristorante Il Passo", tipo: "compratore", ruolo: "🍷 Locale / Bar", comune: "Rovereto", lat: 45.8911, lng: 11.0401, cerca: "Cerca salumi, formaggi e vino locale" },
    
    // VENDITORI (Visibili quando l'interruttore è su 'CERCO')
    { nome: "Azienda Agricola MelaTrentina", tipo: "venditore", ruolo: "🍏 Produttore Locale", comune: "Val di Non", lat: 46.3500, lng: 11.0500, offre: "Offre cassette di mele Renetta e Golden" },
    { nome: "Malga Alta Montagna", tipo: "venditore", ruolo: "🧀 Malga", comune: "Mena di Rabbi", lat: 46.4000, lng: 10.9000, offre: "Offre formaggi stagionati e ricotta fresca" },
    { nome: "Azienda Bio Erbe del Trentino", tipo: "venditore", ruolo: "🌿 Hobbista / Produttore", comune: "Arco", lat: 45.9177, lng: 10.8867, offre: "Offre tisane, erbe e piantine da orto" }
];

// Inizializza la mappa sulla provincia di Trento
function inizializzaMappa() {
    const contenitoreMappa = document.getElementById('mappa-interattiva');
    if (!contenitoreMappa) return;

    // Centro della mappa impostato sul Trentino
    mappaTrentino = L.map('mappa-interattiva').setView([46.1000, 11.1000], 9);

    // Mappa visiva OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mappaTrentino);

    layerSegnaposto = L.layerGroup().addTo(mappaTrentino);

    // Carica i punti iniziali
    aggiornaPuntiMappa();
}

// Cambia la modalità tra OFFRO e CERCO
function impostaModalitaMappa(modalita) {
    modalitàMappaCorrente = modalita;
    
    const btnOffro = document.getElementById('btn-map-offro');
    const btnCerco = document.getElementById('btn-map-cerco');
    const testoLegenda = document.getElementById('mappa-legenda-testo');

    if (modalita === 'offro') {
        btnOffro.className = 'btn-toggle-map attivo-offro';
        btnCerco.className = 'btn-toggle-map';
        testoLegenda.innerHTML = "🎁 Modalità OFFRO: Sulla mappa sono evidenziati i <b>COMPRATORI</b> (Ristoranti, Locali, Botteghe e Cittadini) che cercano i prodotti di questa sezione.";
    } else {
        btnOffro.className = 'btn-toggle-map';
        btnCerco.className = 'btn-toggle-map attivo-cerco';
        testoLegenda.innerHTML = "🔍 Modalità CERCO: Sulla mappa sono evidenziati i <b>VENDITORI</b> (Aziende Agricole, Malghe e Produttori) che offrono i prodotti di questa sezione.";
    }

    aggiornaPuntiMappa();
}

// Disegna i segnaposto giusti sulla mappa
function aggiornaPuntiMappa() {
    if (!layerSegnaposto) return;
    layerSegnaposto.clearLayers();

    puntiMappaEsempio.forEach(punto => {
        // Se la modalità è OFFRO mostriamo i COMPRATORI; se è CERCO mostriamo i VENDITORI
        if (modalitàMappaCorrente === 'offro' && punto.tipo === 'compratore') {
            const marker = L.marker([punto.lat, punto.lng]).addTo(layerSegnaposto);
            marker.bindPopup(`
                <div style="font-family: sans-serif;">
                    <h4 style="margin:0 0 5px 0; color:#1b4332;">${punto.nome}</h4>
                    <p style="margin:0; font-weight:bold; color:#00b4d8;">${punto.ruolo} - ${punto.comune}</p>
                    <p style="margin:5px 0 0 0; font-size:13px;">${punto.cerca}</p>
                </div>
            `);
        } else if (modalitàMappaCorrente === 'cerco' && punto.tipo === 'venditore') {
            const marker = L.marker([punto.lat, punto.lng]).addTo(layerSegnaposto);
            marker.bindPopup(`
                <div style="font-family: sans-serif;">
                    <h4 style="margin:0 0 5px 0; color:#1b4332;">${punto.nome}</h4>
                    <p style="margin:0; font-weight:bold; color:#2d6a4f;">${punto.ruolo} - ${punto.comune}</p>
                    <p style="margin:5px 0 0 0; font-size:13px;">${punto.offre}</p>
                </div>
            `);
        }
    });
}

// Funzione richiamata quando l'utente clicca su un reparto per visualizzarne la mappa
function apriSezioneMappa(nomeSezione) {
    sezioneAttiva = nomeSezione;
    const titolo = document.getElementById('titolo-sezione-mappa');
    if (titolo) titolo.innerText = "Mappa del Territorio: " + nomeSezione;

    // Scorre la pagina fino alla mappa in modo morbido
    const elementoMappa = document.getElementById('sezione-mappa-ancora');
    if (elementoMappa) elementoMappa.scrollIntoView({ behavior: 'smooth' });

    // Ricalcola la mappa se ridimensionata
    if (mappaTrentino) {
        setTimeout(() => { mappaTrentino.invalidateSize(); }, 300);
    }
}

// Avvia la mappa appena la pagina è pronta
document.addEventListener('DOMContentLoaded', inizializzaMappa);
