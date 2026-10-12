import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {ATTRIBUTE_CODES, type AttributeCode} from "core/character_sheet/attributes";
import {get_creature_attribute_mod_lvl} from "core/character_sheet/get_creature_attribute_mod_lvl";

export const evaluate_function_attr_mod_lvl = ({node, game_state}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const creature = EXPR.as_creature(evaluate_ast({node: node.parameters[0], game_state}))
    const attribute = EXPR.as_string(evaluate_ast({node: node.parameters[1], game_state}))

    if (!ATTRIBUTE_CODES.includes(attribute as AttributeCode))
        throw Error(`Invalid attribute ${attribute}`)

    return get_creature_attribute_mod_lvl(creature, attribute as AttributeCode)
}
