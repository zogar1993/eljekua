import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("$creature_by_id", () => {
    test("returns the creature with the given id", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const creature = create_test_creature({name: "creature"})

        expect(EXPR.as_creature(evaluate_expression(`$creature_by_id(${creature.id})`))).toBe(creature)
    })

    test("throws for an invalid creature id", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$creature_by_id(99)")).toThrow(/out of bounds/)
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const creature = create_test_creature({name: "creature"})

        expect(() => evaluate_expression(`$creature_by_id(${creature.id}, 2)`)).toThrow(/expected '1' parameters/)
    })
})
