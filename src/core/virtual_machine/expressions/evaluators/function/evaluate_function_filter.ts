import type {ExprPositions} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {Position} from "core/battlegrid/Position";
import {get_iteration_variable_name} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_map";

export const evaluate_function_filter = ({node, game_state}: EvaluateFunctionProps): ExprPositions => {
    assert_parameters_amount_equals(node, 3)

    const positions = EXPR.as_positions(evaluate_ast({node: node.parameters[0], game_state}))
    const variable_name = get_iteration_variable_name(node.parameters[1])
    const condition = node.parameters[2]
    const {vm_state} = game_state
    const filtered: Array<Position> = []

    for (const position of positions) {
        vm_state.set_variable(variable_name, {type: "positions", value: [position]})
        if (EXPR.as_boolean(evaluate_ast({node: condition, game_state})))
            filtered.push(position)
    }

    return {
        type: "positions",
        value: filtered,
    }
}
