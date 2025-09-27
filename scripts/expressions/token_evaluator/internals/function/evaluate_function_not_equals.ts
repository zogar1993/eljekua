import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import type {AstNodeBoolean} from "expressions/token_evaluator/types";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "expressions/token_evaluator/types";

export const evaluate_function_not_equals = ({token, evaluate_token}:
                                                 {
                                                     token: TokenFunction
                                                     evaluate_token: (token: Token) => AstNode
                                                 }): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)

    const parameter1 = evaluate_token(token.parameters[0])
    const parameter2 = evaluate_token(token.parameters[1])

    if (parameter1.type === "position" && parameter2.type === "position") {
        const position1 = parameter1.value
        const position2 = parameter2.value
        const are_equal = position1.x === position2.x && position1.y === position2.y

        return {
            type: "boolean",
            value: !are_equal,
            description: "not_equals",
            params: [parameter1, parameter2]
        }
    }
    throw Error(`not_equals parameters dont match, got ${parameter1.type} and ${parameter2.type}`)
}