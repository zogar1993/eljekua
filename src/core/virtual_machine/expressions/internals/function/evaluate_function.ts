import {Expr} from "core/virtual_machine/expressions/types";
import {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {evaluate_function_add} from "core/virtual_machine/expressions/internals/function/evaluate_function_add";
import {evaluate_function_equipped} from "core/virtual_machine/expressions/internals/function/evaluate_function_equipped";
import {
    evaluate_function_not_equals
} from "core/virtual_machine/expressions/internals/function/evaluate_function_not_equals";
import {
    evaluate_function_has_valid_targeting
} from "core/virtual_machine/expressions/internals/function/evaluate_function_has_valid_targeting";
import {evaluate_function_or} from "core/virtual_machine/expressions/internals/function/evaluate_function_or";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {evaluate_function_exists} from "core/virtual_machine/expressions/internals/function/evaluate_function_exists";
import {
    evaluate_function_is_greater_or_equal
} from "core/virtual_machine/expressions/internals/function/evaluate_function_is_greater_or_equal";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import {
    evaluate_function_can_expend_action_type
} from "core/virtual_machine/expressions/internals/function/evaluate_function_can_expend_action_type";
import {evaluate_function_and} from "core/virtual_machine/expressions/internals/function/evaluate_function_and";
import {
    evaluate_function_is_lower_or_equal
} from "core/virtual_machine/expressions/internals/function/evaluate_function_is_lower_or_equal";
import {evaluate_function_distance} from "core/virtual_machine/expressions/internals/function/evaluate_function_distance";
import {
    evaluate_function_opportunity_attack_range,
} from "core/virtual_machine/expressions/internals/function/evaluate_function_opportunity_attack_range";
import {
    evaluate_function_are_enemies
} from "core/virtual_machine/expressions/internals/function/evaluate_function_are_enemies";
import {
    evaluate_function_is_ally
} from "core/virtual_machine/expressions/internals/function/evaluate_function_is_ally";
import {
    evaluate_function_is_monster_template
} from "core/virtual_machine/expressions/internals/function/evaluate_function_is_monster_template";
import {
    evaluate_function_has_action_type_available
} from "core/virtual_machine/expressions/internals/function/evaluate_function_has_action_type_available";
import {
    evaluate_function_creature_by_id
} from "core/virtual_machine/expressions/internals/function/evaluate_function_creature_by_id";

export const build_evaluate_function = ({evaluate_ast, turn_state, battle_grid}:
                                            {
                                                evaluate_ast: (node: AstNode) => Expr,
                                                turn_state: TurnState,
                                                battle_grid: BattleGrid
                                            }
) => {
    return (node: AstNodeFunction): Expr => {
        switch (node.name) {
            case "add":
                return evaluate_function_add({node, evaluate_ast})
            case "exists":
                return evaluate_function_exists({node, turn_state})
            case "equipped":
                return evaluate_function_equipped({node, evaluate_ast})
            case "has_action_type_available":
                return evaluate_function_has_action_type_available({node, evaluate_ast})
            case "not_equals":
                return evaluate_function_not_equals({node, evaluate_ast})
            case "has_valid_targeting":
                return evaluate_function_has_valid_targeting({node, turn_state, evaluate_ast, battle_grid})
            case "are_enemies":
                return evaluate_function_are_enemies({node, evaluate_ast})
            case "is_ally":
                return evaluate_function_is_ally({node, evaluate_ast})
            case "is_monster_template":
                return evaluate_function_is_monster_template({node, evaluate_ast})
            case "can_expend_action_type":
                return evaluate_function_can_expend_action_type({node, evaluate_ast})
            case "distance":
                return evaluate_function_distance({node, evaluate_ast})
            case "opportunity_attack_range":
                return evaluate_function_opportunity_attack_range({node, evaluate_ast})
            case "or":
                return evaluate_function_or({node, evaluate_ast})
            case "and":
                return evaluate_function_and({node, evaluate_ast})
            case "is_greater_or_equal":
                return evaluate_function_is_greater_or_equal({node, evaluate_ast})
            case "is_lower_or_equal":
                return evaluate_function_is_lower_or_equal({node, evaluate_ast})
            case "creature_by_id":
                return evaluate_function_creature_by_id({node, battle_grid})
            default:
                throw Error(`function name '${node.name}' not supported when evaluating node`)
        }
    }
}