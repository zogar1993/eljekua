import type {AstNodeBoolean, InterpretProps} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import {TOKEN} from "expressions/token_evaluator/TOKEN";

export const evaluate_token_function_has_valid_targets = ({
                                                              token,
                                                              player_turn_handler
                                                          }: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)

    const power_name = TOKEN.as_keyword(token.parameters[0]).value
    const context = player_turn_handler.turn_context.get_current_context()
    const power = context.get_power(power_name)

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