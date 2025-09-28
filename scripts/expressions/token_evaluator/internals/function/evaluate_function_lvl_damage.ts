import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import type {AstNodeBoolean, AstNodeNumber} from "expressions/token_evaluator/types";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "expressions/token_evaluator/types";
import {NODE} from "expressions/token_evaluator/NODE";
import {TurnContext} from "battlegrid/player_turn_handler/TurnContext";

export const evaluate_function_lvl_damage = ({token, evaluate_token, turn_context}:
                                                 {
                                                     token: TokenFunction
                                                     evaluate_token: (token: Token) => AstNode
                                                     turn_context: TurnContext
                                                 }): AstNodeNumber => {
    assert_parameters_amount_equals(token, 3)

    const parameters = token.parameters.map(evaluate_token)

    const owner = turn_context.get_current_context().owner()
    const required_level = NODE.as_number_resolved(parameters[0])
    return owner.data.level < required_level.value ?
        NODE.as_number(parameters[1]) :
        NODE.as_number(parameters[2])
}