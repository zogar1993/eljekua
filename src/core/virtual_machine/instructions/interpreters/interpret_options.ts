import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionOptions} from "core/virtual_machine/instructions/instructions";

export const interpret_options = ({
                                      instruction,
                                      game_queries,
                                      game_state
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    const {vm_state, available_interaction} = game_state
    available_interaction.set_available_interactions({
        type: INTERACTION_TYPE.OPTION_SELECT,
        available_options: instruction.options.map(({text, condition, instructions}) => ({
                text,
                on_click: () => vm_state.add_child_instruction_frame({instructions}),
                disabled: condition ? !EXPR.as_boolean(game_queries.evaluate(condition)) : false
            })
        )
    })
}