import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionWalkStep} from "core/virtual_machine/instructions/instructions";

export const interpret_walk_step = ({
                                        instruction,
                                        game_state,
                                        game_events,
                                        game_queries,
                                    }: InterpretInstructionProps<InstructionWalkStep>) => {
    const {vm_state} = game_state
    const creature = game_queries.evaluate_creature(vm_state.get_variable(instruction.target_label))
    const path = game_queries.evaluate_positions(vm_state.get_variable(instruction.destination_label))
    const index = game_queries.evaluate_number(vm_state.get_variable(instruction.index_label))

    if (index >= path.length) return

    const new_position = path[index]
    creature.data.position = new_position
    game_events.on_creature_moved.raise({creature, position: new_position, movement_type: "move"})
}
