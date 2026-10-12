import type {ExprPositions} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {Position} from "core/battlegrid/Position";
import {get_iteration_variable_name} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_map";

export const evaluate_function_filter = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprPositions => {
    assert_parameters_amount_equals(node, 3)

    const positions = game_queries.evaluate_positions(game_queries.evaluate(node.parameters[0]))
    const variable_name = get_iteration_variable_name(node.parameters[1])
    const condition = node.parameters[2]
    const {vm_state} = game_state
    const filtered: Array<Position> = []

    for (const position of positions) {
        vm_state.set_variable(variable_name, {type: "positions", value: [position]})
        if (game_queries.evaluate_boolean(game_queries.evaluate(condition)))
            filtered.push(position)
    }

    return {
        type: "positions",
        value: filtered,
    }
}
