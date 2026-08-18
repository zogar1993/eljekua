import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {
    max_number_resolved,
    resolve_number,
    subtract_numbers_resolved
} from "core/virtual_machine/expressions/number_utils";
import {StatusEffectGainResistance} from "core/battlegrid/creatures/Creature";
import {InstructionApplyDamage} from "core/virtual_machine/instructions/instructions";

export const interpret_apply_damage = ({
                                           instruction,
                                           evaluate_ast,
                                           game_state,
                                           game_events,
                                       }: InterpretInstructionProps<InstructionApplyDamage>) => {
    const {turn_state} = game_state
    const attacker = turn_state.get_acting_creature()
    //TODO P3 we probably want to apply damage to a bunch of enemies at the same time
    const target = EXPR.as_creature(turn_state.get_variable(instruction.target))

    let damage = resolve_number(EXPR.as_number_expr(evaluate_ast(instruction.value)))

    const resistances = target.statuses
        .filter(({effect}) => effect.type === "gain_resistance" && effect.against.includes(attacker))
        .map(({effect}) => (effect as StatusEffectGainResistance).value)
    if (resistances.length > 0)
        damage = subtract_numbers_resolved(damage, max_number_resolved(resistances))

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
