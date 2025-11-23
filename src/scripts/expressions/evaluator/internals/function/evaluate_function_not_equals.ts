import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "scripts/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {positions_equal} from "scripts/battlegrid/Position";

export const evaluate_function_not_equals = ({node, evaluate_ast}:
                                                 {
                                                     node: AstNodeFunction
                                                     evaluate_ast: (node: AstNode) => Expr
                                                 }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameter1 = evaluate_ast(node.parameters[0])
    const parameter2 = evaluate_ast(node.parameters[1])

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