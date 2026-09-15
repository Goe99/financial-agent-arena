# Domain Docs

Before exploring code for a task:

- Read the root `CONTEXT.md`.
- Read ADRs in `docs/adr/` that touch the area being changed.
- Use the glossary's canonical vocabulary in issue titles, proposals, tests and code-facing explanations.
- If a needed concept is missing, sharpen the term and update `CONTEXT.md` before building on it.
- If a change contradicts an ADR, surface the conflict explicitly instead of silently overriding it.

This repository uses the single-context layout:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

