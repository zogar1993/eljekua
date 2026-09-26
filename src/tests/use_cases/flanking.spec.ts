import {
    Power,
    transform_power_ir_into_vm_representation,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const FLANKING_ATTACKER_POSITION = {x: 0, y: 1, footprint: 1} as const
const FLANKING_TARGET_POSITION = {x: 1, y: 1, footprint: 1} as const
const FLANKING_PARTNER_POSITION = {x: 2, y: 1, footprint: 1} as const

const ZERO_ATTRIBUTES = Object.fromEntries(
    Object.values(ATTRIBUTES).map(attribute => [attribute, 10]),
) as CreatureData["attributes"]

let last_attack: ExprNumberResolved | undefined
let start_battle: ReturnType<typeof create_test_game>["start_battle"]
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let given_creature: ReturnType<typeof create_creature_test_helpers>["given_creature"]
let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]

beforeEach(() => {
    last_attack = undefined
    const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.RIGGED_ROLL})
    test_game.game_events.on_creature_attacked.add_handler(({attack}) => {
        last_attack = attack
    })
    start_battle = test_game.start_battle
    const helpers = create_creature_test_helpers({
        creatures: test_game.creatures,
        instruction_loop: test_game.instruction_loop,
        vm_state: test_game.vm_state,
        add_creature_to_game: test_game.add_creature_to_game,
        set_current_turn_to_creature: test_game.set_current_turn_to_creature,
        default_attribute_value: 10,
    })
    given_a_creature_is_created = helpers.given_a_creature_is_created
    given_creature = helpers.given_creature
    when_creature = helpers.when_creature
})

describe("combat advantage", () => {
    test("combat advantage from flanking and a granted status does not stack", () => {
        given_a_creature_is_created({
            name: "calendula",
            team: 1,
            position: FLANKING_ATTACKER_POSITION,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK, GRANT_COMBAT_ADVANTAGE_UNTIL_NEXT_TURN],
        })
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: FLANKING_PARTNER_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_a_creature_is_created({
            name: "ragoz",
            team: 2,
            position: FLANKING_TARGET_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_creature("calendula").is_in_its_turn()

        when_creature("calendula").selects_action("Grant Combat Advantage")
        when_creature("calendula").selects_target("ragoz")

        when_creature("calendula").selects_action("Attack")
        when_creature("calendula").selects_target("ragoz")
        when_creature("calendula").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(2)
    })
})

describe("flanking", () => {
    test("two creatures flanking a target grants combat advantage to the attacker", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: FLANKING_ATTACKER_POSITION,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK],
        })
        given_a_creature_is_created({
            name: "calendula",
            team: 1,
            position: FLANKING_PARTNER_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_a_creature_is_created({
            name: "ragoz",
            team: 2,
            position: FLANKING_TARGET_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(2)
    })
})

describe("who counts as a flanker", () => {
    test("combat advantage is not granted when the flanker is an ally of the target", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: FLANKING_ATTACKER_POSITION,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK],
        })
        given_a_creature_is_created({
            name: "calendula",
            team: 2,
            position: FLANKING_PARTNER_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_a_creature_is_created({
            name: "ragoz",
            team: 2,
            position: FLANKING_TARGET_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(0)
    })

    test("combat advantage is granted when the flanker is neutral relative to the target", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: FLANKING_ATTACKER_POSITION,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK],
        })
        given_a_creature_is_created({
            name: "calendula",
            team: null,
            position: FLANKING_PARTNER_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_a_creature_is_created({
            name: "ragoz",
            team: 2,
            position: FLANKING_TARGET_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(2)
    })

    test("combat advantage is granted when the flanker is on a different team from both attacker and target", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: FLANKING_ATTACKER_POSITION,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK],
        })
        given_a_creature_is_created({
            name: "calendula",
            team: 3,
            position: FLANKING_PARTNER_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_a_creature_is_created({
            name: "ragoz",
            team: 2,
            position: FLANKING_TARGET_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(2)
    })
})

describe("granted combat advantage", () => {
    test("a granted effect adds +2 to the attack roll and lasts for the power's duration", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: FLANKING_ATTACKER_POSITION,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK, GRANT_COMBAT_ADVANTAGE_UNTIL_NEXT_TURN],
        })
        given_a_creature_is_created({
            name: "ragoz",
            team: 2,
            position: FLANKING_TARGET_POSITION,
            attributes: ZERO_ATTRIBUTES,
        })
        given_creature("linuar").is_in_its_turn()

        when_creature("linuar").selects_action("Grant Combat Advantage")
        when_creature("linuar").selects_target("ragoz")

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(2)

        when_creature("linuar").selects_action("End turn")
        when_creature("ragoz").selects_action("End turn")

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(combat_advantage_bonus(last_attack)).toBe(0)
    })
})

const combat_advantage_bonus = (attack: ExprNumberResolved | undefined): number => {
    if (!attack?.params) return 0
    return attack.params
        .filter((part): part is ExprNumberResolved => part.type === "number_resolved" && part.description === "Combat Advantage")
        .reduce((total, part) => total + part.value, 0)
}

const MELEE_ATTACK: Power = transform_power_ir_into_vm_representation({
    name: "Attack",
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    roll: {
        attack: "0",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "1",
                target: "primary_target",
            },
        ],
    },
})

const GRANT_COMBAT_ADVANTAGE_UNTIL_NEXT_TURN: Power = transform_power_ir_into_vm_representation({
    name: "Grant Combat Advantage",
    type: {action: "minor", cooldown: "at-will", attack: false},
    targeting: {targeting_type: "melee_weapon", target_type: "creature", amount: 1},
    effect: [
        {
            type: INSTRUCTION_TYPE.APPLY_STATUS,
            target: "primary_target",
            duration: "until_start_of_next_turn",
            status: {type: "grant_combat_advantage"},
        },
    ],
})

//TODO check if combat advantage should apply even when the attacker is not the one flanking
