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
4. Add or update tests for each new or changed rule. Follow existing test patterns in `src/tests/`.
5. Run relevant tests / `tsc --noEmit` when runtime code changed.
6. Run `@checklist` from project conventions (`git add` new spec files).

## @reference

- Example: `specs/damage.md`
- Damage tests: `src/tests/damage/damage_modifiers.spec.ts`, `src/tests/mob_attack/mob_attack.spec.ts`
