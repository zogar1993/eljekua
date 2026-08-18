import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/virtual_machine/expressions/types";
import {build_evaluate_keyword} from "core/virtual_machine/expressions/internals/evaluate_keyword";
import {evaluate_string} from "core/virtual_machine/expressions/internals/evaluate_string";
import {evaluate_number} from "core/virtual_machine/expressions/internals/evaluate_number";
import {evaluate_weapon} from "core/virtual_machine/expressions/internals/evaluate_weapon";
import {evaluate_dice} from "core/virtual_machine/expressions/internals/evaluate_dice";
import {build_evaluate_function} from "core/virtual_machine/expressions/internals/function/evaluate_function";
import type {AstNodeNumber} from "core/expressions/parser/nodes/AstNodeNumber";
import type {AstNodeString} from "core/expressions/parser/nodes/AstNodeString";
import type {AstNodeDice, AstNodeWeapon} from "core/expressions/parser/nodes/AstNodeRoll";
import type {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {GameState} from "core/game_state/GameState";

/*
    This is called "evaluate" instead on "interpret" to distinguish the expressions that evaluate to a value from the
    interpreting of instructions that affect the game context.
 */
export const build_evaluate_ast = ({game_state}: {
    game_state: GameState
}): (node: AstNode) => Expr => {
    const {turn_state, battle_grid} = game_state
    const evaluate_ast = (node: AstNode) => {
        const func = evaluator_internals[node.type]
        if (!func) throw Error(`evaluator for type '${node.type}' does not exist`)
        return evaluator_internals[node.type](node)
    }

    const evaluate_keyword = build_evaluate_keyword({turn_state})
    const evaluate_function = build_evaluate_function({evaluate_ast, turn_state, battle_grid})

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
