import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {AstNodeKeyword} from "scripts/expressions/parser/nodes/AstNodeKeyword";
import {AstNodeString} from "scripts/expressions/parser/nodes/AstNodeString";

export const AST_NODE = {
    as_keyword: (node: AstNode): AstNodeKeyword => {
        if (node.type === "keyword") return node
        throw Error(`Cannot cast ast node to "keyword"`)
    },
    as_string: (node: AstNode): AstNodeString => {
        if (node.type === "string") return node
        throw Error(`Cannot cast ast node to "string"`)
    }
}