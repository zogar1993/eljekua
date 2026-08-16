---
name: create-instruction
description: >-
  Add a new VM instruction to eljekua. Use when creating or implementing a new
  instruction type, interpreter, or wiring instruction execution in the turn loop.
---

# Create Instruction

Instructions are the turn-state VM opcodes. Each type has a definition, an interpreter, and a switch case in `interpret_instruction`.

## Checklist

1. **`src/core/expressions/parser/instructions.ts`**
   - Add `INSTRUCTION_TYPE.<NAME>`
   - Add `Instruction<Name>` type
   - Add to the `Instruction` union

2. **`src/core/battlegrid/player_turn_handler/instruction_interpreters/interpret_<name>.ts`**
   - Export `interpret_<name>(props: InterpretInstructionProps<Instruction<Name>>)`
   - Use `turn_state`, `player_turn_handler`, `evaluate_ast`, etc. as needed

3. **`src/core/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction.ts`**
   - Import interpreter
   - Add `case INSTRUCTION_TYPE.<NAME>`

4. **Only if power-authored** (skip for runtime-only instructions):
   - `src/core/types.ts` — `IRInstruction` union
   - `src/power_editor/` — editor + serializer

## Player input from interpreters

When an interpreter needs player input, call `player_turn_handler.set_available_interactions(...)` and return. The instruction loop resumes after the player resolves the interaction.

Each distinct selection UX must be its **own `Interaction` type** in `instruction_loop.ts` — do not add optional fields to `position_select` (or any existing type) for edge cases. Follow the `select_path` / `select_area` pattern:

1. Add `InteractionsSelect<Name>` with a unique `type` string.
2. Add it to the `Interaction` union and `add_cleanup_to_interaction_confirmation`.
3. Emit it from the interpreter with the callbacks the UI needs (e.g. `get_path_to_destination`, `get_area_for_position`).
4. Handle the new `type` in the web UI and in `tests/utils/interaction_test_helpers.ts`.

See `interpret_select_target.ts` for branching by targeting type.

## Runtime-only vs power-authored

- **Runtime-only** (e.g. `ADD_CURRENT_TURN_BASE_OPTIONS`): steps 1–3 only. Used by the turn loop, not defined in power data.
- **Power-authored**: also update IR types and power editor so powers can emit the instruction.

## Reference

See `interpret_add_current_turn_base_options.ts` for a minimal runtime-only interpreter that mutates `turn_state`.

## Conventions

- Match existing interpreter naming: `interpret_<snake_case>`
- Instruction string values: `snake_case`
- Keep interpreters focused; push reusable logic elsewhere if it grows
