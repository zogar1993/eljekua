import type {ExprCreatures} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Creature} from "core/battlegrid/creatures/Creature";

export const evaluate_function_filter_creatures = ({node, game_state}: EvaluateFunctionProps): ExprCreatures => {
    assert_parameters_amount_equals(node, 2)

    const creatures = EXPR.as_creatures(evaluate_ast({node: node.parameters[0], game_state}))
    const condition = node.parameters[1]
    const {vm_state} = game_state
    const filtered: Array<Creature> = []

    for (const creature of creatures) {
        vm_state.set_variable(SYSTEM_KEYWORD.FILTER_CREATURE, {type: "creatures", value: [creature]})
        if (EXPR.as_boolean(evaluate_ast({node: condition, game_state})))
            filtered.push(creature)
    }

    return {
        type: "creatures",
        value: filtered,
    }
}
