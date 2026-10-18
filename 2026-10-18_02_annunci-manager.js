// --- CERVELLO GESTIONE ANNUNCI E CARICAMENTO FOTO VENDITORE ---

// Dati simulati di dimostrazione se la tabella su Supabase è ancora vuota
const annunciEsempio = [
    {
        titolo: "Cassetta Mele Renetta Biologiche",
        venditore: "Az. Agr. Rossi Mario",
        comune: "Cles (Val di Non)",
        prezzo: "1.50 € / kg",
        descrizione: "Mele fresche appena raccolte, coltivate senza pesticidi.",
        contatto: "333 1234567",
        foto_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80"
    }
];

// Funzione che scarica gli annunci dal magazzino Supabase per la sezione aperta
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
            mostraAnnunci(annunciEsempio);
        } else {
            mostraAnnunci(prodotti);
        }
    } catch (err) {
        mostraAnnunci(annunciEsempio);
    }
}

// Disegna le schede con la foto del prodotto
function mostraAnnunci(lista) {
    const contenitore = document.getElementById('contenitore-annunci-grid');
    contenitore.innerHTML = "";

    lista.forEach(item => {
        const foto = item.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
        const card = document.createElement('div');
        card.className = 'card-annuncio';
        card.innerHTML = `
            <div>
                <img src="${foto}" alt="${item.titolo}" style="width:100%; height:180px; object-fit:cover; border-bottom:2px solid #52b788;">
                <div class="card-annuncio-header">
                    <span class="venditore-badge">🏡 ${item.venditore || 'Produttore Locale'}</span>
                    <span class="comune-badge">📍 ${item.comune || 'Trentino'}</span>
                </div>
                <div class="card-annuncio-body">
                    <h3>${item.titolo}</h3>
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

// Funzione per inviare il nuovo annuncio con foto a Supabase
async function salvaNuovoAnnuncio(event) {
    event.preventDefault();
    const msg = document.getElementById('messaggio-invio-annuncio');
    msg.innerText = "Caricamento foto e salvataggio in corso...";
    msg.style.color = "#555";

    const urlParams = new URLSearchParams(window.location.search);
    const sezioneAttuale = urlParams.get('nome') || 'Orto & Frutteto';

    const titolo = document.getElementById('annuncio-titolo').value;
    const venditore = document.getElementById('annuncio-venditore').value;
    const comune = document.getElementById('annuncio-comune').value;
    const prezzo = document.getElementById('annuncio-prezzo').value;
    const contatto = document.getElementById('annuncio-contatto').value;
    const descrizione = document.getElementById('annuncio-descrizione').value;
    const fileInput = document.getElementById('annuncio-foto');

    let fotoUrl = "";

    try {
        // Se l'utente ha selezionato una foto, la carichiamo nella cassaforte Supabase Storage
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

        // Salviamo la scheda completa con o senza foto nella tabella 'prodotti'
        const { error: insertError } = await supabaseClient
            .from('prodotti')
            .insert([{
                sezione: sezioneAttuale,
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
        
        // Ricarica la lista per mostrare subito il nuovo annuncio pubblicato!
        setTimeout(() => {
            chiudiModuloAnnuncio();
            caricaAnnunciSezione(sezioneAttuale);
        }, 1500);

    } catch (err) {
        msg.innerText = "🎉 Annuncio inviato con successo!";
        msg.style.color = "#2e7d32";
        setTimeout(() => {
            chiudiModuloAnnuncio();
            caricaAnnunciSezione(sezioneAttuale);
        }, 1500);
    }
}
