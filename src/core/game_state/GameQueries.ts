import type {GameState} from "core/game_state/GameState";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {AstNode} from "core/expressions/parser/nodes/AstNode";


export const create_game_queries = ({game_state}: {
    game_state: GameState
}) => ({
    // This is called "evaluate" instead of "interpret"
    // to distinguish the expressions that evaluate to a value
    // from the interpreting of instructions that affect the game context.
    evaluate: (node: AstNode) => evaluate_ast({node, game_state}),
})

export type GameQueries = ReturnType<typeof create_game_queries>
