import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context, ISOLATED_POSITION} from "tests/utils/create_expression_test_context";

describe("$count", () => {
    test("returns zero for an empty creature list", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        bind_owner(create_test_creature({name: "lonely", position: ISOLATED_POSITION}))

        expect(EXPR.as_number(evaluate_expression("$count($adjacent_creatures(owner))"))).toBe(0)
    })

    test("returns the number of creatures in the list", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const creature = create_test_creature({name: "creature"})

        expect(EXPR.as_number(evaluate_expression(`$count($creature_by_id(${creature.id}))`))).toBe(1)
    })

    test("throws when the parameter is not a creature list", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$count(5)")).toThrow()
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$count(5, 6)")).toThrow(/expected '1' parameters/)
    })
})
