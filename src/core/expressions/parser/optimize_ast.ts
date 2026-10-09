import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {FUNCTION_NAME} from "core/expressions/function_names";

const flatten_add_parameters = (parameters: Array<AstNode>): Array<AstNode> => {
    const flattened: Array<AstNode> = []
    for (const parameter of parameters) {
        if (parameter.type === "function" && parameter.name === FUNCTION_NAME.ADD)
            flattened.push(...flatten_add_parameters(parameter.parameters))
        else
            flattened.push(parameter)
    }
    return flattened
}

export const optimize_ast = (node: AstNode): AstNode => {

    switch (node.type) {
        case "function":
            switch (node.name) {
                case FUNCTION_NAME.ADD:
                    return {type: "function", name: node.name, parameters: flatten_add_parameters(node.parameters)}
            }
    }

    return node
}
