import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr, ExprNumber, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {GameState} from "core/game_state/GameState";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {Position} from "core/battlegrid/Position";
import type {Power} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";

export const create_game_queries = ({game_state}: {
    game_state: GameState
}) => {
    const resolve_expr = (input: AstNode | Expr): Expr =>
        is_ast_node(input) ? evaluate_ast({node: input, game_state}) : input

    return {
        // This is called "evaluate" instead of "interpret"
        // to distinguish the expressions that evaluate to a value
        // from the interpreting of instructions that affect the game context.
        evaluate: (node: AstNode) => evaluate_ast({node, game_state}),

        evaluate_creature: (input: AstNode | Expr): Creature =>
            cast_creature(resolve_expr(input)),
        evaluate_creatures: (input: AstNode | Expr): Array<Creature> =>
            cast_creatures(resolve_expr(input)),
        evaluate_position: (input: AstNode | Expr): Position =>
            cast_position(resolve_expr(input)),
        evaluate_positions: (input: AstNode | Expr): Array<Position> =>
            cast_positions(resolve_expr(input)),
        evaluate_collection: (input: AstNode | Expr): Array<Expr> =>
            cast_collection(resolve_expr(input)),
        evaluate_numbers_resolved: (input: AstNode | Expr): Array<ExprNumberResolved> =>
            cast_numbers_resolved(resolve_expr(input)),
        evaluate_number: (input: AstNode | Expr): number =>
            cast_number(resolve_expr(input)),
        evaluate_boolean: (input: AstNode | Expr): boolean =>
            cast_boolean(resolve_expr(input)),
        evaluate_string: (input: AstNode | Expr): string =>
            cast_string(resolve_expr(input)),
        evaluate_power: (input: AstNode | Expr): Power =>
            cast_power(resolve_expr(input)),
        evaluate_number_expr: (input: AstNode | Expr): ExprNumber =>
            cast_number_expr(resolve_expr(input)),
        evaluate_number_resolved_expr: (input: AstNode | Expr): ExprNumberResolved =>
            cast_number_resolved_expr(resolve_expr(input)),
        evaluate_attack_rolls: (input: AstNode | Expr): Map<Creature, HitStatus> =>
            cast_attack_rolls(resolve_expr(input)),
        evaluate_attack_d20_rolls: (input: AstNode | Expr): Map<Creature, number> =>
            cast_attack_d20_rolls(resolve_expr(input)),
    }
}

export type GameQueries = ReturnType<typeof create_game_queries>

const is_ast_node = (input: AstNode | Expr): input is AstNode =>
    input.type === "keyword" ||
    input.type === "function" ||
    input.type === "dice" ||
    input.type === "weapon" ||
    input.type === "number"

const throw_could_not_cast = ({expr, to}: { expr: Expr, to: string }): never => {
    throw `Could not cast expression '${expr.type}' to '${to}'`
}

const cast_creature = (expr: Expr): Creature => {
    if (expr.type === "creatures") {
        if (expr.value.length === 1) return expr.value[0]
        throw Error("expected only one creature in expression")
    }
    return throw_could_not_cast({expr, to: "creatures"})
}

const cast_creatures = (expr: Expr): Array<Creature> => {
    if (expr.type === "creatures") return expr.value
    return throw_could_not_cast({expr, to: "creatures"})
}

const cast_position = (expr: Expr): Position => {
    if (expr.type === "positions") {
        if (expr.value.length === 1) return expr.value[0]
        throw Error("expected only one position in expression")
    }
    if (expr.type === "creatures") {
        if (expr.value.length === 1) return expr.value[0].data.position
        throw Error("expected only one creature in expression")
    }
    return throw_could_not_cast({expr, to: "position"})
}

const cast_positions = (expr: Expr): Array<Position> => {
    if (expr.type === "positions") return expr.value
    if (expr.type === "creatures") return expr.value.map(creature => creature.data.position)
    return throw_could_not_cast({expr, to: "positions"})
}

const cast_collection = (expr: Expr): Array<Expr> => {
    if (expr.type === "creatures")
        return expr.value.map(creature => ({type: "creatures", value: [creature]}))
    if (expr.type === "positions")
        return expr.value.map(position => ({type: "positions", value: [position]}))
    if (expr.type === "numbers")
        return expr.value
    return throw_could_not_cast({expr, to: "collection"})
}

const cast_numbers_resolved = (expr: Expr): Array<ExprNumberResolved> => {
    if (expr.type === "numbers") return expr.value
    if (expr.type === "number_resolved") return [expr]
    return throw_could_not_cast({expr, to: "numbers"})
}

const cast_number = (expr: Expr): number => {
    if (expr.type === "number_resolved") return expr.value
    return throw_could_not_cast({expr, to: "number_resolved"})
}

const cast_boolean = (expr: Expr): boolean => {
    if (expr.type === "boolean") return expr.value
    return throw_could_not_cast({expr, to: "boolean"})
}

const cast_string = (expr: Expr): string => {
    if (expr.type === "string") return expr.value
    return throw_could_not_cast({expr, to: "string"})
}

const cast_power = (expr: Expr): Power => {
    if (expr.type === "power") return expr.value
    return throw_could_not_cast({expr, to: "power"})
}

const cast_number_expr = (expr: Expr): ExprNumber => {
    if (expr.type === "number_resolved") return expr
    if (expr.type === "number_unresolved") return expr
    return throw_could_not_cast({expr, to: "number"})
}

const cast_number_resolved_expr = (expr: Expr): ExprNumberResolved => {
    if (expr.type === "number_resolved") return expr
    return throw_could_not_cast({expr, to: "number"})
}

const cast_attack_rolls = (expr: Expr): Map<Creature, HitStatus> => {
    if (expr.type === "attack_rolls") return expr.value
    return throw_could_not_cast({expr, to: "attack_rolls"})
}

const cast_attack_d20_rolls = (expr: Expr): Map<Creature, number> => {
    if (expr.type === "attack_d20_rolls") return expr.value
    return throw_could_not_cast({expr, to: "attack_d20_rolls"})
}
