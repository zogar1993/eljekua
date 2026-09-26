import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {IRRELEVANT_POSITIONS, create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("$are_enemies", () => {
    test("is false for allies", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const a = create_test_creature({name: "a", position: IRRELEVANT_POSITIONS[0], team: 1})
        const b = create_test_creature({name: "b", position: IRRELEVANT_POSITIONS[1], team: 1})

        expect(EXPR.as_boolean(evaluate_expression(
            `$are_enemies($creature_by_id(${a.id}), $creature_by_id(${b.id}))`,
        ))).toBe(false)
    })

    test("is true for enemies", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const a = create_test_creature({name: "a", position: IRRELEVANT_POSITIONS[0], team: 1})
        const b = create_test_creature({name: "b", position: IRRELEVANT_POSITIONS[1], team: 2})

        expect(EXPR.as_boolean(evaluate_expression(
            `$are_enemies($creature_by_id(${a.id}), $creature_by_id(${b.id}))`,
        ))).toBe(true)
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$are_enemies(owner)")).toThrow(/expected '2' parameters/)
    })
})
