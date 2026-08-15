import {
    InterpretInstructionProps
} from "core/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {INSTRUCTION_TYPE, InstructionAddCurrentTurnBaseOptions} from "core/expressions/parser/instructions";
import {AST} from "core/expressions/parser/AST_NODE";

export const interpret_add_current_turn_base_options = ({
                                                            initiative_order,
                                                            turn_state,
                                                        }: InterpretInstructionProps<InstructionAddCurrentTurnBaseOptions>) => {
    turn_state.add_instructions([{type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS}])
    const owner = initiative_order.get_current_creature()
    turn_state.add_instruction_frame({name: "Power Options", instructions: [CURRENT_TURN_BASE_OPTIONS], owner})
}

const CURRENT_TURN_BASE_OPTIONS = {
    type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
    creature: AST.OWNER,
    cost: "normal",
    filter: "turn",
} as const