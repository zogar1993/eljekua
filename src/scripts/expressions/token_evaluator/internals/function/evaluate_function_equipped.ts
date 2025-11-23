import type {ExprBoolean} from "scripts/expressions/token_evaluator/types";
import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";
import {TOKEN} from "scripts/expressions/token_evaluator/TOKEN";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {Expr} from "scripts/expressions/token_evaluator/types";

export const evaluate_function_equipped = ({token, evaluate_token}:
                                               {
                                                   token: TokenFunction,
                                                   evaluate_token: (token: Token) => Expr,
                                               }): ExprBoolean => {
    assert_parameters_amount_equals(token, 2)
    const creature = EXPR.as_creatures_expr(evaluate_token(TOKEN.as_keyword(token.parameters[0])))
    const text = EXPR.as_string(evaluate_token(TOKEN.as_string(token.parameters[1])))

    return {
        type: "boolean",
        //TODO P3 this is a bit ugly
        value: creature.value[0].has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}
