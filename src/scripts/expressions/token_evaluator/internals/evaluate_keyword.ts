import type {Expr} from "scripts/expressions/token_evaluator/types";
import type {KeywordToken} from "scripts/expressions/tokenizer/tokens/KeywordToken";
import type {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import {get_creature_property} from "scripts/character_sheet/get_creature_property";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";

export const build_evaluate_token_keyword = ({turn_context}: { turn_context: TurnContext }) => {
    return (token: KeywordToken): Expr => {
        const variable_name = token.value
        const variable = turn_context.get_current_context().get_variable(variable_name)

        if (token.property) {
            const creature = EXPR.as_creature(variable)

            if (token.property === "position") {
                const description = `${creature.data.name}'s position`
                return {type: "positions", value: [creature.data.position], description}
            }
            return {
                type: "number_resolved",
                ...get_creature_property({creature, property: token.property}),
            }
        }

        return variable
    }
}

