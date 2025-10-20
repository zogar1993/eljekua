import type {AstNode} from "scripts/expressions/token_evaluator/types";
import type {KeywordToken} from "scripts/expressions/tokenizer/tokens/KeywordToken";
import type {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import {get_creature_property} from "scripts/character_sheet/get_creature_property";

export const build_evaluate_token_keyword = ({turn_context}: { turn_context: TurnContext }) => {
    return (token: KeywordToken): AstNode => {
        const variable_name = token.value
        const variable = turn_context.get_current_context().get_variable(variable_name)

        if (token.property) {
            if (variable.type !== "creature")
                throw Error(`token keyword properties are only supported`)

            const creature = variable.value

            if (token.property === "position") {
                const value = creature.data.position
                const description = `${creature.data.name}'s position`
                return {type: "position", value, description}
            }
            return {
                type: "number_resolved",
                ...get_creature_property({creature, property: token.property}),
            }
        }

        return variable
    }
}

