export function formatDistrito(val) {
  if (!val) return '';
  // Elimina todo lo que no sea número
  let clean = val.replace(/\D/g, '');
  if (clean.length > 4) clean = clean.slice(0, 4);
  
  if (clean.length > 2) {
    return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  }
  return clean;
}

export function formatTelefono(val) {
  if (!val) return '';
  // Quitamos el +1 inicial para que el regex no incluya este '1' al limpiar
  let raw = val.startsWith('+1 ') ? val.substring(3) : val;
  // Elimina todo lo que no sea número
  let clean = raw.replace(/\D/g, '');
  if (clean.length === 0) return '';
  
  if (clean.length > 10) {
    clean = clean.slice(0, 10);
  }

  let formatted = '+1 ';
  if (clean.length > 0) {
    formatted += '(' + clean.slice(0, 3);
  }
  if (clean.length >= 4) {
    formatted += ') ' + clean.slice(3, 6);
  }
  if (clean.length >= 7) {
    formatted += '-' + clean.slice(6, 10);
  }
  return formatted;
}
