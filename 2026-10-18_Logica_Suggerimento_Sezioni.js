// Apri il modulo
function apriModulo() {
    document.getElementById('finestraModulo').style.display = 'flex';
}

// Chiudi il modulo
function chiudiModulo() {
    document.getElementById('finestraModulo').style.display = 'none';
}

// L'Assistente di Vendita: suggerisce la sezione in base a cosa scrive l'utente
function suggerisciSezione() {
    const testoInput = document.getElementById('titolo').value.toLowerCase();
    const menuSezioni = document.getElementById('sezione');
    const boxSuggerimento = document.getElementById('testoSuggerimento');

    let sezioneConsigliata = "";
    let nomeSezioneVisibile = "";

    // Regole dell'assistente automatico
    if (testoInput.includes("pomodor") || testoInput.includes("mela") || testoInput.includes("insalata") || testoInput.includes("zucchina") || testoInput.includes("frutta")) {
        sezioneConsigliata = "orto";
        nomeSezioneVisibile = "Orto e Frutta";
    } else if (testoInput.includes("miele") || testoInput.includes("marmellata") || testoInput.includes("conserva") || testoInput.includes("sciroppo")) {
        sezioneConsigliata = "miele";
        nomeSezioneVisibile = "Miele e Conserve";
    } else if (testoInput.includes("legna") || testoInput.includes("pellet") || testoInput.includes("tronco") || testoInput.includes("stufa")) {
        sezioneConsigliata = "legna";
        nomeSezioneVisibile = "Legna e Pellets";
    }

    // Se l'assistente riconosce la parola, consiglia la sezione
    if (sezioneConsigliata !== "") {
        menuSezioni.value = sezioneConsigliata;
        boxSuggerimento.innerText = "💡 Sezione consigliata in base al tuo prodotto: " + nomeSezioneVisibile;
        boxSuggerimento.style.display = "block";
    } else {
        boxSuggerimento.style.display = "none";
    }
}

// Invio del modulo
document.getElementById('formAnnuncio').addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    const titolo = document.getElementById('titolo').value;
    const sezione = document.getElementById('sezione').options[document.getElementById('sezione').selectedIndex].text;
    
    alert('Ottimo! L\'annuncio "' + titolo + '" verrà salvato nella sezione: ' + sezione);
    
    chiudiModulo();
    document.getElementById('formAnnuncio').reset();
    document.getElementById('testoSuggerimento').style.display = "none";
});
