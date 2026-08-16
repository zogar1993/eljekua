import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";

export const evaluate_function_and = ({node, evaluate_ast}:
                                         {
                                             node: AstNodeFunction
                                             evaluate_ast: (node: AstNode) => Expr
                                         }): ExprBoolean => {
    assert_parameters_amount_is_at_least(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    if (!parameters.every(parameter => parameter.type === "boolean"))
        throw Error(`Expected all '$and()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    const result = parameters.every(parameter => parameter.value)

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}