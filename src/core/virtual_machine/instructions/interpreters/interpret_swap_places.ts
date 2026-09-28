import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionSwapPlaces} from "core/virtual_machine/instructions/instructions";

export const interpret_swap_places = ({
                                           instruction,
                                           game_state,
                                           game_events,
                                       }: InterpretInstructionProps<InstructionSwapPlaces>) => {
    const {vm_state} = game_state
    const creature_a = EXPR.as_creature(vm_state.get_variable(instruction.creature_a))
    const creature_b = EXPR.as_creature(vm_state.get_variable(instruction.creature_b))
    const position_a = creature_a.data.position
    const position_b = creature_b.data.position

    creature_a.data.position = position_b
    creature_b.data.position = position_a

    game_events.on_creature_moved.raise({creature: creature_a, position: position_b, movement_type: "move"})
    game_events.on_creature_moved.raise({creature: creature_b, position: position_a, movement_type: "move"})
}
