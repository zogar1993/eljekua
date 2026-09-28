import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context, IRRELEVANT_POSITIONS} from "tests/utils/create_expression_test_context";

describe("$is_ally", () => {
    test("is true when both creatures share a non-null team", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const a = create_test_creature({name: "a", position: IRRELEVANT_POSITIONS[0], team: 1})
        const b = create_test_creature({name: "b", position: IRRELEVANT_POSITIONS[1], team: 1})

        expect(EXPR.as_boolean(evaluate_expression(
            `$is_ally($creature_by_id(${a.id}), $creature_by_id(${b.id}))`,
        ))).toBe(true)
    })

    test("is false when creatures are on different teams", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const a = create_test_creature({name: "a", position: IRRELEVANT_POSITIONS[0], team: 1})
        const b = create_test_creature({name: "b", position: IRRELEVANT_POSITIONS[1], team: 2})

        expect(EXPR.as_boolean(evaluate_expression(
            `$is_ally($creature_by_id(${a.id}), $creature_by_id(${b.id}))`,
        ))).toBe(false)
    })

    test("is false when either creature has no team", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const a = create_test_creature({name: "a", position: IRRELEVANT_POSITIONS[0], team: 1})
        const b = create_test_creature({name: "b", position: IRRELEVANT_POSITIONS[1], team: null})

        expect(EXPR.as_boolean(evaluate_expression(
            `$is_ally($creature_by_id(${a.id}), $creature_by_id(${b.id}))`,
        ))).toBe(false)
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$is_ally(owner)")).toThrow(/expected '2' parameters/)
    })
})
