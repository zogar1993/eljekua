import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("number literal", () => {
    test("evaluates zero", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(EXPR.as_number(evaluate_expression("0"))).toBe(0)
    })

    test("evaluates a positive number", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(EXPR.as_number(evaluate_expression("5"))).toBe(5)
    })
})
