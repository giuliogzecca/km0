// Apri il modulo di inserimento annuncio
function apriModulo() {
    document.getElementById('finestraModulo').style.display = 'flex';
}

// Chiudi il modulo
function chiudiModulo() {
    document.getElementById('finestraModulo').style.display = 'none';
}

// Quando l'utente clicca "Pubblica Annuncio"
document.getElementById('formAnnuncio').addEventListener('submit', function(evento) {
    evento.preventDefault(); // Evita il ricaricamento della pagina
    
    // Per ora facciamo una prova locale per assicurarci che i dati vengano letti
    const titolo = document.getElementById('titolo').value;
    alert('Perfetto! Il modulo funziona. L\'annuncio "' + titolo + '" è pronto per essere inviato a Supabase.');
    
    chiudiModulo();
    document.getElementById('formAnnuncio').reset();
});
