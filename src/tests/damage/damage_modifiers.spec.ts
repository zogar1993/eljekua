import {
    Power,
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";
import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";

const POSITION_LINUAR = {x: 3, y: 4, footprint: 1} as const
const POSITION_RAGOZ = {x: 4, y: 4, footprint: 1} as const

let start_battle: ReturnType<typeof create_test_game>["start_battle"]
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]
let then_creature: ReturnType<typeof create_creature_test_helpers>["then_creature"]

beforeEach(() => {
    const test_game = create_test_game({attack_roll_resolution_is_random: false})
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
    when_creature = helpers.when_creature
    then_creature = helpers.then_creature
})

describe("damage resistance", () => {
    test("typed damage is reduced against resistant creatures", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: 1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(7)
    })

    test("untyped damage is not reduced by typed resistances", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: 1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(6)
    })

    test("dual type damage only considers lower resistance", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE, NECROTIC)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: 1, necrotic: 2}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(7)
    })
})

describe("damage vulnerability", () => {
    test("typed damage is increased against vulnerable creatures", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: -1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(5)
    })

    test("untyped damage is not increased by typed vulnerability", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: -1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(6)
    })

    test("dual type damage only considers higher vulnerability", () => {

        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE, NECROTIC)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: -1, necrotic: -2}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(4)
    })
})

describe("resistance and vulnerability cancel each other", () => {
    test("when a is more resistant than vulnerable, vulnerability is subtracted from resistance", () => {
        const linuar_powers: Array<Power> = [DEAL_DAMAGE(FIRE), APPLY_VULNERABILITY(LESSER, FIRE)]
        const ragoz_resistances: {[FIRE: GREATER]}
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: linuar_powers})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: ragoz_resistances})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(5)
    })
})

const DEAL_DAMAGE = (...types: Array<string>) => transform_power_ir_into_vm_representation({
    name: "Deal Damage",
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    effect: [
        {type: "set_hit_status", target: "primary_target", status: 1},
        {type: "apply_damage", value: "4", target: "primary_target", damage_types: types},
    ],
})

const FIRE = "fire"
const NECROTIC = "necrotic"

const PETTY = 1
const LESSER = 2
const GREATER = 3

const GAIN_RESISTANCE = (amount: number, ...types: Array<string>) => transform_power_ir_into_vm_representation({
    name: "Gain Resistance",
    type: {action: "minor", cooldown: "at-will", attack: false},
    effect: [
        {
            type: INSTRUCTION_TYPE.APPLY_STATUS,
            target: "owner",
            duration: "until_end_of_encounter",
            status: {
                type: "gain_resistance",
                value: amount,
                against_damage_types: types.length > 0 ? types : undefined
            },
        },
    ],
})

const APPLY_VULNERABILITY = (amount: number, ...types: Array<string>) => transform_power_ir_into_vm_representation({
    name: "Apply Vulnerability",
    type: {action: "minor", cooldown: "at-will", attack: false},
    targeting: {targeting_type: "melee_weapon", target_type: "creature", amount: 1},
    effect: [
        {
            type: INSTRUCTION_TYPE.APPLY_STATUS,
            target: SYSTEM_KEYWORD.PRIMARY_TARGET,
            duration: "until_end_of_encounter",
            status: {
                type: "gain_vulnerability",
                value: amount,
                against_damage_types: types.length > 0 ? types : undefined
            },
        },
    ],
})
