import {
    Power,
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {ConstantEffect} from "core/battlegrid/creatures/Creature";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const POSITION_LINUAR = {x: 3, y: 4, footprint: 1} as const
const POSITION_RAGOZ = {x: 4, y: 4, footprint: 1} as const

let start_battle: ReturnType<typeof create_test_game>["start_battle"]
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]
let then_creature: ReturnType<typeof create_creature_test_helpers>["then_creature"]

beforeEach(() => {
    const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.HIT_STATUS})
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
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE + LESSER)
    })

    test("untyped damage is not reduced by typed resistances", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE)
    })

    test("dual type damage only considers lower resistance", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE, COLD)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE), GAIN_RESISTANCE_EFFECT(GREATER, COLD)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE + LESSER)
    })

    test("untyped resistance reduces typed damage", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE + LESSER)
    })

    test("untyped resistance reduces untyped damage", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE + LESSER)
    })

    test("multiple resistances to the same type use only the highest", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE), GAIN_RESISTANCE_EFFECT(GREATER, FIRE)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE + GREATER)
    })

    test("dual type damage with resistance to one type only deals full damage", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE, COLD)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE)
    })
})

describe("damage vulnerability", () => {
    test("typed damage is increased against vulnerable creatures", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_VULNERABILITY_EFFECT(LESSER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - LESSER)
    })

    test("untyped damage is not increased by typed vulnerability", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_VULNERABILITY_EFFECT(LESSER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE)
    })

    test("dual type damage only considers higher vulnerability", () => {

        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE, COLD)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_VULNERABILITY_EFFECT(LESSER, FIRE), GAIN_VULNERABILITY_EFFECT(GREATER, COLD)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - GREATER)
    })

    test("untyped vulnerability increases typed damage", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_VULNERABILITY_EFFECT(LESSER)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - LESSER)
    })

    test("untyped vulnerability increases untyped damage", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_VULNERABILITY_EFFECT(LESSER)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - LESSER)
    })

    test("multiple vulnerabilities to the same type use only the highest", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_VULNERABILITY_EFFECT(LESSER, FIRE), GAIN_VULNERABILITY_EFFECT(GREATER, FIRE)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - GREATER)
    })

    test("dual type damage applies vulnerability when it is least favorable", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE, COLD)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE), GAIN_VULNERABILITY_EFFECT(GREATER, COLD)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - GREATER)
    })
})

describe("resistance and vulnerability cancel each other", () => {
    test("when resistance exceeds vulnerability, vulnerability is subtracted from resistance", () => {
        const linuar_powers: Array<Power> = [DEAL_DAMAGE(FIRE)]
        const ragoz_constant_effects: Array<ConstantEffect> = [
            GAIN_RESISTANCE_EFFECT(GREATER, FIRE),
            GAIN_VULNERABILITY_EFFECT(LESSER, FIRE),
        ]
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: linuar_powers})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: ragoz_constant_effects})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE + GREATER - LESSER)
    })

    test("when vulnerability exceeds resistance, resistance is subtracted from vulnerability", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE), GAIN_VULNERABILITY_EFFECT(GREATER, FIRE)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE - GREATER + LESSER)
    })

    test("equal resistance and vulnerability to the same type cancel out", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE(FIRE)]})
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_RAGOZ,
            constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE), GAIN_VULNERABILITY_EFFECT(LESSER, FIRE)],
        })
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE)
    })
})

describe("half damage", () => {
    test("half damage is applied with no modifiers", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_HALF_DAMAGE()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ})
        start_battle()

        when_creature("linuar").selects_action("Deal Half Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - Math.floor(DAMAGE / 2))
    })

    test("half damage is applied after resistance", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_HALF_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(LESSER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Half Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - Math.floor((DAMAGE - LESSER) / 2))
    })

    test("half damage is applied after vulnerability", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_HALF_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_VULNERABILITY_EFFECT(GREATER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Half Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - Math.floor((DAMAGE + GREATER) / 2))
    })

    test("half damage rounds down after modifiers", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_HALF_DAMAGE(FIRE)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, constant_effects: [GAIN_RESISTANCE_EFFECT(GREATER, FIRE)]})
        start_battle()

        when_creature("linuar").selects_action("Deal Half Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - Math.floor((DAMAGE - GREATER) / 2))
    })
})

describe("minions", () => {
    test("a missed attack cannot damage a minion", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_ON_MISS()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, archetypes: ["minion"]})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage On Miss")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP)
    })

    test("a missed attack can still damage a non-minion", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_ON_MISS()]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage On Miss")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - DAMAGE)
    })
})

const create_deal_damage_power = ({
    name,
    half_damage = false,
    hit_status = HIT_STATUS.HIT,
    types,
}: {
    name: string
    half_damage?: boolean
    hit_status?: HitStatus
    types: Array<string>
}) => transform_power_ir_into_vm_representation({
    name,
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    effect: [
        {type: "set_hit_status", target: "primary_target", status: hit_status},
        {
            type: "apply_damage",
            value: `${DAMAGE}`,
            target: "primary_target",
            damage_types: types,
            half_damage,
        },
    ],
})

const DEAL_DAMAGE = (...types: Array<string>) => create_deal_damage_power({name: "Deal Damage", types})

const DEAL_HALF_DAMAGE = (...types: Array<string>) => create_deal_damage_power({name: "Deal Half Damage", half_damage: true, types})

const DEAL_DAMAGE_ON_MISS = (...types: Array<string>) => create_deal_damage_power({
    name: "Deal Damage On Miss",
    hit_status: HIT_STATUS.MISS,
    types,
})

const FIRE = "fire"
const COLD = "cold"

const FULL_HP = 10
const DAMAGE = 4
const LESSER = 2
const GREATER = 3

const GAIN_RESISTANCE_EFFECT = (amount: number, ...types: Array<string>): ConstantEffect => ({
    type: "gain_resistance",
    value: amount,
    against_damage_types: types.length > 0 ? types : null,
})

const GAIN_VULNERABILITY_EFFECT = (amount: number, ...types: Array<string>): ConstantEffect => ({
    type: "gain_vulnerability",
    value: amount,
    against_damage_types: types.length > 0 ? types : null,
})
