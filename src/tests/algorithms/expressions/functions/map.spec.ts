import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Position} from "core/battlegrid/Position";
import {
    ADJACENT_TO_ISOLATED_POSITION,
    create_expression_test_context,
    ISOLATED_POSITION,
} from "tests/utils/create_expression_test_context";

const DISTANT_POSITION = {x: 6, y: 3, footprint: 1} as const satisfies Position

const get_number_values = (expression: string, evaluate_expression: ReturnType<typeof create_expression_test_context>["evaluate_expression"]) =>
    EXPR.as_numbers_resolved_expr(evaluate_expression(expression)).map(number => number.value)

describe("$map", () => {
    test("evaluates the expression for each creature in the list", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: ISOLATED_POSITION})
        const near = create_test_creature({name: "near", position: ADJACENT_TO_ISOLATED_POSITION})
        const far = create_test_creature({name: "far", position: DISTANT_POSITION})

        bind_creature(SYSTEM_KEYWORD.ATTACKER, attacker)
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: [near, far]})

        expect(get_number_values(
            "$map(targets, x, $distance(x, attacker))",
            evaluate_expression,
        )).toEqual([1, 3])
    })

    test("accepts a string variable name", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: ISOLATED_POSITION})
        const near = create_test_creature({name: "near", position: ADJACENT_TO_ISOLATED_POSITION})

        bind_creature(SYSTEM_KEYWORD.ATTACKER, attacker)
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: [near]})

        expect(get_number_values(
            `$map(targets, "x", $distance(x, attacker))`,
            evaluate_expression,
        )).toEqual([1])
    })

    test("returns an empty list for an empty creature list", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        bind_creature(SYSTEM_KEYWORD.ATTACKER, create_test_creature({name: "attacker"}))
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: []})

        expect(get_number_values(
            "$map(targets, x, $distance(x, attacker))",
            evaluate_expression,
        )).toEqual([])
    })

    test("throws when the creature list parameter is not a creature list", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$map(5, x, $add(1, 1))")).toThrow()
    })

    test("throws when the variable name is not a keyword or string", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        bind_creature(SYSTEM_KEYWORD.ATTACKER, create_test_creature({name: "attacker"}))
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: []})

        expect(() => evaluate_expression("$map(targets, 5, $add(1, 1))")).toThrow(/expected keyword or string/)
    })

    test("throws when the mapped expression does not evaluate to a number", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", team: 1})
        const enemy = create_test_creature({name: "enemy", team: 2})

        bind_creature(SYSTEM_KEYWORD.ATTACKER, attacker)
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: [enemy]})

        expect(() => evaluate_expression("$map(targets, x, $is_ally(x, attacker))")).toThrow()
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression, create_test_creature, bind_creature, game_state} = create_expression_test_context()
        bind_creature(SYSTEM_KEYWORD.ATTACKER, create_test_creature({name: "attacker"}))
        game_state.vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: []})

        expect(() => evaluate_expression("$map(targets, x)")).toThrow(/expected '3' parameters/)
    })
})
