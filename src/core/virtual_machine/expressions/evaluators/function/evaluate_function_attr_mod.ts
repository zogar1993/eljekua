import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {ATTRIBUTE_CODES, type AttributeCode} from "core/character_sheet/attributes";
import {get_creature_attribute_mod} from "core/character_sheet/get_creature_attribute_mod";

export const evaluate_function_attr_mod = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const creature = EXPR.as_creature(game_queries.evaluate(node.parameters[0]))
    const attribute = EXPR.as_string(game_queries.evaluate(node.parameters[1]))

    if (!ATTRIBUTE_CODES.includes(attribute as AttributeCode))
        throw Error(`Invalid attribute ${attribute}`)

    return get_creature_attribute_mod(creature, attribute as AttributeCode)
}
