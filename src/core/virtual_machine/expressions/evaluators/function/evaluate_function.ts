import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {FUNCTION_NAME} from "core/expressions/function_names";
import {evaluate_function_add} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_add";
import {
    evaluate_function_equipped
} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_equipped";
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
import type {GameState} from "core/game_state/GameState";

export const build_evaluate_function = ({evaluate_ast, game_state}: {
                                            evaluate_ast: (node: AstNode) => Expr,
                                            game_state: GameState
                                        }
) => {
    return (node: AstNodeFunction): Expr => {
        switch (node.name) {
            case FUNCTION_NAME.ADD:
                return evaluate_function_add({node, evaluate_ast})
            case FUNCTION_NAME.EXISTS:
                return evaluate_function_exists({node, game_state})
            case FUNCTION_NAME.EQUIPPED:
                return evaluate_function_equipped({node, evaluate_ast})
            case FUNCTION_NAME.HAS_ACTION_TYPE_AVAILABLE:
                return evaluate_function_has_action_type_available({node, evaluate_ast})
            case FUNCTION_NAME.NOT_EQUALS:
                return evaluate_function_not_equals({node, evaluate_ast})
            case FUNCTION_NAME.HAS_VALID_TARGETING:
                return evaluate_function_has_valid_targeting({node, game_state, evaluate_ast})
            case FUNCTION_NAME.ARE_ENEMIES:
                return evaluate_function_are_enemies({node, evaluate_ast})
            case FUNCTION_NAME.IS_ALLY:
                return evaluate_function_is_ally({node, evaluate_ast})
            case FUNCTION_NAME.IS_MONSTER_TEMPLATE:
                return evaluate_function_is_monster_template({node, evaluate_ast})
            case FUNCTION_NAME.CAN_EXPEND_ACTION_TYPE:
                return evaluate_function_can_expend_action_type({node, evaluate_ast})
            case FUNCTION_NAME.DISTANCE:
                return evaluate_function_distance({node, evaluate_ast})
            case FUNCTION_NAME.OPPORTUNITY_ATTACK_RANGE:
                return evaluate_function_opportunity_attack_range({node, evaluate_ast})
            case FUNCTION_NAME.OR:
                return evaluate_function_or({node, evaluate_ast})
            case FUNCTION_NAME.AND:
                return evaluate_function_and({node, evaluate_ast})
            case FUNCTION_NAME.IS_GREATER_OR_EQUAL:
                return evaluate_function_is_greater_or_equal({node, evaluate_ast})
            case FUNCTION_NAME.IS_LOWER_OR_EQUAL:
                return evaluate_function_is_lower_or_equal({node, evaluate_ast})
            case FUNCTION_NAME.IS_GREATER:
                return evaluate_function_is_greater({node, evaluate_ast})
            case FUNCTION_NAME.IS_LOWER:
                return evaluate_function_is_lower({node, evaluate_ast})
            case FUNCTION_NAME.CREATURE_BY_ID:
                return evaluate_function_creature_by_id({node, game_state})
            default:
                throw Error(`function name '${node.name}' not supported when evaluating node`)
        }
    }
}