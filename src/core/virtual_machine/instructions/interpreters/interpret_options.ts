import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {INTERACTION_TYPE} from "core/instruction_loop";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionOptions} from "core/virtual_machine/instructions/instructions";

export const interpret_options = ({
                                      instruction,
                                      player_turn_handler,
                                      evaluate_ast,
                                      game_state
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    const {vm_state} = game_state
    player_turn_handler.set_available_interactions({
        type: INTERACTION_TYPE.OPTION_SELECT,
        available_options: instruction.options.map(({text, condition, instructions}) => ({
                text,
                on_click: () => vm_state.add_instruction_frame({instructions}),
                disabled: condition ? !EXPR.as_boolean(evaluate_ast(condition)) : false
            })
        )
    })
}