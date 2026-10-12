import type {Expr} from "core/virtual_machine/expressions/types";
import type {EvaluateAstProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_number} from "core/virtual_machine/expressions/evaluators/evaluate_number";
import {evaluate_string} from "core/virtual_machine/expressions/evaluators/evaluate_string";
import {evaluate_weapon} from "core/virtual_machine/expressions/evaluators/evaluate_weapon";
import {evaluate_dice} from "core/virtual_machine/expressions/evaluators/evaluate_dice";
import {evaluate_keyword} from "core/virtual_machine/expressions/evaluators/evaluate_keyword";
import {evaluate_function} from "core/virtual_machine/expressions/evaluators/function/evaluate_function";
import {create_game_queries} from "core/game_state/GameQueries";

export const evaluate_ast = ({node, game_state}: EvaluateAstProps): Expr => {
    switch (node.type) {
        case "number":
            return evaluate_number({node, game_state})
        case "string":
            return evaluate_string({node, game_state})
        case "weapon":
            return evaluate_weapon({node, game_state})
        case "dice":
            return evaluate_dice({node, game_state})
        case "keyword":
            return evaluate_keyword({node, game_state})
        case "function":
            return evaluate_function({node, game_state, game_queries: create_game_queries({game_state})})
        default:
            throw Error(`evaluator for type '${(node as { type: string }).type}' does not exist`)
    }
}
