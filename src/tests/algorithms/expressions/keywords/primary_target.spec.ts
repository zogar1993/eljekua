import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("primary_target keyword", () => {
    test("resolves to the bound creature", () => {
        const {evaluate_expression, create_test_creature, bind_primary_target} = create_expression_test_context()
        const target = create_test_creature({name: "target"})
        bind_primary_target(target)

        expect(EXPR.as_creature(evaluate_expression("primary_target"))).toBe(target)
    })

    test("throws when primary_target is not bound", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("primary_target")).toThrow()
    })
})
