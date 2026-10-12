import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {positions_equal} from "core/battlegrid/Position";

export const evaluate_function_not_equals = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameter1 = evaluate_ast({node: node.parameters[0], game_state})
    const parameter2 = evaluate_ast({node: node.parameters[1], game_state})

    if (parameter1.type === "positions" && parameter2.type === "positions") {

        const positions1 = parameter1.value
        const positions2 = parameter2.value
        const are_equal = positions1.length === positions2.length &&
            positions1.every((p1, i) => positions_equal(p1, positions2[i]))

        return {
            type: "boolean",
            value: !are_equal,
            description: "not_equals",
            params: [parameter1, parameter2]
        }
    }
    throw Error(`not_equals parameters dont match, got ${parameter1.type} and ${parameter2.type}`)
}