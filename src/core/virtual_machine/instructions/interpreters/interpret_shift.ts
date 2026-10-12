import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionMovement} from "core/virtual_machine/instructions/instructions";

export const interpret_shift = ({
                                    instruction,
                                    game_state,
                                    game_events,
                                    game_queries,
                                }: InterpretInstructionProps<InstructionMovement>) => {
    const {vm_state} = game_state
    const creature = game_queries.evaluate_creature(vm_state.get_variable(instruction.target_label))
    const path = game_queries.evaluate_positions(vm_state.get_variable(instruction.destination_label))
    for (const position of path) {
        creature.data.position = position
        game_events.on_creature_moved.raise({creature, position, movement_type: "move"})
    }
}