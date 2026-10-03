import {add_creature_status} from "core/battlegrid/creatures/Creature";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {
    create_expression_test_context,
    IRRELEVANT_POSITIONS,
    ISOLATED_POSITION,
} from "tests/utils/create_expression_test_context";

const FLANKING_ATTACKER_POSITION = {x: 0, y: 1, footprint: 1} as const
const FLANKING_TARGET_POSITION = {x: 1, y: 1, footprint: 1} as const
const FLANKING_PARTNER_POSITION = {x: 2, y: 1, footprint: 1} as const

const evaluate_has_combat_advantage = (
    evaluate_expression: ReturnType<typeof create_expression_test_context>["evaluate_expression"],
    attacker_id: number,
    defender_id: number,
) => EXPR.as_boolean(evaluate_expression(
    `$has_combat_advantage($creature_by_id(${attacker_id}), $creature_by_id(${defender_id}))`,
))

describe("$has_combat_advantage", () => {
    test("is false when neither flanking nor a granted status applies", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: IRRELEVANT_POSITIONS[0], team: 1})
        const defender = create_test_creature({name: "defender", position: IRRELEVANT_POSITIONS[1], team: 2})

        expect(evaluate_has_combat_advantage(evaluate_expression, attacker.id, defender.id)).toBe(false)
    })

    test("is true when the attacker is flanking the defender", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: FLANKING_ATTACKER_POSITION, team: 1})
        create_test_creature({name: "flank_partner", position: FLANKING_PARTNER_POSITION, team: 1})
        const defender = create_test_creature({name: "defender", position: FLANKING_TARGET_POSITION, team: 2})

        expect(evaluate_has_combat_advantage(evaluate_expression, attacker.id, defender.id)).toBe(true)
    })

    test("is true when the defender grants combat advantage against the attacker", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: IRRELEVANT_POSITIONS[0], team: 1})
        const defender = create_test_creature({name: "defender", position: IRRELEVANT_POSITIONS[1], team: 2})
        add_creature_status({
            creature: defender,
            status: {
                durations: [],
                rule: {type: "grant_combat_advantage", against_creatures: [attacker]},
            },
        })

        expect(evaluate_has_combat_advantage(evaluate_expression, attacker.id, defender.id)).toBe(true)
    })

    test("is true when the defender grants combat advantage against all attackers", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: IRRELEVANT_POSITIONS[0], team: 1})
        const defender = create_test_creature({name: "defender", position: IRRELEVANT_POSITIONS[1], team: 2})
        add_creature_status({
            creature: defender,
            status: {
                durations: [],
                rule: {type: "grant_combat_advantage", against_creatures: null},
            },
        })

        expect(evaluate_has_combat_advantage(evaluate_expression, attacker.id, defender.id)).toBe(true)
    })

    test("is false when the defender grants combat advantage against a different attacker", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const attacker = create_test_creature({name: "attacker", position: ISOLATED_POSITION, team: 1})
        const other_attacker = create_test_creature({name: "other_attacker", position: IRRELEVANT_POSITIONS[0], team: 1})
        const defender = create_test_creature({name: "defender", position: IRRELEVANT_POSITIONS[1], team: 2})
        add_creature_status({
            creature: defender,
            status: {
                durations: [],
                rule: {type: "grant_combat_advantage", against_creatures: [other_attacker]},
            },
        })

        expect(evaluate_has_combat_advantage(evaluate_expression, attacker.id, defender.id)).toBe(false)
    })

    test("throws with the wrong parameter count", () => {
        const {evaluate_expression} = create_expression_test_context()

        expect(() => evaluate_expression("$has_combat_advantage(owner)")).toThrow(/expected '2' parameters/)
    })

    test("throws when a parameter is not a creature", () => {
        const {evaluate_expression, create_test_creature} = create_expression_test_context()
        const defender = create_test_creature({name: "defender"})

        expect(() => evaluate_expression(
            `$has_combat_advantage(5, $creature_by_id(${defender.id}))`,
        )).toThrow()
    })
})
