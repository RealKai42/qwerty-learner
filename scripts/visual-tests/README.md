# Visual test scripts

Headless-browser probes used to verify UI fixes (responsive layout, headlessui v2 dropdowns, pagination).
Run dev server first (`bun run dev`), then:

```sh
node scripts/visual-tests/favorites-pagination.mjs   # seeds favorites, screenshots pagination dropdown
node scripts/visual-tests/chapter-dropdown.mjs       # opens chapter Listbox, screenshots
node scripts/visual-tests/analysis-page.mjs          # /analysis empty state
```

Screenshots land in /tmp. Requires chromium at ~/.cache/ms-playwright/chromium_headless_shell-1228 (path baked into scripts).
