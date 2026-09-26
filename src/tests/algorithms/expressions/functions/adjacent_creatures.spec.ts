import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {
    ADJACENT_TO_ISOLATED_POSITION,
    ISOLATED_POSITION,
    create_expression_test_context,
} from "tests/utils/create_expression_test_context";

describe("$adjacent_creatures", () => {
    test("returns adjacent creatures excluding the source", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        const owner = create_test_creature({name: "owner", position: ISOLATED_POSITION})
        const neighbor = create_test_creature({name: "neighbor", position: ADJACENT_TO_ISOLATED_POSITION})
        bind_owner(owner)

        expect(EXPR.as_creatures(evaluate_expression("$adjacent_creatures(owner)"))).toEqual([neighbor])
    })

    test("returns an empty list when there are no adjacent creatures", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        bind_owner(create_test_creature({name: "owner", position: ISOLATED_POSITION}))

        expect(EXPR.as_creatures(evaluate_expression("$adjacent_creatures(owner)"))).toEqual([])
    })

    test("throws when the parameter is not a creature", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$adjacent_creatures(5)")).toThrow()
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const a = create_test_creature({name: "a"})
        const b = create_test_creature({name: "b"})

        expect(() => evaluate_expression(
            `$adjacent_creatures($creature_by_id(${a.id}), $creature_by_id(${b.id}))`,
        )).toThrow(/expected '1' parameters/)
    })
})
