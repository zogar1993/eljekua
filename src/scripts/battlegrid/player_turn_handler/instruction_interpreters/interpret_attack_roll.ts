import {roll_d} from "scripts/randomness/dice";
import {AnimationQueue} from "scripts/AnimationQueue";
import {
    Instruction,
    InstructionAttackRoll,
    InstructionSaveVariable
} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ActionLog} from "scripts/action_log/ActionLog";
import {add_numbers_resolved} from "scripts/expressions/token_evaluator/number_utils";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";
import {ExprNumberResolved} from "scripts/expressions/token_evaluator/types";

import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";

export const interpret_attack_roll = ({
                                          instruction,
                                          context,
                                          action_log,
                                          battle_grid,
                                          evaluate_token
                                      }: InterpretInstructionProps<InstructionAttackRoll>) => {
    const attacker = context.owner()
    const defenders = EXPR.as_creatures(context.get_variable(instruction.defender))

    const new_instructions: Array<Instruction> = []
    new_instructions.push(...instruction.before_instructions)
    const defenders_label = `${instruction.defender}(all)`
    context.set_variable(defenders_label, {type: "creatures", value: defenders, description: defenders_label})

    defenders.forEach((defender, i) => {
        const attack_parts: Array<ExprNumberResolved> = []
        attack_parts.push(EXPR.as_number_resolved(evaluate_token(instruction.attack)))
        attack_parts.push(roll_d(20))

        for (const {effect} of attacker.statuses)
            if (effect.type === "gain_attack_bonus" && effect.against.includes(defender))
                attack_parts.push(effect.value)

        attacker.remove_statuses({type: "next_attack_roll_against_target", creature: defender})

        if (
            battle_grid.is_flanking({attacker, defender}) ||
            defender.statuses.some(({effect}) => effect.type === "grant_combat_advantage" && effect.against.includes(attacker))
        ) attack_parts.push(COMBAT_ADVANTAGE)

        const attack = add_numbers_resolved(attack_parts)

        const defense = get_creature_defense({creature: defender, defense_code: instruction.defense})

        const is_hit = attack.value >= defense.value

        const defender_label = `${instruction.defender}(${i + 1})`
        context.set_variable(defender_label, {type: "creatures", value: [defender], description: defender_label})
        new_instructions.push(copy_variable_instruction(defender_label, instruction.defender))

        if (is_hit) {
            context.status = "hit"
            new_instructions.push(...instruction.hit)
        } else {
            AnimationQueue.add_animation(defender.visual.display_miss)
            context.status = "miss"
            new_instructions.push(...instruction.miss)
        }
        new_instructions.push({type: "clean_context_status"})

        log_attack_roll({attacker, attack, is_hit, defender, defense, context, instruction, action_log})
    })

    new_instructions.push(copy_variable_instruction(`${instruction.defender}(all)`, instruction.defender))

    context.add_instructions(new_instructions)
}

const COMBAT_ADVANTAGE: ExprNumberResolved = {
    type: "number_resolved",
    value: 2,
    description: "Combat Advantage"
}

const copy_variable_instruction = (origin: string, destination: string): InstructionSaveVariable =>
    ({type: "save_variable", value: {type: "keyword", value: origin}, label: destination})

const log_attack_roll = (
    {context, attacker, attack, is_hit, defender, instruction, defense, action_log}: {
        context: PowerContext,
        attacker: Creature,
        attack: ExprNumberResolved,
        is_hit: boolean,
        defender: Creature,
        defense: ExprNumberResolved,
        instruction: InstructionAttackRoll
        action_log: ActionLog
    }) => action_log.add_new_action_log(
    `${attacker.data.name}'s ${context.power_name} (`,
    attack,
    `) ${is_hit ? "hits" : "misses"} against ${defender.data.name}'s ${instruction.defense} (`,
    defense,
    `).`
)
