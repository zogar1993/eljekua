import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionAddCurrentTurnBaseOptions} from "core/virtual_machine/instructions/instructions";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {AST, SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {Expr} from "core/virtual_machine/expressions/types";

export const interpret_add_current_turn_base_options = ({
                                                            game_state,
                                                        }: InterpretInstructionProps<InstructionAddCurrentTurnBaseOptions>) => {
    const {initiative_order, vm_state} = game_state
    const owner = initiative_order.get_current_creature()

    const variables: Record<string, Expr> = {[SYSTEM_KEYWORD.OWNER]: {type: "creatures", value: [owner]}}
    vm_state.add_scoped_instruction_frame({instructions: [CURRENT_TURN_BASE_OPTIONS], variables})
}

const CURRENT_TURN_BASE_OPTIONS = {
    type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
    creature: AST.OWNER,
    cost: "normal",
    filter: "turn",
} as const