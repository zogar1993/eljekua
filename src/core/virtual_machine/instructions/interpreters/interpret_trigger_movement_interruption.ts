import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionTriggerMovementInterruption} from "core/virtual_machine/instructions/instructions";
import {
    TRIGGER_INTERCEPTION,
    TRIGGER_TIMING,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {offer_trigger_reactions} from "core/virtual_machine/instructions/trigger_reactions";

export const interpret_trigger_movement_interruption = ({
                                                            instruction,
                                                            game_state,
                                                            game_queries,
                                                        }: InterpretInstructionProps<InstructionTriggerMovementInterruption>) => {
    const moving_creature = game_queries.evaluate_creature(game_state.vm_state.get_variable(instruction.target_label))
    game_state.vm_state.set_variable(SYSTEM_KEYWORD.TRIGGER_ACTIVATOR, {type: "creatures", value: [moving_creature]})

    offer_trigger_reactions({
        game_state,
        game_queries,
        activator: moving_creature,
        intercept: TRIGGER_INTERCEPTION.MOVEMENT,
        timing: TRIGGER_TIMING.INTERRUPTION,
    })
}
