import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import type {GameState} from "core/game_state/GameState";

export const build_evaluate_keyword = ({game_state}: { game_state: GameState }) => {
    const {vm_state} = game_state
    return (node: AstNodeKeyword): Expr => vm_state.get_variable(node.value)
}
