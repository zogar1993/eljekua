import {roll_d} from "randomness/dice";
import {AstNode, NODE, preview_defense, token_to_node} from "expression_parsers/token_to_node";
import {AnimationQueue} from "AnimationQueue";
import {ConsequenceAttackRoll} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_attack_roll = ({
                                          consequence,
                                          context,
                                          action_log
                                      }: InterpretConsequenceProps<ConsequenceAttackRoll>) => {
    const d20_result = roll_d(20)

    const attacker = context.get_creature("owner")
    const defenders = context.get_creatures(consequence.defender)

    context.set_variable({type: "creatures", value: defenders, name: `${consequence.defender}(all)`})
//TODO this order is a bit anti intuitive
    context.add_consequences([{type: "copy_variable", origin: `${consequence.defender}(all)`, destination: consequence.defender}])

    for (let i = 0; i < defenders.length; i++) {
        const defender = defenders[i]
        //TODO attack is not correctly randomized for AoE
        const attack_base = NODE.as_number_resolved(token_to_node({token: consequence.attack, context}))

        const attack: AstNode = {
            type: "number_resolved",
            value: attack_base.value + d20_result.value,
            params: [
                attack_base,
                {type: "number_resolved", value: d20_result.value, description: "d20"}
            ],
            description: "attack"
        }

        const defense = NODE.as_number_resolved(preview_defense({
            defender,
            defense_code: consequence.defense
        }))

        const is_hit = attack.value >= defense.value

        action_log.add_new_action_log(`${attacker.data.name}'s ${context.power_name} (`, attack, `) ${is_hit ? "hits" : "misses"} against ${defender.data.name}'s ${consequence.defense} (`, defense, `).`)

        const defender_variable_name = `${consequence.defender}(${i + 1})`
        context.set_variable({type: "creature", value: defender, name: defender_variable_name})

        if (is_hit)
            context.add_consequences([
                {type: "copy_variable", origin: defender_variable_name, destination: consequence.defender},
                ...consequence.hit
            ])
        else {
            AnimationQueue.add_animation(defender.visual.display_miss)
            context.add_consequences([
                {type: "copy_variable", origin: defender_variable_name, destination: consequence.defender},
                ...consequence.miss
            ])
        }
    }
//TODO this order is a bit anti intuitive
    context.add_consequences(consequence.before_consequences)
}

