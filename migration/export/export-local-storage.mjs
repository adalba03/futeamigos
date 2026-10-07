// Execute in the browser console while the app is open, then save the printed JSON as app-data.json.
const keys = Object.keys(localStorage).filter((key) => key.startsWith("fmr-"));
const data = Object.fromEntries(keys.map((key) => {
  try { return [key, JSON.parse(localStorage.getItem(key) ?? "null")]; }
  catch { return [key, localStorage.getItem(key)]; }
}));
console.log(JSON.stringify({ exportedAt: new Date().toISOString(), source: "Fut - Amigos do FMR localStorage", data }, null, 2));
