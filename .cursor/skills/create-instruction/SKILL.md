---
name: create-instruction
description: >-
  Add a new VM instruction to eljekua. Use when creating or implementing a new
  instruction type, interpreter, or wiring instruction execution in the turn loop.
---

# Create Instruction

Read `eljekua-conventions` before starting.

Instructions are turn-state VM opcodes: definition, interpreter, switch case.

## @checklist

1. `core/virtual_machine/instructions/instructions.ts` — `INSTRUCTION_TYPE.<NAME>`, `Instruction<Name>`, add to union
2. `core/virtual_machine/instructions/interpret_<name>.ts` — `interpret_<name>(props: InterpretInstructionProps<Instruction<Name>>)`
3. `core/virtual_machine/instructions/interpret_instruction.ts` — import + `case`
4. **Power-authored only:** `core/types.ts` IR union + `power_editor/`

**Runtime-only** (e.g. `ADD_CURRENT_TURN_BASE_OPTIONS`): steps 1–3 only.

**Player input:** call `player_turn_handler.set_available_interactions(...)` and return. See `eljekua-conventions` `@player-interactions`.

## @reference

- Minimal runtime-only: `interpret_add_current_turn_base_options.ts`
- Targeting + interactions: `interpret_select_target.ts`
