import {InstructionApplyDamage} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";
import {ExprNumberResolved} from "scripts/expressions/token_evaluator/types";
import {
    max_number_resolved,
    resolve_number,
    subtract_numbers_resolved
} from "scripts/expressions/token_evaluator/number_utils";
import {StatusEffectGainResistance} from "scripts/battlegrid/creatures/Creature";

export const interpret_apply_damage = ({
                                           instruction,
                                           context,
                                           action_log,
                                           player_turn_handler,
                                           evaluate_token
                                       }: InterpretInstructionProps<InstructionApplyDamage>) => {
    const attacker = player_turn_handler.turn_context.get_current_context().owner()
    //TODO P3 we probably want to apply damage to a bunch of enemies at the same time
    const target = EXPR.as_creature(context.get_variable(instruction.target))

    const damage = EXPR.as_number(evaluate_token(instruction.value))

    let result = resolve_number(damage)

    const resistances = target.statuses
        .filter(({effect}) => effect.type === "gain_resistance" && effect.against.includes(attacker))
        .map(({effect}) => (effect as StatusEffectGainResistance).value)
    if (resistances.length > 0)
        result = subtract_numbers_resolved(result, max_number_resolved(resistances))

    if (instruction.half_damage)
        result = apply_half_damage(result)

    target.receive_damage(result.value)
    action_log.add_new_action_log(`${target.data.name} was dealt `, result, ` damage.`)
}

const apply_half_damage = (number: ExprNumberResolved): ExprNumberResolved => ({
    type: "number_resolved",
    value: Math.floor(number.value / 2),
    params: [number],
    description: "half damage"
})

