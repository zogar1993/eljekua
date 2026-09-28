import type {GameQueries} from "core/game_state/GameQueries";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {FUNCTION_NAME} from "core/expressions/function_names";
import {evaluate_function_add} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_add";
import {
    evaluate_function_equipped
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_equipped";
import {
    evaluate_function_not
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_not";
import {
    evaluate_function_not_equals
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_not_equals";
import {
    evaluate_function_has_valid_targeting
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_has_valid_targeting";
import {evaluate_function_or} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_or";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {evaluate_function_exists} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_exists";
import {
    evaluate_function_is_greater_or_equal
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_greater_or_equal";
import {
    evaluate_function_can_expend_action_type
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_can_expend_action_type";
import {evaluate_function_and} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_and";
import {
    evaluate_function_is_lower_or_equal
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_lower_or_equal";
import {
    evaluate_function_distance
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_distance";
import {
    evaluate_function_opportunity_attack_range,
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_opportunity_attack_range";
import {
    evaluate_function_are_enemies
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_are_enemies";
import {
    evaluate_function_is_ally
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_ally";
import {
    evaluate_function_is_monster_template
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_monster_template";
import {
    evaluate_function_has_action_type_available
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_has_action_type_available";
import {
    evaluate_function_creature_by_id
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_creature_by_id";
import {
    evaluate_function_is_greater
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_greater";
import {
    evaluate_function_is_lower
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_lower";
import {
    evaluate_function_attack_roll_resolution_mode_is
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_attack_roll_resolution_mode_is";
import {
    evaluate_function_adjacent_creatures
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_adjacent_creatures";
import {
    evaluate_function_is_race
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_is_race";
import {
    evaluate_function_count
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_count";
import {
    evaluate_function_filter_creatures
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_filter_creatures";
import type {GameState} from "core/game_state/GameState";

export const build_evaluate_function = ({game_queries, game_state}: {
                                            game_queries: GameQueries,
                                            game_state: GameState
                                        }
) => {
    return (node: AstNodeFunction): Expr => {
        switch (node.name) {
            case FUNCTION_NAME.ADD:
                return evaluate_function_add({node, game_queries})
            case FUNCTION_NAME.EXISTS:
                return evaluate_function_exists({node, game_state})
            case FUNCTION_NAME.EQUIPPED:
                return evaluate_function_equipped({node, game_queries})
            case FUNCTION_NAME.HAS_ACTION_TYPE_AVAILABLE:
                return evaluate_function_has_action_type_available({node, game_queries})
            case FUNCTION_NAME.NOT:
                return evaluate_function_not({node, game_queries})
            case FUNCTION_NAME.NOT_EQUALS:
                return evaluate_function_not_equals({node, game_queries})
            case FUNCTION_NAME.HAS_VALID_TARGETING:
                return evaluate_function_has_valid_targeting({node, game_state, game_queries})
            case FUNCTION_NAME.ARE_ENEMIES:
                return evaluate_function_are_enemies({node, game_queries})
            case FUNCTION_NAME.IS_ALLY:
                return evaluate_function_is_ally({node, game_queries})
            case FUNCTION_NAME.IS_MONSTER_TEMPLATE:
                return evaluate_function_is_monster_template({node, game_queries})
            case FUNCTION_NAME.CAN_EXPEND_ACTION_TYPE:
                return evaluate_function_can_expend_action_type({node, game_queries})
            case FUNCTION_NAME.DISTANCE:
                return evaluate_function_distance({node, game_queries})
            case FUNCTION_NAME.OPPORTUNITY_ATTACK_RANGE:
                return evaluate_function_opportunity_attack_range({node, game_queries})
            case FUNCTION_NAME.OR:
                return evaluate_function_or({node, game_queries})
            case FUNCTION_NAME.AND:
                return evaluate_function_and({node, game_queries})
            case FUNCTION_NAME.IS_GREATER_OR_EQUAL:
                return evaluate_function_is_greater_or_equal({node, game_queries})
            case FUNCTION_NAME.IS_LOWER_OR_EQUAL:
                return evaluate_function_is_lower_or_equal({node, game_queries})
            case FUNCTION_NAME.IS_GREATER:
                return evaluate_function_is_greater({node, game_queries})
            case FUNCTION_NAME.IS_LOWER:
                return evaluate_function_is_lower({node, game_queries})
            case FUNCTION_NAME.CREATURE_BY_ID:
                return evaluate_function_creature_by_id({node, game_state})
            case FUNCTION_NAME.ATTACK_ROLL_RESOLUTION_MODE_IS:
                return evaluate_function_attack_roll_resolution_mode_is({node, game_state, game_queries})
            case FUNCTION_NAME.ADJACENT_CREATURES:
                return evaluate_function_adjacent_creatures({node, game_state, game_queries})
            case FUNCTION_NAME.IS_RACE:
                return evaluate_function_is_race({node, game_queries})
            case FUNCTION_NAME.COUNT:
                return evaluate_function_count({node, game_queries})
            case FUNCTION_NAME.FILTER_CREATURES:
                return evaluate_function_filter_creatures({node, game_state, game_queries})
            default:
                throw Error(`function name '${node.name}' not supported when evaluating node`)
        }
    }
}