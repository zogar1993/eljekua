import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "scripts/expressions/evaluator/types";
import {assert_parameters_amount_is_at_least} from "scripts/expressions/evaluator/asserts";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";

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