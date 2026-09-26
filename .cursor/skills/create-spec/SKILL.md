---
name: create-spec
description: >-
  Add or edit behavior specs in eljekua. Use when the user asks to create,
  update, or document game rules in specs/. Always implement the behavior
  and add use case tests in the same pass — never stop at the markdown file.
---

# Create Spec

Behavior specs live in `specs/`. Do **not** add or edit specs unless the user explicitly asks.

## @mandatory

**Creating or editing a spec is never spec-only.** Complete the full workflow in one pass:

1. Write or update the spec in `specs/`.
2. Implement the behavior in `core/` (and `web/` when presentation is involved).
3. Add or update **use case tests** that prove each rule.
4. Run relevant tests and `tsc --noEmit`.

Do **not** stop after writing the markdown file. Do **not** tell the user the task is done until implementation and tests are in place.

## @structure

- One topic per file: `specs/<topic>.md` (snake_case filename).
- Title matches the topic (`# Damage`).
- Sections group related rules; use bullet lists.
- Be succinct — state rules, not implementation or test plans.

## @workflow

1. Read any existing spec for the topic; merge or replace per the user's request.
2. Write rules in plain language. Keep user-supplied wording verbatim when provided.
3. Implement the behavior so it matches the spec.
4. Add or update **use case tests** for each new or changed rule (see `@tests`). Do not add algorithm tests.
5. Run relevant tests / `tsc --noEmit` when runtime code changed.
6. Run `@checklist` from project conventions (`git add` new spec and source files).

## @tests

Two test kinds live under `src/tests/`. Only **use case tests** belong in this workflow.

| Kind | Location | Purpose |
|------|----------|---------|
| Use case | `src/tests/use_cases/` | Observable game behavior through the full loop (`create_test_game`, given/when/then). |
| Algorithm | `src/tests/algorithms/` | Isolated computation: one `core/` function, explicit inputs → outputs. |

When a spec changes, add or update use case tests only. Algorithm tests are written separately when implementing or refining a computation — not as a response to spec edits.

Follow existing use case patterns: `create_test_game`, `create_creature_test_helpers`, `given_a_creature_is_created` / `when_creature` / `then_creature`.

## @reference

- Example spec: `specs/damage.md`
- Example use case tests: `src/tests/use_cases/damage_modifiers.spec.ts`, `src/tests/use_cases/opportunity_attacks.spec.ts`
- Example algorithm tests (not created by this skill): `src/tests/algorithms/flanking.spec.ts`
