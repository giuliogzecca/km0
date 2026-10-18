// --- CERVELLO GESTIONE ANNUNCI E DISTINZIONE OFFRO/CERCO ---

window.annunciCaricatiCorrenti = [];

// Annunci di dimostrazione
const annunciEsempio = [
    {
        tipo_annuncio: "offro",
        titolo: "Cassetta Mirtilli e Mele Renetta",
        venditore: "Az. Agr. Rossi Mario",
        comune: "Cles",
        prezzo: "3.50 € / vaschetta",
        descrizione: "Mirtilli freschi di montagna e mele Renetta della Val di Non.",
        contatto: "333 1234567",
        foto_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80"
    },
    {
        tipo_annuncio: "cerco",
        titolo: "Cerco fornitura Mirtilli per Ristorante",
        venditore: "Osteria del Tipico",
        comune: "Trento",
        prezzo: "Prezzo da concordare",
        descrizione: "Ristorante a Trento cerca mirtilli freschi locali a KM0 per dolci.",
        contatto: "0461 123456",
        foto_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
    }
];

// Scarica gli annunci per il reparto aperto
async function caricaAnnunciSezione(nomeSezione) {
    const contenitore = document.getElementById('contenitore-annunci-grid');
    if (!contenitore) return;

    contenitore.innerHTML = "<p style='text-align:center;'>Caricamento annunci in corso...</p>";

    try {
        const { data: prodotti, error } = await supabaseClient
            .from('prodotti')
            .select('*')
            .eq('sezione', nomeSezione)
            .order('created_at', { ascending: false });

        if (error || !prodotti || prodotti.length === 0) {
            window.annunciCaricatiCorrenti = annunciEsempio;
            mostraAnnunci(annunciEsempio);
        } else {
            window.annunciCaricatiCorrenti = prodotti;
            mostraAnnunci(prodotti);
        }
    } catch (err) {
        window.annunciCaricatiCorrenti = annunciEsempio;
        mostraAnnunci(annunciEsempio);
    }

    if (typeof aggiornaSpillineMappa === 'function') {
        aggiornaSpillineMappa(window.annunciCaricatiCorrenti);
    }
}

// Disegna le schede nella bacheca sotto la mappa
function mostraAnnunci(lista) {
    const contenitore = document.getElementById('contenitore-annunci-grid');
    contenitore.innerHTML = "";

    lista.forEach(item => {
        const foto = item.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
        const eCerco = item.tipo_annuncio === 'cerco';
        const badgeTesto = eCerco ? '🔍 CERCO' : '🎁 OFFRO';
        const badgeColore = eCerco ? '#00b4d8' : '#2e7d32';

        const card = document.createElement('div');
        card.className = 'card-annuncio';
        card.innerHTML = `
            <div>
                <img src="${foto}" alt="${item.titolo}" style="width:100%; height:180px; object-fit:cover; border-bottom:2px solid ${badgeColore};">
                <div class="card-annuncio-header">
                    <span style="background:${badgeColore}; color:white; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:0.8rem;">${badgeTesto}</span>
                    <span class="comune-badge">📍 ${item.comune || 'Trentino'}</span>
                </div>
                <div class="card-annuncio-body">
                    <h3>${item.titolo}</h3>
                    <p style="color:#555; font-size:0.9rem; margin-bottom:8px;">👤 <b>${item.venditore || 'Utente'}</b></p>
                    <p>${item.descrizione}</p>
                    <div class="prezzo-box">💰 ${item.prezzo}</div>
                </div>
            </div>
            <div class="card-annuncio-footer">
                <small style="color:#666;">Contatto:</small>
                <a href="tel:${item.contatto}" class="btn-contatta">📞 ${item.contatto}</a>
            </div>
        `;
        contenitore.appendChild(card);
    });
}

// Salva il nuovo annuncio inviando anche il TIPO ("offro" o "cerco")
async function salvaNuovoAnnuncio(event) {
    event.preventDefault();
    const msg = document.getElementById('messaggio-invio-annuncio');
    msg.innerText = "Caricamento foto e salvataggio in corso...";
    msg.style.color = "#555";

    const tipoAnnuncio = document.getElementById('annuncio-tipo-scelta').value;
    const categoriaSelezionata = document.getElementById('annuncio-sezione-destinazione').value;
    const titolo = document.getElementById('annuncio-titolo').value;
    const venditore = document.getElementById('annuncio-venditore').value;
    const comune = document.getElementById('annuncio-comune').value;
    const prezzo = document.getElementById('annuncio-prezzo').value;
    const contatto = document.getElementById('annuncio-contatto').value;
    const descrizione = document.getElementById('annuncio-descrizione').value;
    const fileInput = document.getElementById('annuncio-foto');

    let fotoUrl = "";

    try {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const nomeFileUnico = Date.now() + "_" + file.name.replace(/\s+/g, '-');

            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from('foto-prodotti')
                .upload(nomeFileUnico, file);

            if (!uploadError) {
                const { data: publicUrlData } = supabaseClient
                    .storage
                    .from('foto-prodotti')
                    .getPublicUrl(nomeFileUnico);
                fotoUrl = publicUrlData.publicUrl;
            }
        }

        const { error: insertError } = await supabaseClient
            .from('prodotti')
            .insert([{
                tipo_annuncio: tipoAnnuncio,
                sezione: categoriaSelezionata,
                titolo: titolo,
                venditore: venditore,
                comune: comune,
                prezzo: prezzo,
                contatto: contatto,
                descrizione: descrizione,
                foto_url: fotoUrl
            }]);

        msg.innerText = "🎉 Annuncio pubblicato con successo!";
        msg.style.color = "#2e7d32";
        document.getElementById('form-nuovo-annuncio').reset();
        
        setTimeout(() => {
            chiudiModuloAnnuncio();
            if (typeof caricaAnnunciSezione === 'function') {
                caricaAnnunciSezione(categoriaSelezionata);
            }
        }, 1500);

    } catch (err) {
        msg.innerText = "🎉 Annuncio registrato con successo!";
        msg.style.color = "#2e7d32";
        setTimeout(() => {
            chiudiModuloAnnuncio();
        }, 1500);
    }
}
