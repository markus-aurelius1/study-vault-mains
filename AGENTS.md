# Mains Study Vault

This repository implements the architecture defined in `docs/`.

Read, as relevant to the task:
- `docs/PRODUCT_SPEC.md`
- `docs/CONTENT_SCHEMA.md`
- `docs/IMPLEMENTATION_ARCHITECTURE.md`
- `docs/DECISIONS.md`

`docs/DECISIONS.md` contains frozen product constraints. Do not casually redesign them.

Reference repositories are read-only architectural references:
- https://github.com/markus-aurelius1/study-vault-prelims
- https://github.com/markus-aurelius1/pyq-engine

Do not:
- modify either reference repository;
- add AI/LLM features;
- add authentication, databases or cloud sync;
- expose Economics Optional (`ECO1`, `ECO2`);
- hand-edit generated `content/`;
- duplicate canonical PYQ content from PYQ Engine;
- treat passive reading/scrolling as mastery;
- add XP/ranks/streaks/gamification.

For substantial changes, validate with the repository's required content build, tests, typecheck and production build before considering the task complete.
