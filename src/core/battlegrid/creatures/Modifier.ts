import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {Expr, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const MODIFIER_TYPE = {
    ATTACK_ROLL: "attack_roll",
} as const

export type ModifierType = typeof MODIFIER_TYPE[keyof typeof MODIFIER_TYPE]

export type Modifier = ModifierAttackRoll

export type ModifierAttackRoll = {
    name: string
    type: typeof MODIFIER_TYPE.ATTACK_ROLL
    value: AstNode
}

export const get_attack_roll_modifier_parts = ({
    creature,
    game_queries,
}: {
    creature: Creature
    game_queries: GameQueries
}): Array<ExprNumberResolved> => {
    const parts: Array<ExprNumberResolved> = []

    for (const modifier of creature.modifiers) {
        if (modifier.type !== MODIFIER_TYPE.ATTACK_ROLL) continue
        const part = EXPR.as_number_resolved_expr(game_queries.evaluate(modifier.value))
        parts.push({...part, description: modifier.name})
    }

    return parts
}
