import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {
    ADJACENT_TO_ISOLATED_POSITION,
    create_expression_test_context,
    ISOLATED_POSITION,
} from "tests/utils/create_expression_test_context";

describe("$filter_creatures", () => {
    test("keeps creatures that satisfy the condition", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        const owner = create_test_creature({name: "owner", position: ISOLATED_POSITION, team: 1})
        const ally = create_test_creature({name: "ally", position: ADJACENT_TO_ISOLATED_POSITION, team: 1})
        bind_owner(owner)

        expect(EXPR.as_creatures(evaluate_expression(
            `$filter_creatures($adjacent_creatures(owner), $is_ally(owner, filter_creature))`,
        ))).toEqual([ally])
    })

    test("returns an empty list when no creatures satisfy the condition", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        const owner = create_test_creature({name: "owner", position: ISOLATED_POSITION, team: 2})
        create_test_creature({name: "neighbor", position: ADJACENT_TO_ISOLATED_POSITION, team: 1})
        bind_owner(owner)

        expect(EXPR.as_creatures(evaluate_expression(
            `$filter_creatures($adjacent_creatures(owner), $is_ally(owner, filter_creature))`,
        ))).toEqual([])
    })

    test("throws when the creature list parameter is not a creature list", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$filter_creatures(5, $add(1, 1))")).toThrow()
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        bind_owner(create_test_creature({name: "owner"}))

        expect(() => evaluate_expression("$filter_creatures($adjacent_creatures(owner))")).toThrow(/expected '2' parameters/)
    })
})
