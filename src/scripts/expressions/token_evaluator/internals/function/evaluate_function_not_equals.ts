import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import type {ExprBoolean} from "scripts/expressions/token_evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {Expr} from "scripts/expressions/token_evaluator/types";
import {positions_equal} from "scripts/battlegrid/Position";

export const evaluate_function_not_equals = ({token, evaluate_token}:
                                                 {
                                                     token: TokenFunction
                                                     evaluate_token: (token: Token) => Expr
                                                 }): ExprBoolean => {
    assert_parameters_amount_equals(token, 2)

    const parameter1 = evaluate_token(token.parameters[0])
    const parameter2 = evaluate_token(token.parameters[1])

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