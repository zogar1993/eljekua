import {Expr, ExprNumber, ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {assert_is_footprint_one, Position, PositionFootprintOne} from "scripts/battlegrid/Position";
import {PowerVM} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";

export const EXPR = {
    as_creature: (expr: Expr): Creature => {
        if (expr.type === "creatures") {
            if (expr.value.length === 1) return expr.value[0]
            throw Error("expected only one creature in expression")
        }
        return throw_could_not_cast({expr, to: "creatures"})
    },
    as_creatures: (expr: Expr): Array<Creature> => {
        if (expr.type === "creatures") return expr.value
        return throw_could_not_cast({expr, to: "creatures"})
    },
    as_position: (expr: Expr): Position => {
        if (expr.type === "positions") {
            if (expr.value.length === 1) return expr.value[0]
            throw Error("expected only one position in expression")
        }
        return throw_could_not_cast({expr, to: "position"})
    },
    as_positions: (expr: Expr): Array<Position> => {
        if (expr.type === "positions") return expr.value
        return throw_could_not_cast({expr, to: "positions"})
    },
    as_number: (expr: Expr): number => {
        if (expr.type === "number_resolved") return expr.value
        return throw_could_not_cast({expr, to: "number_resolved"})
    },
    as_boolean: (expr: Expr): boolean => {
        if (expr.type === "boolean") return expr.value
        return throw_could_not_cast({expr, to: "boolean"})
    },
    as_string: (expr: Expr): string => {
        if (expr.type === "string") return expr.value
        return throw_could_not_cast({expr, to: "string"})
    },
    as_power: (expr: Expr): PowerVM => {
        if (expr.type === "power") return expr.value
        return throw_could_not_cast({expr, to: "power"})
    },
    as_number_expr: (expr: Expr): ExprNumber => {
        if (expr.type === "number_resolved") return expr
        if (expr.type === "number_unresolved") return expr
        return throw_could_not_cast({expr, to: "number"})
    },
    as_number_resolved_expr: (expr: Expr): ExprNumberResolved => {
        if (expr.type === "number_resolved") return expr
        return throw_could_not_cast({expr, to: "number"})
    },
}

const throw_could_not_cast = ({expr, to}: { expr: Expr, to: string }): never => {
    throw `Could not cast expression '${expr.type}' to '${to}'`
}