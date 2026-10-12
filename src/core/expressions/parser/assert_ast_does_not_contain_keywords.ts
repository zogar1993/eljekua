import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {assert_is_not_included} from "stdlib/assert";

export const assert_ast_does_not_contain_keywords = (node: AstNode, forbidden_keywords: Array<string>) => {
    if (node.type === "keyword")
        assert_is_not_included(node.value, forbidden_keywords)

    if (node.type === "function")
        for (const parameter of node.parameters)
            assert_ast_does_not_contain_keywords(parameter, forbidden_keywords)
}
