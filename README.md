# Stolice Europy

Statyczna strona z krótkimi notatkami turystycznymi o 46 stolicach Europy. Każdy kafelek ma kolory flagi i godło państwa.

## Jak to działa

- `build.js` czyta notatki z `../Stolice_Europy/*.md` i generuje stronę do folderu `public/`.
- `godla.js` zawiera listę godeł (pliki z Wikimedia Commons), a `pobierz_godla.js` pobiera je do `godla/`.
- `server.js` to prosty serwer lokalny: `node server.js 8080`.

## Aktualizacja strony

```
node build.js
git add -A
git commit -m "Aktualizacja strony"
git push
```

Netlify publikuje folder `public/` automatycznie po każdym pushu (konfiguracja w `netlify.toml`).

Godła: Wikimedia Commons.
