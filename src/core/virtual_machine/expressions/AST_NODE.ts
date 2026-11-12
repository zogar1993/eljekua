import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import type {AstNodeString} from "core/expressions/parser/nodes/AstNodeString";
import {to_ast} from "core/expressions/parser/to_ast";
import type {AstNodeNumber} from "core/expressions/parser/nodes/AstNodeNumber";
import {assert_is_type} from "stdlib/assert";

export const AST_NODE = {
    as_keyword: (node: AstNode): AstNodeKeyword => {
        assert_is_type(node, "keyword")
        return node
    },
    as_string: (node: AstNode): AstNodeString => {
        assert_is_type(node, "string")
        return node
    },
    as_number: (node: AstNode): AstNodeNumber => {
        assert_is_type(node, "number")
        return node
    }
}

export const SYSTEM_KEYWORD = {
    OWNER: "owner",
    POWER_NAME: "power_name",
    CURRENT_POWER: "current_power",
    PRIMARY_TARGET: "primary_target",
    TRIGGER_ACTIVATOR: "trigger_activator",
    TRIGGER_OWNER: "trigger_owner",
    TARGETS: "targets",
    HIT_STATUS: "hit_status",
    ATTACK_D20_ROLLS: "attack_d20_rolls",
    FILTER_CREATURE: "filter_creature",
} as const

export const AST = {
    OWNER: to_ast(SYSTEM_KEYWORD.OWNER)
} as const
