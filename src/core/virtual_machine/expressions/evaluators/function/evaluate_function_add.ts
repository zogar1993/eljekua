import type {ExprNumber} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {
    add_numbers,
    add_numbers_resolved,
    is_number,
    is_number_resolved
} from "core/virtual_machine/expressions/number_utils";

export const evaluate_function_add = ({node, game_state}: EvaluateFunctionProps): ExprNumber => {
    const params = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}