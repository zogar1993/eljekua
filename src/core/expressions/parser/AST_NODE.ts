import {AstNode} from "core/expressions/parser/nodes/AstNode";
import {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import {AstNodeString} from "core/expressions/parser/nodes/AstNodeString";
import {to_ast} from "core/expressions/parser/to_ast";
import {AstNodeNumber} from "core/expressions/parser/nodes/AstNodeNumber";

export const AST_NODE = {
    as_keyword: (node: AstNode): AstNodeKeyword => {
        if (node.type === "keyword") return node
        throw Error(`Cannot cast ast node ${JSON.stringify(node)} to "keyword"`)
    },
    as_string: (node: AstNode): AstNodeString => {
        if (node.type === "string") return node
        throw Error(`Cannot cast ast node ${JSON.stringify(node)} to "string"`)
    },
    as_number: (node: AstNode): AstNodeNumber => {
        if (node.type === "number") return node
        throw Error(`Cannot cast ast node ${JSON.stringify(node)} to "number"`)
    }
}

export const SYSTEM_KEYWORD = {
    OWNER: "owner",
    PRIMARY_TARGET: "primary_target",
    TRIGGERER: "triggerer",
    HIT_STATUS: "hit_status",
    EXCLUDED_FROM_REACTING: "excluded_from_reacting"
} as const

export const AST = {
    OWNER: to_ast(SYSTEM_KEYWORD.OWNER)
} as const