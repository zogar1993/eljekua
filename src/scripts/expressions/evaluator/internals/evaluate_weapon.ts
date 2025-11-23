import type {ExprNumberUnresolved} from "scripts/expressions/evaluator/types";
import type {AstNodeWeapon} from "scripts/expressions/parser/nodes/AstNodeRoll";
import {number_utils} from "scripts/expressions/evaluator/number_utils";

export const evaluate_weapon = (node: AstNodeWeapon): ExprNumberUnresolved => {
    const die: ExprNumberUnresolved = {type: "number_unresolved", min: 1, max: 4, description: `W`}
    if (node.amount === 1) return die
    return {...number_utils(Array.from({length: node.amount}, () => die)), description: `${node.amount}W`}
}

