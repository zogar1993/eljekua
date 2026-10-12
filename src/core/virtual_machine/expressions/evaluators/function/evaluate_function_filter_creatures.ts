import type {ExprCreatures} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Creature} from "core/battlegrid/creatures/Creature";

export const evaluate_function_filter_creatures = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprCreatures => {
    assert_parameters_amount_equals(node, 2)

    const creatures = game_queries.evaluate_creatures(game_queries.evaluate(node.parameters[0]))
    const condition = node.parameters[1]
    const {vm_state} = game_state
    const filtered: Array<Creature> = []

    for (const creature of creatures) {
        vm_state.set_variable(SYSTEM_KEYWORD.FILTER_CREATURE, {type: "creatures", value: [creature]})
        if (game_queries.evaluate_boolean(game_queries.evaluate(condition)))
            filtered.push(creature)
    }

    return {
        type: "creatures",
        value: filtered,
    }
}
