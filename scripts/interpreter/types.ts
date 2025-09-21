import type {Token} from "tokenizer/tokens/AnyToken";
import type {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import type {Creature} from "battlegrid/creatures/Creature";
import type {Position} from "battlegrid/Position";
import type {AstNodePosition} from "interpreter/ast_node_position";

export type InterpretProps<T extends Token> = {
    token: T,
    player_turn_handler: PlayerTurnHandler
}

export type AstNode =
    AstNodeNumber
    | AstNodeString
    | AstNodeBoolean
    | AstNodeCreature
    | AstNodePosition
    | AstNodePositions

export type AstNodeString = {
    type: "string",
    value: string
    description: string
}

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

export type AstNodeCreature = {
    type: "creature"
    value: Creature
    description: string
}

export type AstNodeBoolean = {
    type: "boolean"
    value: boolean
    description: string
    params?: Array<AstNode>
}

export type AstNodePositions = {
    type: "positions"
    value: Array<Position>
    description: string
    params?: Array<AstNode>
}
