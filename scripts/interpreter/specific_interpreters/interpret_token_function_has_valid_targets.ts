import {InterpretProps} from "interpreter/types";
import {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "interpreter/asserts";
import {AstNodeBoolean} from "interpreter/interpret_token";
import {TOKEN} from "interpreter/TOKEN";

export const token_to_has_valid_targets_function_node = ({
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