import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import type {GameState} from "core/game_state/GameState";
import {get_creature_property} from "core/character_sheet/get_creature_property";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const build_evaluate_keyword = ({game_state}: { game_state: GameState }) => {
    const {vm_state} = game_state
    return (node: AstNodeKeyword): Expr => {
        const variable_name = node.value
        const variable = vm_state.get_variable(variable_name)

        if (node.property) {
            const creature = EXPR.as_creature(variable)

            if (node.property === "position")
                return {type: "positions", value: [creature.data.position]}

            if (node.property === "template")
                return {type: "string", value: creature.data.template ?? "",}

            return {
                type: "number_resolved",
                ...get_creature_property({creature, property: node.property}),
            }
        }

        return variable
    }
}

