import {
    AstNode,
    AstNodeBoolean,
    AstNodeCreature,
    AstNodeNumber,
    AstNodeNumberResolved, AstNodePosition,
    AstNodePositions
} from "interpreter/types";

export const NODE = {
    as_creature: (node: AstNode): AstNodeCreature => {
        if (node.type === "creature") return node
        throw Error(`Cannot cast node to "creature"`)
    },
    as_number: (node: AstNode): AstNodeNumber => {
        if (node.type === "number_resolved") return node
        if (node.type === "number_unresolved") return node
        throw Error(`Cannot cast node to "number"`)
    },
    as_number_resolved: (node: AstNode): AstNodeNumberResolved => {
        if (node.type === "number_resolved") return node
        throw Error(`Cannot cast node to "number_resolved"`)
    },
    as_boolean: (node: AstNode): AstNodeBoolean => {
        if (node.type === "boolean") return node
        throw Error(`Cannot cast node to "boolean"`)
    },
    as_position: (node: AstNode): AstNodePosition => {
        if (node.type === "position") return node
        throw Error(`Cannot cast node to "position"`)
    },
    as_positions: (node: AstNode): AstNodePositions => {
        if (node.type === "positions") return node
        throw Error(`Cannot cast node to "positions"`)
    }
}
