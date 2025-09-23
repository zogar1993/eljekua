import {resolve_number, evaluate_token} from "expressions/token_evaluator/evaluate_token";
import {InstructionApplyDamage} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "expressions/token_evaluator/NODE";
import {AstNodeNumberResolved} from "expressions/token_evaluator/types";

export const interpret_apply_damage = ({
                                           instruction,
                                           context,
                                           action_log,
                                           player_turn_handler
                                       }: InterpretInstructionProps<InstructionApplyDamage>) => {
    const target = context.get_creature(instruction.target)

    const damage = NODE.as_number(evaluate_token({token: instruction.value, player_turn_handler}))

    const resolved = resolve_number(damage)

    const result = resolved.value

    const modified_result: AstNodeNumberResolved = instruction.half_damage ? {
        type: "number_resolved",
        value: Math.floor(result / 2),
        params: [resolved],
        description: "half damage"
    } : resolved

    target.receive_damage(modified_result.value)
    action_log.add_new_action_log(`${target.data.name} was dealt `, modified_result, ` damage.`)
}
