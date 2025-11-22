import {
    AstNode,
    AstNodeBoolean,
    AstNodeCreatures,
    AstNodeNumber,
    AstNodeNumberResolved,
    AstNodePositions,
    AstNodePower,
    AstNodeString
} from "scripts/expressions/token_evaluator/types";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Position} from "scripts/battlegrid/Position";

//TODO P3 refactor remaining non _node as_ functions
export const NODE = {
    as_creatures_node: (node: AstNode): AstNodeCreatures => {
        if (node.type === "creatures") return node
        return throw_could_not_cast({node, to: "creatures"})
    },
    as_creature: (node: AstNode): Creature => {
        if (node.type === "creatures") {
            if(node.value.length === 1) return node.value[0]
            throw Error("expected only one creature in node")
        }
        return throw_could_not_cast({node, to: "creatures"})
    },
    as_creatures: (node: AstNode): Array<Creature> => {
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
    as_position: (node: AstNode): Position => {
        if (node.type === "positions") {
            if(node.value.length === 1) return node.value[0]
            throw Error("expected only one position in node")
        }
        return throw_could_not_cast({node, to: "position"})
    },
    as_positions: (node: AstNode): Array<Position> => {
        if (node.type === "positions") return node.value
        return throw_could_not_cast({node, to: "positions"})
    },
    as_positions_node: (node: AstNode): AstNodePositions => {
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
