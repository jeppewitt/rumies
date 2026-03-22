Gennemfør et polish-pass på alle 7 Rumies HTML-sider. Arbejd systematisk side for side.

For hver side, tjek og ret følgende:

## CSS-tokens
- Alle sider definerer de samme CSS-variabler i `:root`: `--bg`, `--card`, `--primary`, `--primary-hover`, `--primary-soft`, `--accent`, `--accent-soft`, `--ink`, `--ink2`, `--ink3`, `--border`, `--gold`, `--gold-soft`, `--shadow-sm`, `--shadow-md`
- Ingen side bruger `var(--x)` for en variabel der ikke er defineret i dens `:root`

## Navigation
- Top `<nav>`: viser kun logo på mobil (ingen `position: sticky` på mobil), sticky på desktop (≥768px)
- `.nav-links { display: none }` på mobil, `display: flex` i `@media (min-width: 768px)`
- `.bottomnav`: `display: flex` på mobil, `display: none` på desktop
- Aktiv `.bn-item` matcher siden man er på
- "Hjem"-link peger på `rumies-landing.html`

## Mobile-first CSS
- Ingen `@media (max-width: ...)` breakpoints — kun `@media (min-width: 768px)`
- `body` har `padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px))` på mobil
- Grids starter som single-column og udvider på desktop

## Touch targets
- Knapper og interaktive elementer har min. `44px` højde på mobil

## Typografi
- Fraunces bruges til overskrifter, Manrope til brødtekst
- Ingen hardcodede farver — kun CSS-variabler

## Afslutning
Præsenter en kort liste over hvad der blev rettet pr. side, eller "ok" hvis ingen rettelser var nødvendige.
