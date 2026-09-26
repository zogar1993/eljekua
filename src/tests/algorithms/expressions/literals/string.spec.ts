import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("string literal", () => {
    test("evaluates to a string", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(EXPR.as_string(evaluate_expression(`"kobold"`))).toBe("kobold")
    })
})
