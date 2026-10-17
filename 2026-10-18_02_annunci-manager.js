// --- CERVELLO GESTIONE ANNUNCI VENDITORI PER SEZIONE ---

// Dati simulati di esempio per mostrare le schede venditore se la tabella Supabase è vuota
const annunciEsempio = [
    {
        titolo: "Cassetta Mele Renetta Biologiche",
        venditore: "Az. Agr. Rossi Mario",
        categoria: "Azienda Agricola",
        comune: "Cles (Val di Non)",
        prezzo: "1.50 € / kg",
        descrizione: "Mele fresche appena raccolte, coltivate senza pesticidi. Disponibili cassette da 5kg e 10kg.",
        contatto: "Tel. 333 1234567"
    },
    {
        titolo: "Piccoli Frutti e Mirtilli Freschi",
        venditore: "Mirtilleto di Montagna",
        categoria: "Produttore Locale",
        comune: "Val di Sole",
        prezzo: "4.00 € / vaschetta",
        descrizione: "Mirtilli e lamponi coltivati in alta quota, ideali per marmellate o consumo fresco.",
        contatto: "info@mirtillitrento.it"
    }
];

async function caricaAnnunciSezione(nomeSezione) {
    const contenitore = document.getElementById('contenitore-annunci-grid');
    if (!contenitore) return;

    contenitore.innerHTML = "<p style='text-align:center;'>Caricamento annunci venditori in corso...</p>";

    try {
        // Proviamo a chiedere a Supabase gli annunci della sezione
        const { data: prodotti, error } = await supabaseClient
            .from('prodotti')
            .select('*')
            .eq('sezione', nomeSezione)
            .order('created_at', { ascending: false });

        if (error || !prodotti || prodotti.length === 0) {
            // Se non ci sono ancora dati su Supabase, mostriamo gli annunci di esempio per dimostrazione
            mostraAnnunci(annunciEsempio);
        } else {
            mostraAnnunci(prodotti);
        }
    } catch (err) {
        mostraAnnunci(annunciEsempio);
    }
}

function mostraAnnunci(lista) {
    const contenitore = document.getElementById('contenitore-annunci-grid');
    contenitore.innerHTML = "";

    lista.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-annuncio';
        card.innerHTML = `
            <div>
                <div class="card-annuncio-header">
                    <span class="venditore-badge">🏡 ${item.venditore || item.nome_venditore || 'Produttore Locale'}</span>
                    <span class="comune-badge">📍 ${item.comune || 'Trentino'}</span>
                </div>
                <div class="card-annuncio-body">
                    <h3>${item.titolo}</h3>
                    <p>${item.descrizione}</p>
                    <div class="prezzo-box">💰 ${item.prezzo}</div>
                </div>
            </div>
            <div class="card-annuncio-footer">
                <small style="color:#666;">Contatto diretto:</small>
                <a href="tel:${item.contatto}" class="btn-contatta">📞 ${item.contatto}</a>
            </div>
        `;
        contenitore.appendChild(card);
    });
}
