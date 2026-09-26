---
name: create-spec
description: >-
  Add or edit behavior specs in eljekua. Use when the user asks to create,
  update, or document game rules in specs/.
---

# Create Spec

Behavior specs live in `specs/`. Do **not** add or edit specs unless the user explicitly asks.

## @structure

- One topic per file: `specs/<topic>.md` (snake_case filename).
- Title matches the topic (`# Damage`).
- Sections group related rules; use bullet lists.
- Be succinct — state rules, not implementation or test plans.

## @workflow

1. Read any existing spec for the topic; merge or replace per the user's request.
2. Write rules in plain language. Keep user-supplied wording verbatim when provided.
3. Verify implementation matches the spec; fix code if it does not.
4. Add or update **use case tests** for each new or changed rule (see `@tests`). Do not add algorithm tests.
5. Run relevant tests / `tsc --noEmit` when runtime code changed.
6. Run `@checklist` from project conventions (`git add` new spec files).

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
