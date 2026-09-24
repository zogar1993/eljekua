import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {
    add_numbers_resolved,
    max_number_resolved,
    negate_number_resolved,
    resolve_number,
    subtract_numbers_resolved,
} from "core/virtual_machine/expressions/number_utils";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {InstructionApplyDamage} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";

export const interpret_apply_damage = ({
                                           instruction,
                                           evaluate_ast,
                                           game_state,
                                           game_events,
                                       }: InterpretInstructionProps<InstructionApplyDamage>) => {
    const {vm_state} = game_state
    const attacker = vm_state.get_acting_creature()

    //TODO P3 we probably want to apply damage to a bunch of enemies at the same time

    const target = EXPR.as_creature(vm_state.get_variable(instruction.target))

    const hit_status = EXPR.as_attack_rolls(vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))
    const hit_status_value = hit_status.get(target)

    //TODO reevaluate hit status. If an attack misses and does damage to adjacent units on miss, it shouldnt hit.
    if (hit_status_value === HIT_STATUS.MISS && target.data.archetypes.includes("minion")) return

    let damage = resolve_number(EXPR.as_number_expr(evaluate_ast(instruction.value)))

    const modifier = get_damage_modifier({creature: target, damage_types: instruction.damage_types, attacker})

    damage = add_numbers_resolved([damage, modifier])

    if (instruction.half_damage)
        damage = apply_half_damage(damage)

    target.data.hp_current -= damage.value

    game_events.on_creature_received_damage.raise({creature: target, damage})
}

const apply_half_damage = (number: ExprNumberResolved): ExprNumberResolved => ({
    type: "number_resolved",
    value: Math.floor(number.value / 2),
    params: [number],
    description: "half damage"
})

const effect_applies_to_damage_type = (
    against_damage_types: Array<string> | null,
    damage_type: string | null,
): boolean => {
    if (damage_type === null)
        return against_damage_types === null
    return against_damage_types === null || against_damage_types.includes(damage_type)
}

const constant_effect_to_number_resolved = (value: number): ExprNumberResolved => ({
    type: "number_resolved",
    value,
    description: "constant effect",
})

function get_modifier_for_damage_type({creature, attacker, damage_type}: {
    creature: Creature,
    attacker: Creature,
    damage_type: string | null
}) {
    const type_resistances: Array<ExprNumberResolved> = []
    const type_vulnerabilities: Array<ExprNumberResolved> = []
    for (const effect of creature.constant_effects) {
        if (!effect_applies_to_damage_type(effect.against_damage_types, damage_type))
            continue
        if (effect.type === "gain_resistance")
            type_resistances.push(constant_effect_to_number_resolved(effect.value))
        if (effect.type === "gain_vulnerability")
            type_vulnerabilities.push(constant_effect_to_number_resolved(effect.value))
    }
    for (const status of creature.statuses) {
        const {effect} = status
        if (effect.type === "gain_resistance") {
            const includes_attacker = effect.against_creatures === null || effect.against_creatures.includes(attacker)
            if (includes_attacker && effect_applies_to_damage_type(effect.against_damage_types, damage_type))
                type_resistances.push(effect.value)
        }
        if (effect.type === "gain_vulnerability") {
            const includes_attacker = effect.against_creatures === null || effect.against_creatures.includes(attacker)
            if (includes_attacker && effect_applies_to_damage_type(effect.against_damage_types, damage_type))
                type_vulnerabilities.push(effect.value)
        }
    }

    if (type_resistances.length === 0) {
        if (type_vulnerabilities.length === 0)
            return BASE_RESISTANCE
        else
            return max_number_resolved(type_vulnerabilities)
    } else {
        const resistance = max_number_resolved(type_resistances)
        if (type_vulnerabilities.length === 0)
            return negate_number_resolved(resistance)
        else
            return subtract_numbers_resolved(max_number_resolved(type_vulnerabilities), resistance)
    }
}

const get_damage_modifier = ({
                                 creature,
                                 damage_types,
                                 attacker
                             }: {
    attacker: Creature
    creature: Creature
    damage_types: Array<string>
}): ExprNumberResolved => {
    if (damage_types.length === 0)
        return get_modifier_for_damage_type({creature, attacker, damage_type: null})

    if (damage_types.length === 1)
        return get_modifier_for_damage_type({creature, attacker, damage_type: damage_types[0]})

    const modifiers = damage_types.map((damage_type) => get_modifier_for_damage_type({creature, attacker, damage_type}))
    return max_number_resolved(modifiers)
}

export const BASE_RESISTANCE: ExprNumberResolved = {type: "number_resolved", description: "base resistance", value: 0}
