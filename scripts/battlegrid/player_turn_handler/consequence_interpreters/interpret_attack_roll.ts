import {roll_d} from "randomness/dice";
import {AstNodeNumberResolved, NODE, preview_defense, token_to_node} from "expression_parsers/token_to_node";
import {AnimationQueue} from "AnimationQueue";
import {
    Consequence,
    ConsequenceAttackRoll,
    ConsequenceCopyVariable
} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {Creature} from "battlegrid/creatures/Creature";
import {ActionLog} from "action_log/ActionLog";

export const interpret_attack_roll = ({
                                          consequence,
                                          context,
                                          action_log
                                      }: InterpretConsequenceProps<ConsequenceAttackRoll>) => {
    const attacker = context.owner()
    const defenders = context.get_creatures(consequence.defender)

    const new_consequences: Array<Consequence> = []
    new_consequences.push(...consequence.before_consequences)
    context.set_creatures({name: `${consequence.defender}(all)`, value: defenders})

    defenders.forEach((defender, i) => {
        const attack_base = NODE.as_number_resolved(token_to_node({token: consequence.attack, context}))
        const attack = add_d20_roll_to_attack(attack_base)

        const defense = NODE.as_number_resolved(preview_defense({defender, defense_code: consequence.defense}))

        const is_hit = attack.value >= defense.value

        const defender_variable_name = `${consequence.defender}(${i + 1})`
        context.set_creature({name: defender_variable_name, value: defender})
        new_consequences.push(create_copy_variable_consequence(defender_variable_name, consequence.defender))

        if (is_hit)
            new_consequences.push(...consequence.hit)
        else {
            AnimationQueue.add_animation(defender.visual.display_miss)
            new_consequences.push(...consequence.miss)
        }

        log_attack_roll({attacker, attack, is_hit, defender, defense, context, consequence, action_log})
    })

    new_consequences.push(create_copy_variable_consequence(`${consequence.defender}(all)`, consequence.defender))

    context.add_consequences(new_consequences)
}

const add_d20_roll_to_attack = (attack_base: AstNodeNumberResolved): AstNodeNumberResolved => {
    const d20_result = roll_d(20)
    return {
        type: "number_resolved",
        value: attack_base.value + d20_result.value,
        params: [
            attack_base,
            {type: "number_resolved", value: d20_result.value, description: "d20"}
        ],
        description: "attack"
    }
}

const create_copy_variable_consequence = (origin: string, destination: string): ConsequenceCopyVariable =>
    ({type: "copy_variable", origin, destination})

const log_attack_roll = (
    {context, attacker, attack, is_hit, defender, consequence, defense, action_log}: {
        context: PowerContext,
        attacker: Creature,
        attack: AstNodeNumberResolved,
        is_hit: boolean,
        defender: Creature,
        defense: AstNodeNumberResolved,
        consequence: ConsequenceAttackRoll
        action_log: ActionLog
    }) => action_log.add_new_action_log(
    `${attacker.data.name}'s ${context.power_name} (`,
    attack,
    `) ${is_hit ? "hits" : "misses"} against ${defender.data.name}'s ${consequence.defense} (`,
    defense,
    `).`
)
