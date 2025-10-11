import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {Position} from "scripts/battlegrid/Position";
import {PowerVM} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";

export type AstNode =
    AstNodeNumber
    | AstNodeString
    | AstNodeBoolean
    | AstNodeCreature
    | AstNodeCreatures
    | AstNodePosition
    | AstNodePositions
    | AstNodePower

export type AstNodeNumber = AstNodeNumberUnresolved | AstNodeNumberResolved

export type AstNodeNumberUnresolved = {
    type: "number_unresolved"
    min: number
    max: number
    description: string
    params?: Array<AstNode>
}

export type AstNodeNumberResolved = {
    type: "number_resolved"
    value: number
    description: string
    params?: Array<AstNode>
}

export type AstNodeString = {
    type: "string",
    value: string
    description: string
}

export type AstNodeCreature = {
    type: "creature"
    value: Creature
    description: string
}

export type AstNodeCreatures = {
    type: "creatures"
    value: Array<Creature>
    description: string
}

export type AstNodeBoolean = {
    type: "boolean"
    value: boolean
    description?: string
    params?: Array<AstNode>
}

export type AstNodePosition = {
    type: "position",
    value: Position
    description: string
}

export type AstNodePositions = {
    type: "positions"
    value: Array<Position>
    description: string
    params?: Array<AstNode>
}

export type AstNodePower = {
    type: "power"
    value: PowerVM
}
