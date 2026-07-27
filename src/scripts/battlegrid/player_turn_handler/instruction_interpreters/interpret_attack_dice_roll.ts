import {roll_d} from "scripts/randomness/dice";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {add_numbers_resolved} from "scripts/expressions/evaluator/number_utils";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";
import {HIT_STATUS, HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {InstructionAttackDiceRoll} from "scripts/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";
import {is_flanking} from "scripts/battlegrid/queries/is_flanking";
import {Creature} from "scripts/battlegrid/creatures/Creature";

const COMBAT_ADVANTAGE: ExprNumberResolved = {
    type: "number_resolved",
    value: 2,
    description: "Combat Advantage"
}

export const interpret_attack_dice_roll = ({
                                               instruction,
                                               battle_grid,
                                               evaluate_ast,
                                               turn_state
                                           }: InterpretInstructionProps<InstructionAttackDiceRoll>) => {
    const attacker = EXPR.as_creature(turn_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const defenders = EXPR.as_creatures(turn_state.get_variable(instruction.defender))

    const roll_results = new Map<Creature, HitStatus>()

    defenders.forEach(defender => {
        const attack_parts: Array<ExprNumberResolved> = []
        attack_parts.push(EXPR.as_number_resolved_expr(evaluate_ast(instruction.attack)))
        const attack_roll = roll_d(20)
        attack_parts.push(attack_roll)

        for (const {effect} of attacker.statuses)
            if (effect.type === "gain_attack_bonus" && effect.against.includes(defender))
                attack_parts.push(effect.value)

        attacker.remove_statuses({type: "next_attack_roll_against_target", creature: defender})

        if (
            is_flanking({attacker, defender, battle_grid}) ||
            defender.statuses.some(({effect}) => effect.type === "grant_combat_advantage" && effect.against.includes(attacker))
        ) attack_parts.push(COMBAT_ADVANTAGE)

        const attack = add_numbers_resolved(attack_parts)
        const defense = get_creature_defense({creature: defender, defense_code: instruction.defense})
        const surpasses_defense = attack.value >= defense.value
        const is_critical_range = attack_roll.value === 20

        const hit_status: HitStatus = surpasses_defense
            ? is_critical_range ? HIT_STATUS.CRIT : HIT_STATUS.HIT
            : is_critical_range ? HIT_STATUS.HIT : HIT_STATUS.MISS

        roll_results.set(defender, hit_status)

        turn_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: roll_results})

        attacker.events.has_attacked.raise({attack, hit_status, defender, defense, instruction})
    })
}