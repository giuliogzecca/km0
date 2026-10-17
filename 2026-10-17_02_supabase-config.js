// --- LE CHIAVI DEL MAGAZZINO SUPABASE ---
// Questo file permette al nostro sito di comunicare in sicurezza con il magazzino dati.

const SUPABASE_URL = "https://gqqednmpvbamvnuamezs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_M7QRvHQvUSQSYKqtN-MsdQ_18trka8d";

// Attiviamo il ponte di collegamento
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Ponte con il magazzino dati collegato con successo!");
