import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {
    min_number_resolved,
    resolve_number,
    subtract_numbers_resolved,
} from "core/virtual_machine/expressions/number_utils";
import type {Creature, StatusEffectGainResistance} from "core/battlegrid/creatures/Creature";
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

    const relevant_resistances = get_relevant_resistances({creature: target, damage_types: instruction.damage_types})
    if (relevant_resistances.length > 0)
        damage = subtract_numbers_resolved(damage, min_number_resolved(relevant_resistances))

    const status_resistances = target.statuses
        .filter(({effect}) => effect.type === "gain_resistance" && effect.against.includes(attacker))
        .map(({effect}) => (effect as StatusEffectGainResistance).value)

    if (status_resistances.length > 0)
        damage = subtract_numbers_resolved(damage, min_number_resolved(status_resistances))

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

const get_relevant_resistances = ({
                                      creature,
                                      damage_types,
                                  }: {
    creature: Creature
    damage_types: Array<string>
}): Array<ExprNumberResolved> => {
    const relevant_resistances: Array<ExprNumberResolved> = []
    for (const damage_type of damage_types) {
        const value = creature.data.resistances[damage_type]
        if (value) {
            const description = `${damage_type} ${value > 0 ? "resistance" : "vulnerability"} ${value}`
            relevant_resistances.push({type: "number_resolved", value, description, params: []})
        }
    }
    return relevant_resistances
}
