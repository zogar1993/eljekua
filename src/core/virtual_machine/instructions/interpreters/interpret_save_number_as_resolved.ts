import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {resolve_number} from "core/virtual_machine/expressions/number_utils";
import type {InstructionSaveResolvedNumber} from "core/virtual_machine/instructions/instructions";

export const interpret_save_number_as_resolved = ({
                                                      instruction,
                                                      game_state,
                                                      game_queries
                                                  }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const {vm_state} = game_state
    const value = resolve_number(EXPR.as_number_expr(game_queries.evaluate(instruction.value)))
    vm_state.set_variable(instruction.label, value)
}