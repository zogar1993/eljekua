import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {build_evaluate_keyword} from "scripts/expressions/evaluator/internals/evaluate_keyword";
import {evaluate_string} from "scripts/expressions/evaluator/internals/evaluate_string";
import {evaluate_number} from "scripts/expressions/evaluator/internals/evaluate_number";
import {evaluate_weapon} from "scripts/expressions/evaluator/internals/evaluate_weapon";
import {evaluate_dice} from "scripts/expressions/evaluator/internals/evaluate_dice";
import {build_evaluate_function,} from "scripts/expressions/evaluator/internals/function/evaluate_function";
import type {AstNodeNumber} from "scripts/expressions/parser/nodes/AstNodeNumber";
import type {AstNodeString} from "scripts/expressions/parser/nodes/AstNodeString";
import type {AstNodeDice, AstNodeWeapon} from "scripts/expressions/parser/nodes/AstNodeRoll";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {AstNodeKeyword} from "scripts/expressions/parser/nodes/AstNodeKeyword";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";

/*
    This is called "evaluate" instead on "interpret" to distinguish the expressions that evaluate to a value from the
    interpreting of instructions that affect the game context.
 */
export const build_evaluate_ast = ({player_turn_handler}: { player_turn_handler: PlayerTurnHandler }) => {
    const turn_context = player_turn_handler.turn_context

    const evaluate_ast = (node: AstNode) => {
        const func = evaluator_internals[node.type]
        if (!func) throw Error(`evaluator for type '${node.type}' does not exist`)
        return evaluator_internals[node.type](node)
    }

    const evaluate_keyword = build_evaluate_keyword({turn_context})
    const evaluate_function = build_evaluate_function({evaluate_ast, turn_context, player_turn_handler})

    const evaluator_internals: Record<AstNode["type"], (node: AstNode) => Expr> = {
        "number": (node) => evaluate_number(node as AstNodeNumber),
        "string": (node) => evaluate_string(node as AstNodeString),
        "weapon": (node) => evaluate_weapon(node as AstNodeWeapon),
        "dice": (node) => evaluate_dice(node as AstNodeDice),
        "keyword": (node) => evaluate_keyword(node as AstNodeKeyword),
        "function": (node) => evaluate_function(node as AstNodeFunction)
    }

    return evaluate_ast
}
