import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {INSTRUCTION_TYPE, InstructionMovement} from "core/virtual_machine/instructions/instructions";
import {get_potential_triggers, create_trigger_frame} from "core/virtual_machine/instructions/trigger_reactions";

export const interpret_move = ({
                                   instruction,
                                   battle_grid,
                                   turn_state,
                                   evaluate_ast,
                                   game_events,
                                   initiative_order,
                               }: InterpretInstructionProps<InstructionMovement>) => {
    const moving_creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const destination_label = instruction.destination
    const path = EXPR.as_positions(turn_state.get_variable(destination_label))

    for (let i = 0; i < path.length - 1; i++) {
        const potential_reactors = get_potential_triggers({
            battle_grid,
            turn_state,
            evaluate_ast,
            initiative_order,
            activator: moving_creature,
            intercept: "movement"
        })


        if (potential_reactors.length === 0) {
            const new_position = path[i + 1]
            moving_creature.data.position = new_position
            game_events.on_creature_moved.raise({
                creature: moving_creature,
                position: new_position,
                movement_type: "move"
            })
        } else {
            turn_state.set_variable(destination_label, {
                type: "positions",
                value: path.slice(i),
                description: "movement"
            })

            turn_state.add_instructions([{
                type: INSTRUCTION_TYPE.MOVE,
                target: instruction.target,
                destination: instruction.destination
            }])

            for (const {creature: trigger_owner, powers} of potential_reactors) {
                const frame = create_trigger_frame({activator: moving_creature, trigger_owner, powers})
                turn_state.add_instruction_frame(frame)
            }

            break
        }
    }
}