# Mains Study Vault

A local-first UPSC Mains answer-generation, active-recall, revision and PYQ-practice system for GS I–IV, Essay and Sociology Optional I–II.

## Run locally

```text
npm install
npm run content
npm run dev
```

The ordinary content and production builds are offline. The committed PYQ bridge is refreshed only through the explicit sync command:

```text
npm run sync:pyq -- --from <local-file-or-url>
```

## Validation

```text
npm run content
npm run typecheck
npm test
npm run build
```

Human-authored academic material belongs under `content-src/`. The `content/` and `public/data/` outputs are generated and must not be hand-edited. Personal study state stays in browser localStorage under `mains.state.v1` and can be exported or imported from Settings.

See `docs/` for the frozen product, schema and implementation contracts.
