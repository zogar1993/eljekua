import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Position} from "core/battlegrid/Position";
import type {ExprNumbers} from "core/virtual_machine/expressions/types";
import {
    ADJACENT_TO_ISOLATED_POSITION,
    create_expression_test_context,
    ISOLATED_POSITION,
} from "tests/utils/create_expression_test_context";

const DISTANT_POSITION = {x: 6, y: 3, footprint: 1} as const satisfies Position

const bind_numbers = (game_state: ReturnType<typeof create_expression_test_context>["game_state"], value: ExprNumbers["value"]) => {
    game_state.vm_state.set_variable("numbers", {type: "numbers", value})
}

describe("$min", () => {
    test("returns the smallest number in the list", () => {
        const {evaluate_expression, game_state} = create_expression_test_context()
        bind_numbers(game_state, [
            {type: "number_resolved", value: 5, description: "five"},
            {type: "number_resolved", value: 2, description: "two"},
            {type: "number_resolved", value: 8, description: "eight"},
        ])

        expect(EXPR.as_number(evaluate_expression("$min(numbers)"))).toBe(2)
    })

    test("returns the only number when the list has one element", () => {
        const {evaluate_expression, game_state} = create_expression_test_context()
        bind_numbers(game_state, [
            {type: "number_resolved", value: 4, description: "four"},
        ])

        expect(EXPR.as_number(evaluate_expression("$min(numbers)"))).toBe(4)
    })

    test("returns the minimum distance produced by map", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: ISOLATED_POSITION})
        const near = create_test_creature({name: "near", position: ADJACENT_TO_ISOLATED_POSITION})
        const far = create_test_creature({name: "far", position: DISTANT_POSITION})

        bind_creature(SYSTEM_KEYWORD.TRIGGER_ACTIVATOR, attacker)
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: [near, far, attacker]})

        expect(EXPR.as_number(evaluate_expression(
            "$min($map(targets, x, $distance(x, trigger_activator)))",
        ))).toBe(0)
    })

    test("returns a single resolved number parameter", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(EXPR.as_number(evaluate_expression("$min(5)"))).toBe(5)
    })

    test("returns the minimum across multiple parameters", () => {
        const {evaluate_expression, game_state} = create_expression_test_context()
        bind_numbers(game_state, [
            {type: "number_resolved", value: 5, description: "five"},
            {type: "number_resolved", value: 2, description: "two"},
        ])

        expect(EXPR.as_number(evaluate_expression("$min(numbers, 8)"))).toBe(2)
    })

    test("throws when the number list is empty", () => {
        const {evaluate_expression, game_state} = create_expression_test_context()
        bind_numbers(game_state, [])

        expect(() => evaluate_expression("$min(numbers)")).toThrow(/Expected array to not be empty/)
    })

    test("throws when a parameter is not a number", () => {
        const {evaluate_expression, create_test_creature, bind_owner} = create_expression_test_context()
        bind_owner(create_test_creature({name: "owner"}))

        expect(() => evaluate_expression("$min(owner)")).toThrow(/Could not cast expression/)
    })
})
