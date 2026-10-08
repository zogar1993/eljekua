import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionWalkStep} from "core/virtual_machine/instructions/instructions";

export const interpret_walk_step = ({
                                        instruction,
                                        game_state,
                                        game_events,
                                    }: InterpretInstructionProps<InstructionWalkStep>) => {
    const {vm_state} = game_state
    const creature = EXPR.as_creature(vm_state.get_variable(instruction.target))
    const path = EXPR.as_positions(vm_state.get_variable(instruction.destination))
    const index = EXPR.as_number(vm_state.get_variable(instruction.index))

    if (index >= path.length) return

    const new_position = path[index]
    creature.data.position = new_position
    game_events.on_creature_moved.raise({creature, position: new_position, movement_type: "move"})
}
