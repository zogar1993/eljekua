import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {get_creature_skill} from "core/character_sheet/get_creature_skill";
import {SKILL_CODES, type SkillCode} from "core/character_sheet/skills";

export const evaluate_function_skill = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const creature = game_queries.evaluate_creature(game_queries.evaluate(node.parameters[0]))
    const skill_code = game_queries.evaluate_string(game_queries.evaluate(node.parameters[1]))

    if (!SKILL_CODES.includes(skill_code as SkillCode))
        throw Error(`Invalid skill ${skill_code}`)

    return get_creature_skill({creature, skill_code: skill_code as SkillCode})
}
