import type {ExprBoolean} from "scripts/expressions/token_evaluator/types";
import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import {TOKEN} from "scripts/expressions/token_evaluator/TOKEN";
import type {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";

export const evaluate_function_has_valid_targets = ({token, turn_context, player_turn_handler}:
                                                        {
                                                            token: TokenFunction,
                                                            turn_context: TurnContext
                                                            player_turn_handler: PlayerTurnHandler
                                                        }): ExprBoolean => {
    assert_parameters_amount_equals(token, 1)

    const power_name = TOKEN.as_keyword(token.parameters[0]).value
    const context = turn_context.get_current_context()
    const power = EXPR.as_power(context.get_variable(power_name)).value

    const first_instruction = power.instructions[0]

    // If it does not need targets because it does not start with "select_target" we take as it's ok
    let has_valid_targets = true
    if (first_instruction.type === "select_target") {
        const valid_targets = player_turn_handler.get_valid_targets({instruction: first_instruction, context})
        has_valid_targets = valid_targets.length > 0
    }

    return {
        type: "boolean",
        value: has_valid_targets,
        description: "has valid targets"
    }
}