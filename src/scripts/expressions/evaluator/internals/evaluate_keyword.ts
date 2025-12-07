import type {Expr} from "scripts/expressions/evaluator/types";
import type {AstNodeKeyword} from "scripts/expressions/parser/nodes/AstNodeKeyword";
import type {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {get_creature_property} from "scripts/character_sheet/get_creature_property";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const build_evaluate_keyword = ({turn_state}: { turn_state: TurnState }) => {
    return (node: AstNodeKeyword): Expr => {
        const variable_name = node.value
        const variable = turn_state.get_current_context().get_variable(variable_name)

        if (node.property) {
            const creature = EXPR.as_creature(variable)

            if (node.property === "position") {
                const description = `${creature.data.name}'s position`
                return {type: "positions", value: [creature.data.position], description}
            }
            return {
                type: "number_resolved",
                ...get_creature_property({creature, property: node.property}),
            }
        }

        return variable
    }
}

