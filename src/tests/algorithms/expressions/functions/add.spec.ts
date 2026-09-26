import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("$add", () => {
    test("sums resolved number parameters", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(EXPR.as_number(evaluate_expression("$add(2, 3, 4)"))).toBe(9)
    })

    test("throws when a parameter is not a number", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        bind_owner(create_test_creature({name: "owner"}))

        expect(() => evaluate_expression("$add(owner, 2)")).toThrow(/not all params evaluate to numbers/)
    })
})
