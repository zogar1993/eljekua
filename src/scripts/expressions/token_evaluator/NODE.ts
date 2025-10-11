import {
    AstNode,
    AstNodeBoolean,
    AstNodeCreature,
    AstNodeNumber,
    AstNodeNumberResolved,
    AstNodePosition,
    AstNodePositions,
    AstNodePower,
    AstNodeString
} from "scripts/expressions/token_evaluator/types";
import {Creature} from "scripts/battlegrid/creatures/Creature";

export const NODE = {
    as_creature: (node: AstNode): AstNodeCreature => {
        if (node.type === "creature") return node
        return throw_could_not_cast({node, to: "creature"})
    },
    as_creatures: (node: AstNode): Array<Creature> => {
        if (node.type === "creature") return [node.value]
        if (node.type === "creatures") return node.value
        return throw_could_not_cast({node, to: "creatures"})
    },
    as_number: (node: AstNode): AstNodeNumber => {
        if (node.type === "number_resolved") return node
        if (node.type === "number_unresolved") return node
        return throw_could_not_cast({node, to: "number"})
    },
    as_number_resolved: (node: AstNode): AstNodeNumberResolved => {
        if (node.type === "number_resolved") return node
        return throw_could_not_cast({node, to: "number_resolved"})
    },
    as_boolean: (node: AstNode): AstNodeBoolean => {
        if (node.type === "boolean") return node
        return throw_could_not_cast({node, to: "boolean"})
    },
    as_position: (node: AstNode): AstNodePosition => {
        if (node.type === "position") return node
        return throw_could_not_cast({node, to: "position"})
    },
    as_positions: (node: AstNode): AstNodePositions => {
        if (node.type === "positions") return node
        return throw_could_not_cast({node, to: "positions"})
    },
    as_string: (node: AstNode): AstNodeString => {
        if (node.type === "string") return node
        return throw_could_not_cast({node, to: "string"})
    },
    as_power: (node: AstNode): AstNodePower => {
        if (node.type === "power") return node
        return throw_could_not_cast({node, to: "power"})
    }
}

const throw_could_not_cast = ({node, to}: { node: AstNode, to: string }): never => {
    throw `Could not cast node '${node.type}' to '${to}'`
}
