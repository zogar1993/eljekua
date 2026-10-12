import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {ATTRIBUTE_CODES, type AttributeCode} from "core/character_sheet/attributes";
import {get_creature_attribute_mod_lvl} from "core/character_sheet/get_creature_attribute_mod_lvl";

export const evaluate_function_attr_mod_lvl = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const creature = game_queries.evaluate_creature(game_queries.evaluate(node.parameters[0]))
    const attribute = game_queries.evaluate_string(game_queries.evaluate(node.parameters[1]))

    if (!ATTRIBUTE_CODES.includes(attribute as AttributeCode))
        throw Error(`Invalid attribute ${attribute}`)

    return get_creature_attribute_mod_lvl(creature, attribute as AttributeCode)
}
