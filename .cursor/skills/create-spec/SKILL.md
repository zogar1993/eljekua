---
name: create-spec
description: >-
  Add or edit behavior specs in eljekua. Use when the user asks to create,
  update, or document game rules in specs/. Covers thoroughness, edge cases,
  errors, and avoiding redundancy. Always implement the behavior in the same
  pass — never stop at the markdown file. Do not add tests unless the user
  explicitly asks.
---

# Create Spec

Behavior specs live in `specs/`. Do **not** add or edit specs unless the user explicitly asks.

## @mandatory

**Creating or editing a spec is never spec-only.** Complete the full workflow in one pass:

1. Write or update the spec in `specs/`.
2. Implement the behavior in `core/` (and `web/` when presentation is involved).
3. Run `tsc --noEmit` (and existing tests if you touched runtime code).

Do **not** stop after writing the markdown file. Do **not** tell the user the task is done until implementation matches the spec.

Do **not** add tests unless the user explicitly asks.

## @structure

- One topic per file: `specs/<topic>.md` (snake_case filename).
- Title matches the topic (`# Damage`).
- Sections group related rules; use bullet lists.
- State **rules**, not implementation, test plans, or file paths.

For expression functions, use a consistent block: **Parameters**, **Result**, then edge or error bullets unique to that function.

## @thoroughness

Each spec must cover every category the behavior can reach:

| Category | What to document |
|----------|------------------|
| Normal behavior | Primary outcome under valid inputs |
| Edge cases | Empty inputs, zero counts, null/absent data, isolation, boundaries |
| Errors | Invalid arguments, wrong counts, type mismatches, unbound state |

Skip a category only when the behavior cannot reach that case.

### Shared rules

State cross-cutting rules **once** in a dedicated section (e.g. `## Evaluation errors`) instead of repeating them on every function or keyword.

### Expression specs

- Document parse-time vs evaluation-time failures only when the distinction matters for callers.
- Prefer referencing another rule over restating it (e.g. `$are_enemies` defined via `$is_ally`).

## @no-redundancy

- Each rule appears once in the spec file.
- Cross-reference instead of duplicating (another function, keyword, or shared errors section).
- Do not state obvious meta-rules (e.g. "functions compose").
- Do not repeat rules that belong in another spec file — link by topic name when needed.
- Omit implementation detail the code already encodes unless it is a player-visible rule.

## @readability

- Plain language; bullets over paragraphs.
- Tables for keyword or enum-like lists.
- Examples only when they disambiguate a non-obvious rule (see `specs/damage.md`).
- Keep user-supplied wording verbatim when provided.

## @workflow

1. Read the implementation and any existing spec for the topic.
2. List normal behavior, edges, and errors; check other spec files for overlap.
3. Write rules — shared errors first, then per-feature bullets for what is unique.
4. Implement so behavior matches the spec.
5. Run `tsc --noEmit` when runtime code changed.
6. Run `@checklist` (`git add` new spec and source files).

## @tests

Do **not** add or update tests unless the user explicitly asks.

When the user does ask for tests with a spec change, follow `create-test`.

## @reference

- Example specs: `specs/damage.md`, `specs/expressions.md`
- Example use case tests: `src/tests/use_cases/damage_modifiers.spec.ts`, `src/tests/use_cases/opportunity_attacks.spec.ts`
