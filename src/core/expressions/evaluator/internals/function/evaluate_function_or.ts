import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/expressions/evaluator/types";
import {assert_parameters_amount_is_at_least} from "core/expressions/evaluator/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";

export const evaluate_function_or = ({node, evaluate_ast}:
                                         {
                                             node: AstNodeFunction
                                             evaluate_ast: (node: AstNode) => Expr
                                         }): ExprBoolean => {
    assert_parameters_amount_is_at_least(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    if (!parameters.every(parameter => parameter.type === "boolean"))
        throw Error(`Expected all '$or()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    const result = parameters.some(parameter => parameter.value)

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}