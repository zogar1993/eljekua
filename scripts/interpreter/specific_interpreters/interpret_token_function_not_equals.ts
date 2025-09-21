import type {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {interpret_token} from "interpreter/interpret_token";
import type {AstNodeBoolean, InterpretProps} from "interpreter/types";
import {assert_parameters_amount_equals} from "interpreter/asserts";

export const interpret_token_function_not_equals = ({
                                                        token,
                                                        ...props
                                                    }: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)

    const parameter1 = interpret_token({token: token.parameters[0], ...props})
    const parameter2 = interpret_token({token: token.parameters[1], ...props})

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