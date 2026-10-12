import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {get_creature_skill} from "core/character_sheet/get_creature_skill";
import {SKILL_CODES, type SkillCode} from "core/character_sheet/skills";

export const evaluate_function_skill = ({node, game_state}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const creature = EXPR.as_creature(evaluate_ast({node: node.parameters[0], game_state}))
    const skill_code = EXPR.as_string(evaluate_ast({node: node.parameters[1], game_state}))

    if (!SKILL_CODES.includes(skill_code as SkillCode))
        throw Error(`Invalid skill ${skill_code}`)

    return get_creature_skill({creature, skill_code: skill_code as SkillCode})
}
