import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {GameState} from "core/game_state/GameState";

export type EvaluateAstProps<N extends AstNode = AstNode> = {
    node: N
    game_state: GameState
}

export type EvaluateFunctionProps = EvaluateAstProps<AstNodeFunction>
