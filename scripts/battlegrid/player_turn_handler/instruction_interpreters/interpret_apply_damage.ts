import {resolve_number} from "expressions/token_evaluator/evaluate_token";
import {InstructionApplyDamage} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "expressions/token_evaluator/NODE";
import {AstNodeNumberResolved} from "expressions/token_evaluator/types";
import {max_number_resolved, subtract_numbers_resolved} from "expressions/token_evaluator/add_numbers";
import {StatusEffectGainResistance} from "battlegrid/creatures/Creature";

export const interpret_apply_damage = ({
                                           instruction,
                                           context,
                                           action_log,
                                           player_turn_handler,
                                           evaluate_token
                                       }: InterpretInstructionProps<InstructionApplyDamage>) => {
    const attacker = player_turn_handler.turn_context.get_current_context().owner()
    const target = context.get_creature(instruction.target)

    const damage = NODE.as_number(evaluate_token(instruction.value))

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

const apply_half_damage = (number: AstNodeNumberResolved): AstNodeNumberResolved => ({
    type: "number_resolved",
    value: Math.floor(number.value / 2),
    params: [number],
    description: "half damage"
})

