import {Expr} from "scripts/expressions/evaluator/types";
import {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {evaluate_function_add} from "scripts/expressions/evaluator/internals/function/evaluate_function_add";
import {evaluate_function_equipped} from "scripts/expressions/evaluator/internals/function/evaluate_function_equipped";
import {
    evaluate_function_not_equals
} from "scripts/expressions/evaluator/internals/function/evaluate_function_not_equals";
import {
    evaluate_function_has_valid_targets
} from "scripts/expressions/evaluator/internals/function/evaluate_function_has_valid_targets";
import {evaluate_function_or} from "scripts/expressions/evaluator/internals/function/evaluate_function_or";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {evaluate_function_exists} from "scripts/expressions/evaluator/internals/function/evaluate_function_exists";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {
    evaluate_function_is_greater_or_equal
} from "scripts/expressions/evaluator/internals/function/evaluate_function_is_greater_or_equal";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

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
                return evaluate_function_add({node: node, evaluate_ast: evaluate_ast})
            case "exists":
                return evaluate_function_exists({node: node, turn_state})
            case "equipped":
                return evaluate_function_equipped({node: node, evaluate_ast: evaluate_ast})
            case "not_equals":
                return evaluate_function_not_equals({node: node, evaluate_ast: evaluate_ast})
            case "has_valid_targets":
                return evaluate_function_has_valid_targets({node: node, turn_state, evaluate_ast, battle_grid})
            case "or":
                return evaluate_function_or({node: node, evaluate_ast: evaluate_ast})
            case "is_greater_or_equal":
                return evaluate_function_is_greater_or_equal({node: node, evaluate_ast: evaluate_ast})
            default:
                throw Error(`function name '${node.name}' not supported when evaluating node`)
        }
    }
}