import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("owner keyword", () => {
    test("resolves to the bound creature", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        const owner = create_test_creature({name: "owner"})
        bind_owner(owner)

        expect(EXPR.as_creature(evaluate_expression("owner"))).toBe(owner)
    })

    test("resolves a property on the bound creature", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        const owner = create_test_creature({name: "owner", level: 7})
        bind_owner(owner)

        expect(EXPR.as_number(evaluate_expression("owner.level"))).toBe(7)
    })

    test("throws when owner is not bound", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("owner")).toThrow()
    })
})
