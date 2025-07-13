import {get_adjacent} from "battlegrid/ranges/get_adyacent";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {BASIC_ATTACK_ACTIONS} from "powers/basic";
import {Consequence, ConsequenceMovement} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_move = ({consequence, context, battle_grid, player_turn_handler}: InterpretConsequenceProps<ConsequenceMovement>) => {
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
            .filter(player_turn_handler.turn_context.has_opportunity_action)

        if (potential_attackers.length === 0) {
            const new_position = path[i + 1]
            battle_grid.move_creature_one_square({creature, position: new_position})
        } else {
            for (const attacker of potential_attackers) {
                const opportunity_attack_context = new PowerContext(
                    add_option_for_opportunity_attack(remove_first_targeting(BASIC_ATTACK_ACTIONS[0].consequences)),
                    BASIC_ATTACK_ACTIONS[0].name
                )
                opportunity_attack_context.set_variable({
                    name: "owner",
                    value: attacker,
                    type: "creature"
                })
                opportunity_attack_context.set_variable({
                    name: "primary_target",
                    value: creature,
                    type: "creature"
                })
                player_turn_handler.turn_context.add_power_context(opportunity_attack_context)
                //TODO this should be better
                player_turn_handler.turn_context.expend_opportunity_action(attacker)
            }

            context.add_consequences([{
                type: "move",
                target: consequence.target,
                destination: consequence.destination
            }])
            context.set_variable({
                type: "path",
                name: consequence.destination,
                value: path.slice(i)
            })
            break
        }
    }
}

//TODO make it tidier
const remove_first_targeting = (consequences: Array<Consequence>) => {
    if (consequences[0].type === "select_target")
        return consequences.slice(1)
    throw Error("targeting needed for removing it")
}

//TODO make it tidier
const add_option_for_opportunity_attack = (consequences: Array<Consequence>): Array<Consequence> => {
    return [
        {
            type: "options",
            options: [
                {text: "Opportunity Attack", consequences},
                {text: "Ignore", consequences: []},
            ],
        }
    ]
}
