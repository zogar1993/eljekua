import {Creature} from "core/battlegrid/creatures/Creature";
import {DefenseCode, get_creature_defense} from "core/character_sheet/get_creature_defense";
import {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {Expr} from "core/virtual_machine/expressions/types";
import {bound_minmax} from "stdlib/bound_minmax";

export type AttackSuccessChance = { attack: number, defense: number, chance: number }

export const get_attack_success_chance = ({
                                              attack_ast,
                                              defense_code,
                                              defender,
                                              evaluate_ast,
                                          }: {
    attack_ast: AstNode
    defense_code: DefenseCode
    defender: Creature
    evaluate_ast: (node: AstNode) => Expr
}): AttackSuccessChance => {
    const attack = EXPR.as_number(evaluate_ast(attack_ast))
    const defense = get_creature_defense({creature: defender, defense_code}).value
    const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

    return {attack, defense, chance}
}
