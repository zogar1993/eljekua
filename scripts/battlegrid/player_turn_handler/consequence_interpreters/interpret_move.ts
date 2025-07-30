import {get_adjacent} from "battlegrid/ranges/get_adyacent";
import {BASIC_ATTACK_ACTIONS} from "powers/basic";
import {Consequence, ConsequenceMovement} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_move = ({
                                   consequence,
                                   context,
                                   battle_grid,
                                   turn_context
                               }: InterpretConsequenceProps<ConsequenceMovement>) => {
    const creature = context.get_creature(consequence.target)
    let path = context.get_path(consequence.destination)

    for (let i = 0; i < path.length - 1; i++) {
        const current_position = path[i]
        const potential_attackers = get_adjacent({
            position: current_position,
            battle_grid
        })
            .filter(battle_grid.is_terrain_occupied)
            .map(battle_grid.get_creature_by_position)
            .filter(turn_context.has_opportunity_action)

        if (potential_attackers.length === 0) {
            const new_position = path[i + 1]
            battle_grid.move_creature_one_square({creature, position: new_position})
        } else {
            for (const attacker of potential_attackers) {
                const consequences = turn_power_into_opportunity_attack(BASIC_ATTACK_ACTIONS[0].consequences)
                const name = BASIC_ATTACK_ACTIONS[0].name
                turn_context.add_power_context({name, consequences, owner: attacker})
                turn_context.get_current_context().set_creature({name: "primary_target", value: creature})

                //TODO this should be better when turns and rounds are added
                turn_context.expend_opportunity_action(attacker)
            }

            context.add_consequences([{type: "move", target: consequence.target, destination: consequence.destination}])
            context.set_path({name: consequence.destination, value: path.slice(i)})
            break
        }
    }
}

const turn_power_into_opportunity_attack = (consequences: Array<Consequence>) =>
    add_option_for_opportunity_attack(remove_first_targeting(consequences))

const remove_first_targeting = (consequences: Array<Consequence>) => {
    if (consequences[0].type === "select_target")
        return consequences.slice(1)
    throw Error("targeting needed for removing it")
}

const add_option_for_opportunity_attack = (consequences: Array<Consequence>): Array<Consequence> => [
    {
        type: "options",
        options: [
            {text: "Opportunity Attack", consequences},
            {text: "Ignore", consequences: []},
        ],
    }
]
