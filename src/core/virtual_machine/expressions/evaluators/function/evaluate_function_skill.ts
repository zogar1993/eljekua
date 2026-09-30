import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {get_creature_skill} from "core/character_sheet/get_creature_skill";
import {SKILL_CODES, type SkillCode} from "core/character_sheet/skills";

export const evaluate_function_skill = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const creature = EXPR.as_creature(game_queries.evaluate(node.parameters[0]))
    const skill_code = EXPR.as_string(game_queries.evaluate(node.parameters[1]))

    if (!SKILL_CODES.includes(skill_code as SkillCode))
        throw Error(`Invalid skill ${skill_code}`)

    return get_creature_skill({creature, skill_code: skill_code as SkillCode})
}
