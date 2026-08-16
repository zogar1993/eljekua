---
name: eljekua-conventions
description: >-
  Eljekua project conventions. Apply when writing, editing, or reviewing code in
  this repo — naming, formatting, file layout, imports, and git workflow.
---

# Eljekua Conventions

Follow these directives for all code in this project. Match surrounding files when adding to an existing module.

## @naming-constants

- **SCREAMING_SNAKE_CASE** for exported constant objects and scalar constants.
- Keys inside const objects: **SCREAMING_SNAKE_CASE**.
- String values stored in constants: **snake_case**.

```typescript
export const INSTRUCTION_TYPE = {
    ATTACK_DICE_ROLL: "attack_dice_roll",
    END_TURN: "end_turn",
} as const

export const HIT_STATUS = {
    MISS: 0,
    HIT: 1,
    CRIT: 2,
} as const
```

## @naming-types

- **PascalCase** for types, interfaces, and classes.
- Derive union types from const objects: `typeof FOO[keyof typeof FOO]`.
- VM instruction types: prefix with `Instruction` (e.g. `InstructionApplyDamage`).
- Factory return types: `export type Foo = ReturnType<typeof create_foo>`.
- Discriminated unions use a `type` field tied to a constant (e.g. `type: typeof INSTRUCTION_TYPE.MOVE`).

```typescript
export type ActionType = typeof ACTION_TYPE[keyof typeof ACTION_TYPE]

export type InstructionLoop = ReturnType<typeof create_instruction_loop>
```

## @naming-values

- **snake_case** for functions, variables, parameters, object properties, and local bindings.
- Do not use camelCase for identifiers.

| Role | Pattern | Example |
|------|---------|---------|
| Factory | `create_<name>` | `create_battle_grid` |
| VM interpreter | `interpret_<name>` | `interpret_move` |
| Expression evaluator | `evaluate_<name>` | `evaluate_ast` |
| Assertion | `assert_is_<condition>` | `assert_is_not_null` |
| Query / getter | `get_<name>` | `get_valid_targets` |

## @naming-files

- **snake_case** for implementation modules: `interpret_move.ts`, `instruction_loop.ts`.
- **PascalCase** when the file primarily exports a type or class: `Creature.ts`, `TurnState.ts`, `AstNode.ts`.
- Place new files alongside peers in the same directory; follow that directory's existing pattern.

## @imports

- Use absolute imports from `src` root (`core/...`, `stdlib/...`, `web/...`). Avoid `../` relative paths.
- Use `import type { ... }` for type-only imports.

```typescript
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
```

## @formatting

- **4-space** indentation.
- **Double quotes** for strings.
- Use `Array<T>`, not `T[]`.
- End const object definitions with `as const`.
- Prefer `export const fn = (...) => { ... }` over `export function` unless asserting (e.g. `asserts` predicates).
- Destructure parameters in the signature; align multi-line destructuring with the opening brace when the list is long.
- Keep diffs minimal; do not reformat unrelated code.

## @architecture

- Prefer **factory functions** (`create_*`) over classes. Classes are rare (`Creature`, `Scanner`).
- No TypeScript `enum` — use `as const` objects instead.
- VM instructions: add type in `instructions.ts`, interpreter as `interpret_<name>.ts`, wire in `interpret_instruction.ts`.
- Comments only for non-obvious business logic; code should be self-explanatory.
- Reuse existing helpers and patterns in the module before introducing new abstractions.

## @git

- After creating new files, stage them with `git add`.
- **Never commit** unless the user explicitly asks.
- **Never push** unless the user explicitly asks.
- Do not run destructive git commands (`reset --hard`, `push --force`, etc.) unless explicitly requested.

## @checklist

Before finishing a change:

- [ ] Constants are SCREAMING_SNAKE_CASE; their string values are snake_case
- [ ] Types are PascalCase; variables/functions/properties are snake_case
- [ ] Imports use `core/` / `stdlib/` paths and `import type` where appropriate
- [ ] `Array<T>` and `as const` used consistently
- [ ] New code matches the naming and layout of neighboring files
- [ ] New files are staged with `git add`; no commits or pushes made
