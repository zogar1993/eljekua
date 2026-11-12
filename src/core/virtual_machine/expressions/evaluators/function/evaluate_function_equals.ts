import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {assert_is_type, assert_unreachable} from "stdlib/assert";

export const evaluate_function_equals = ({node, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameter1 = game_queries.evaluate(node.parameters[0])
    const parameter2 = game_queries.evaluate(node.parameters[1])

    return {
        type: "boolean",
        value: are_parameters_equal(parameter1, parameter2),
        description: "equals",
        params: [parameter1, parameter2],
    }
}

function are_parameters_equal(parameter1: Expr, parameter2: Expr) {
    switch (parameter1.type) {
        case "string":
            assert_is_type(parameter2, "string")
            return parameter1.value === parameter2.value
        case "number_resolved":
            assert_is_type(parameter2, "number_resolved")
            return parameter1.value === parameter2.value
        default:
            assert_unreachable(`${parameter1.type} is not supported on $equals function`)
    }
}