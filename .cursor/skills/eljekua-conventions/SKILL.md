---
name: eljekua-conventions
description: >-
  Eljekua project conventions. Apply when writing, editing, or reviewing code in
  this repo — naming, formatting, file layout, imports, architecture, and git workflow.
---

# Eljekua Conventions

Match surrounding files when adding to an existing module.

## @naming-constants

- **SCREAMING_SNAKE_CASE** for exported constant objects and scalar constants.
- Keys inside const objects: **SCREAMING_SNAKE_CASE**.
- String values stored in constants: **snake_case**.

```typescript
export const INSTRUCTION_TYPE = {
    ATTACK_DICE_ROLL: "attack_dice_roll",
    END_TURN: "end_turn",
} as const
```

## @naming-types

- **PascalCase** for types, interfaces, and classes.
- Derive union types from const objects: `typeof FOO[keyof typeof FOO]`.
- VM instruction types: prefix with `Instruction` (e.g. `InstructionApplyDamage`).
- Factory return types: `export type Foo = ReturnType<typeof create_foo>`.
- Discriminated unions use a `type` field tied to a constant.

## @naming-values

- **snake_case** for functions, variables, parameters, object properties, and local bindings.

| Role | Pattern | Example |
|------|---------|---------|
| Factory | `create_<name>` | `create_battle_grid` |
| VM interpreter | `interpret_<name>` | `interpret_move` |
| Expression evaluator | `evaluate_<name>` | `evaluate_ast` |
| Assertion | `assert_is_<condition>` | `assert_is_not_null` |
| Query / getter | `get_<name>` | `get_valid_targets` |

## @naming-files

- **snake_case** for implementation modules: `interpret_move.ts`, `instruction_loop.ts`.
- **PascalCase** when the file primarily exports a type or class: `Creature.ts`, `TurnState.ts`.
- Place new files alongside peers; follow that directory's pattern.

## @imports

- Absolute imports from `src` root (`core/...`, `stdlib/...`, `web/...`). No `../` paths.
- Use `import type { ... }` for type-only imports.

## @formatting

- **4-space** indentation, **double quotes**, `Array<T>` (not `T[]`), `as const` on const objects.
- Prefer `export const fn = (...) => { ... }` over `export function` unless asserting.
- Destructure parameters in the signature.
- Keep diffs minimal; do not reformat unrelated code.

## @architecture

- Prefer **factory functions** (`create_*`) over classes. No TypeScript `enum`.
- VM instructions: type in `core/virtual_machine/instructions/instructions.ts`, interpreter in `interpret_<name>.ts`, wire in `interpret_instruction.ts`.
- Comments only for non-obvious logic. Reuse existing helpers before adding abstractions.

## @core-web

- `core/` is headless-playable; `web/` renders and forwards input.
- Core never imports `web/`. Web reads core state; mutations only via core APIs (use cases, interaction callbacks).
- Core → web only via `GameEvents` and `creature.events`.

## @player-interactions

Defined in `core/instruction_loop.ts`. One selection UX = one `Interaction` type — never optional fields on existing types.

| `type` | Use | Web module |
|--------|-----|------------|
| `position_select` | Point target | `BattleGridUI` |
| `select_path` | Movement preview | `BattleGridUI` |
| `select_area` | Area burst preview | `BattleGridUI` |
| `option_select` | Action buttons | `CreatureOptionButtons` |
| `hit_status_select` | Hit/miss/crit | `HitStatusButtonsUI` |

New interaction: (1) type + union in `instruction_loop.ts`, (2) cleanup in `add_cleanup_to_interaction_confirmation`, (3) emit from interpreter, (4) handle in web, (5) update `tests/utils/interaction_test_helpers.ts`. Reference: `interpret_select_target.ts`.

## @git

- Stage new files with `git add`.
- Never commit or push unless the user explicitly asks.
- No destructive git commands unless explicitly requested.

## @checklist

- [ ] Naming: SCREAMING_SNAKE constants, PascalCase types, snake_case values
- [ ] Imports: `core/` / `stdlib/` paths, `import type` where appropriate
- [ ] `Array<T>`, `as const`, layout matches neighbors
- [ ] New files staged; no commits or pushes
