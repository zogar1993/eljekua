import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionAssessAttackHitStatus} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {Creature, remove_creature_statuses} from "core/battlegrid/creatures/Creature";
import {HIT_STATUS, HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {is_flanking} from "core/battlegrid/queries/is_flanking";
import {add_numbers_resolved} from "core/virtual_machine/expressions/number_utils";
import {get_creature_defense} from "core/character_sheet/get_creature_defense";

export const interpret_assess_attack_hit_status = (props: InterpretInstructionProps<InstructionAssessAttackHitStatus>) => {
    const {instruction, game_state, evaluate_ast, game_events} = props
    const {vm_state, battle_grid} = game_state
    const d20_rolls = EXPR.as_attack_d20_rolls(vm_state.get_variable(SYSTEM_KEYWORD.ATTACK_D20_ROLLS))
    const attacker = EXPR.as_creature(vm_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const defenders = EXPR.as_creatures(vm_state.get_variable(instruction.defender))
    const power_name = EXPR.as_string(vm_state.get_variable(SYSTEM_KEYWORD.POWER_NAME))

    const roll_results = new Map<Creature, HitStatus>()

    defenders.forEach(defender => {
        const attack_parts: Array<ExprNumberResolved> = []
        attack_parts.push(EXPR.as_number_resolved_expr(evaluate_ast(instruction.attack)))

        const d20_value = d20_rolls.get(defender)
        if (d20_value === undefined) throw Error(`missing d20 roll for creature "${defender.data.name}"`)

        attack_parts.push({type: "number_resolved", value: d20_value, description: "d20"})

        for (const {effect} of attacker.statuses)
            if (effect.type === "gain_attack_bonus" && (effect.against_creatures === null || effect.against_creatures.includes(defender)))
                attack_parts.push(effect.value)

        remove_creature_statuses({
            creature: attacker,
            type: "next_attack_roll_against_target",
            until_creature: defender
        })

        if (
            is_flanking({attacker, defender, battle_grid}) ||
            defender.statuses.some(({effect}) => effect.type === "grant_combat_advantage" && (effect.against_creatures === null || effect.against_creatures.includes(attacker)))
        ) attack_parts.push(COMBAT_ADVANTAGE)

        const attack = add_numbers_resolved(attack_parts)
        const defense = get_creature_defense({creature: defender, defense_code: instruction.defense})
        const hit_status = get_hit_status({attack, defense, d20_value})

        roll_results.set(defender, hit_status)

        game_events.on_creature_attacked.raise({
            creature: attacker,
            attack,
            hit_status,
            defender,
            defense,
            instruction,
            power_name,
        })
    })

    vm_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: roll_results})
}

const COMBAT_ADVANTAGE: ExprNumberResolved = {
    type: "number_resolved",
    value: 2,
    description: "Combat Advantage",
}

const get_hit_status = ({
                            attack,
                            defense,
                            d20_value,
                        }: {
    attack: ExprNumberResolved
    defense: ExprNumberResolved
    d20_value: number
}): HitStatus => {
    const surpasses_defense = attack.value >= defense.value
    const is_critical_range = d20_value === 20

    return surpasses_defense
        ? is_critical_range ? HIT_STATUS.CRIT : HIT_STATUS.HIT
        : is_critical_range ? HIT_STATUS.HIT : HIT_STATUS.MISS
}
