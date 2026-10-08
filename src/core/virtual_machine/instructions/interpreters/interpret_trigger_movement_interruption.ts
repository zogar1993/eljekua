import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionTriggerMovementInterruption} from "core/virtual_machine/instructions/instructions";
import {
    TRIGGER_INTERCEPTION,
    TRIGGER_TIMING,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {
    offer_trigger_reactions,
    TRIGGER_VARIABLE,
} from "core/virtual_machine/instructions/trigger_reactions";

const MOVEMENT_STEP_INSTRUCTIONS_TO_SKIP = 2

export const interpret_trigger_movement_interruption = ({
                                                            instruction,
                                                            game_state,
                                                            game_queries,
                                                        }: InterpretInstructionProps<InstructionTriggerMovementInterruption>) => {
    const moving_creature = EXPR.as_creature(game_state.vm_state.get_variable(instruction.target))
    game_state.vm_state.set_variable(
        TRIGGER_VARIABLE.ACTIVATOR,
        {type: "creatures", value: [moving_creature]},
    )

    offer_trigger_reactions({
        game_state,
        game_queries,
        activator: moving_creature,
        intercept: TRIGGER_INTERCEPTION.MOVEMENT,
        timing: TRIGGER_TIMING.INTERRUPTION,
        //TODO I dont like passing this function
        before_offering_triggers: () => {
            game_state.vm_state.jump(MOVEMENT_STEP_INSTRUCTIONS_TO_SKIP)
        },
    })
}
