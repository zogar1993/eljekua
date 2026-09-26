import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("$is_race", () => {
    test("is true when the creature race matches", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const kobold = create_test_creature({name: "kobold", race: "kobold"})

        expect(EXPR.as_boolean(evaluate_expression(
            `$is_race($creature_by_id(${kobold.id}), "kobold")`,
        ))).toBe(true)
    })

    test("is false when the race does not match", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const kobold = create_test_creature({name: "kobold", race: "kobold"})

        expect(EXPR.as_boolean(evaluate_expression(
            `$is_race($creature_by_id(${kobold.id}), "human")`,
        ))).toBe(false)
    })

    test("is false when the creature has no race", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const unknown = create_test_creature({name: "unknown", race: null})

        expect(EXPR.as_boolean(evaluate_expression(
            `$is_race($creature_by_id(${unknown.id}), "kobold")`,
        ))).toBe(false)
    })

    test("throws when the race parameter is not a string", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const creature = create_test_creature({name: "creature"})

        expect(() => evaluate_expression(
            `$is_race($creature_by_id(${creature.id}), $creature_by_id(${creature.id}))`,
        )).toThrow()
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const creature = create_test_creature({name: "creature"})

        expect(() => evaluate_expression(`$is_race($creature_by_id(${creature.id}))`)).toThrow(/expected '2' parameters/)
    })
})
