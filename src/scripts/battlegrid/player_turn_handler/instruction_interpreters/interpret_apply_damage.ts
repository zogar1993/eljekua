import {InstructionApplyDamage} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {
    max_number_resolved,
    resolve_number,
    subtract_numbers_resolved
} from "scripts/expressions/evaluator/number_utils";
import {StatusEffectGainResistance} from "scripts/battlegrid/creatures/Creature";

export const interpret_apply_damage = ({
                                           instruction,
                                           action_log,
                                           player_turn_handler,
                                           evaluate_ast,
                                           turn_state
                                       }: InterpretInstructionProps<InstructionApplyDamage>) => {
    const context = turn_state.get_current_context()
    const attacker = player_turn_handler.turn_state.get_current_context().owner()
    //TODO P3 we probably want to apply damage to a bunch of enemies at the same time
    const target = EXPR.as_creature(context.get_variable(instruction.target))

    let damage = resolve_number(EXPR.as_number_expr(evaluate_ast(instruction.value)))

    const resistances = target.statuses
        .filter(({effect}) => effect.type === "gain_resistance" && effect.against.includes(attacker))
        .map(({effect}) => (effect as StatusEffectGainResistance).value)
    if (resistances.length > 0)
        damage = subtract_numbers_resolved(damage, max_number_resolved(resistances))

    if (instruction.half_damage)
        damage = apply_half_damage(damage)

    target.receive_damage(damage.value)
    action_log.add_new_action_log(`${target.data.name} was dealt `, damage, ` damage.`)
}

const apply_half_damage = (number: ExprNumberResolved): ExprNumberResolved => ({
    type: "number_resolved",
    value: Math.floor(number.value / 2),
    params: [number],
    description: "half damage"
})

