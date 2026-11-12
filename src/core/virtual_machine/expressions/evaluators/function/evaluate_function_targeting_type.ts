import type {Power} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {ExprString} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {InstructionSelectTarget} from "core/virtual_machine/instructions/instructions";
import {assert_unreachable} from "stdlib/assert";

export const evaluate_function_targeting_type = ({node, game_queries}: EvaluateFunctionProps): ExprString => {
    assert_parameters_amount_equals(node, 1)

    const power = game_queries.evaluate_power(game_queries.evaluate(node.parameters[0]))

    return {
        type: "string",
        value: get_power_targeting_category(power),
    }
}

const get_power_targeting_category = (power: Power): string => {
    const targeting = power.targeting
    if (targeting === null) return "none"

    return get_targeting_type_category(targeting)
}

const get_targeting_type_category = (targeting: InstructionSelectTarget): string => {
    switch (targeting.targeting_type) {
        case "melee_weapon":
            return "melee"
        default:
            return assert_unreachable(`targeting type '${targeting.targeting_type}' is not implemented`)
    }
}