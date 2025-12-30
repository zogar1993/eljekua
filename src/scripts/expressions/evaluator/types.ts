import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {Position} from "scripts/battlegrid/Position";
import {PowerVM} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";

export type Expr =
    ExprNumber
    | ExprString
    | ExprBoolean
    | ExprCreatures
    | ExprPositions
    | ExprPower
    | ExprHitStatus

export type ExprNumber = ExprNumberUnresolved | ExprNumberResolved

export type ExprNumberUnresolved = {
    type: "number_unresolved"
    min: number
    max: number
    description: string
    params?: Array<Expr>
}

export type ExprNumberResolved = {
    type: "number_resolved"
    value: number
    description: string
    params?: Array<Expr>
}

export type ExprString = {
    type: "string",
    value: string
    description: string
}

export type ExprCreatures = {
    type: "creatures"
    value: Array<Creature>
}

export type ExprBoolean = {
    type: "boolean"
    value: boolean
    description?: string
    params?: Array<Expr>
}

export type ExprPositions = {
    type: "positions"
    value: Array<Position>
    description: string
    params?: Array<Expr>
}

export type ExprPower = {
    type: "power"
    value: PowerVM
}

export type ExprHitStatus = {
    type: "hit_status"
    value: HitStatus
}
