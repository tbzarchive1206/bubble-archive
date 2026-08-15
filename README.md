# BUBBLE MEDIA ARCHIVE

Samodzielne, statyczne archiwum mediów Bubble THE BOYZ, przygotowane do publikacji jako GitHub Pages. Wygląd i obsługa galerii bazują na repozytorium FROMM MEDIA.

Repozytorium zawiera gotowy indeks 4 233 plików. Nie wykonuje automatycznej synchronizacji z Google Drive, nie wymaga klucza API ani GitHub Secrets.

## Publikacja

1. Utwórz na GitHubie puste repozytorium, np. `bubble-media-archive`.
2. Wgraj do niego całą zawartość tego folderu i wypchnij branch `main`.
3. Wejdź w `Settings → Pages`.
4. W `Build and deployment → Source` wybierz `GitHub Actions`.
5. Workflow `Deploy GitHub Pages` zbuduje i opublikuje stronę automatycznie.

Nie dodawaj sekretu `GOOGLE_DRIVE_API_KEY` — nie jest potrzebny.

## Zawartość

- 11 kafelków członków, w tym `Q`, `Haknyeon (2017–2025)` i `New (2017–2026)`.
- Filtrowanie według typu pliku, roku i miesiąca, gdy prawdziwa data jest dostępna.
- Osobna opcja `DATE UNAVAILABLE` dla plików, których nie da się wiarygodnie datować.
- Wyszukiwanie według nazwy, ścieżki folderu i daty `YYMMDD`/`YYYYMMDD`.
- Zdjęcia z odnośnikami `VIEW` i `DOWNLOAD`.
- Filmy i voice messages odtwarzane w playerze bez opuszczania strony.
- Kevin jako czytelnie oznaczone archiwum zewnętrzne.

## Dane statyczne

Finalny indeks znajduje się w `app/data/archive.json`. Daty są wykorzystywane tylko wtedy, gdy wynikają z nazw folderów lub plików. Trzynastocyfrowe znaczniki eksportu nie są interpretowane jako daty wiadomości.

## Uruchomienie lokalne

```bash
pnpm install
pnpm run dev
```

Test i kompilacja:

```bash
pnpm run test
```
