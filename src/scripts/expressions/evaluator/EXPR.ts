import {
    Expr,
    ExprBoolean,
    ExprCreatures,
    ExprNumber,
    ExprNumberResolved,
    ExprPositions,
    ExprPower,
    ExprString
} from "scripts/expressions/evaluator/types";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Position} from "scripts/battlegrid/Position";

//TODO P3 refactor remaining non _expr as_ functions
export const EXPR = {
    as_creatures_expr: (expr: Expr): ExprCreatures => {
        if (expr.type === "creatures") return expr
        return throw_could_not_cast({expr, to: "creatures"})
    },
    as_creature: (expr: Expr): Creature => {
        if (expr.type === "creatures") {
            if(expr.value.length === 1) return expr.value[0]
            throw Error("expected only one creature in expression")
        }
        return throw_could_not_cast({expr, to: "creatures"})
    },
    as_creatures: (expr: Expr): Array<Creature> => {
        if (expr.type === "creatures") return expr.value
        return throw_could_not_cast({expr, to: "creatures"})
    },
    as_number: (expr: Expr): ExprNumber => {
        if (expr.type === "number_resolved") return expr
        if (expr.type === "number_unresolved") return expr
        return throw_could_not_cast({expr, to: "number"})
    },
    as_number_resolved: (expr: Expr): ExprNumberResolved => {
        if (expr.type === "number_resolved") return expr
        return throw_could_not_cast({expr, to: "number_resolved"})
    },
    as_boolean: (expr: Expr): ExprBoolean => {
        if (expr.type === "boolean") return expr
        return throw_could_not_cast({expr, to: "boolean"})
    },
    as_position: (expr: Expr): Position => {
        if (expr.type === "positions") {
            if(expr.value.length === 1) return expr.value[0]
            throw Error("expected only one position in expression")
        }
        return throw_could_not_cast({expr, to: "position"})
    },
    as_positions: (expr: Expr): Array<Position> => {
        if (expr.type === "positions") return expr.value
        return throw_could_not_cast({expr, to: "positions"})
    },
    as_positions_expr: (expr: Expr): ExprPositions => {
        if (expr.type === "positions") return expr
        return throw_could_not_cast({expr, to: "positions"})
    },
    as_string: (expr: Expr): ExprString => {
        if (expr.type === "string") return expr
        return throw_could_not_cast({expr, to: "string"})
    },
    as_power: (expr: Expr): ExprPower => {
        if (expr.type === "power") return expr
        return throw_could_not_cast({expr, to: "power"})
    }
}

const throw_could_not_cast = ({expr, to}: { expr: Expr, to: string }): never => {
    throw `Could not cast expression '${expr.type}' to '${to}'`
}
