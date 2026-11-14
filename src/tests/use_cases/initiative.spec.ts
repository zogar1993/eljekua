import {ATTRIBUTES} from "core/character_sheet/attributes";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {AssertionError} from "stdlib/AssertionError";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const POSITION = {x: 0, y: 0, footprint: 1} as const

const resolved_initiative_roll = (value: number): ExprNumberResolved => ({
    type: "number_resolved",
    value,
    description: "d20",
})

const create_creature_data = (name: string) => ({
    name,
    template: null,
    position: POSITION,
    size: "medium" as const,
    image: `url("/public/saber-and-pistol.svg")`,
    speed: 5,
    hp_current: 10,
    hp_max: 10,
    level: 1,
    team: 1,
    race: null,
    attributes: Object.fromEntries(
        Object.values(ATTRIBUTES).map(attr => [attr, 10]),
    ) as Creature["data"]["attributes"],
    trained_skills: [],
    skills: {},
    powers: [],
    archetypes: [],
    constant_rules: [],
    modifiers: [],
    languages: [],
    initiative_modifier: null,
})

describe("initiative", () => {
    let test_game: ReturnType<typeof create_test_game>
    let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]

    const given_creature_with_initiative = ({
        name,
        initiative_roll,
        initiative_modifier = null,
    }: {
        name: string
        initiative_roll: number
        initiative_modifier?: number | null
    }) => {
        const creature = test_game.creatures.create({
            ...create_creature_data(name),
            initiative_modifier,
        })
        test_game.initiative_order.add_entry({
            creature,
            initiative_roll: resolved_initiative_roll(initiative_roll),
        })
        return creature
    }

    const expect_current_creature = (name: string) => {
        expect(test_game.initiative_order.get_current_creature().data.name).toEqual(name)
    }

    beforeEach(() => {
        test_game = create_test_game()
        const helpers = create_creature_test_helpers({...test_game, default_attribute_value: 10})
        given_a_creature_is_created = helpers.given_a_creature_is_created
    })

    test("orders creatures from highest initiative total to lowest", () => {
        given_creature_with_initiative({name: "low", initiative_roll: 5})
        given_creature_with_initiative({name: "high", initiative_roll: 15})
        given_creature_with_initiative({name: "mid", initiative_roll: 10})
        test_game.initiative_order.start()

        expect_current_creature("high")
        test_game.initiative_order.next_turn()
        expect_current_creature("mid")
        test_game.initiative_order.next_turn()
        expect_current_creature("low")
    })

    test("places the higher initiative modifier first when initiative rolls are tied", () => {
        given_creature_with_initiative({name: "lower_mod", initiative_roll: 12, initiative_modifier: 1})
        given_creature_with_initiative({name: "higher_mod", initiative_roll: 12, initiative_modifier: 4})
        test_game.initiative_order.start()

        expect_current_creature("higher_mod")
        test_game.initiative_order.next_turn()
        expect_current_creature("lower_mod")
    })

    test("wraps turn from the last creature to the first", () => {
        given_creature_with_initiative({name: "alpha", initiative_roll: 10})
        given_creature_with_initiative({name: "beta", initiative_roll: 8})
        test_game.initiative_order.start()
        test_game.initiative_order.next_turn()

        expect_current_creature("beta")
        test_game.initiative_order.next_turn()
        expect_current_creature("alpha")
    })

    test("starts battle with the creature at the front of the order", () => {
        given_creature_with_initiative({name: "later", initiative_roll: 6})
        given_creature_with_initiative({name: "leader", initiative_roll: 18})
        test_game.initiative_order.start()

        expect_current_creature("leader")
    })

    test("jumps turn to a chosen creature in the order", () => {
        const beta = given_creature_with_initiative({name: "beta", initiative_roll: 10})
        given_creature_with_initiative({name: "alpha", initiative_roll: 12})
        test_game.initiative_order.start()

        test_game.initiative_order.set_current_turn(beta)
        expect_current_creature("beta")
    })

    test("rolls d20 plus initiative modifier when a creature joins the game", () => {
        let rolled_initiative: number | null = null
        test_game.game_events.on_initiative_entry_added.add_handler(({initiative}) => {
            rolled_initiative = initiative.value
        })

        given_a_creature_is_created({name: "linuar", team: 1, position: POSITION})

        expect(rolled_initiative).toBe(20)
    })

    test("adds explicit initiative modifier as tie-break fraction when rolling initiative", () => {
        let rolled_initiative: number | null = null
        test_game.game_events.on_initiative_entry_added.add_handler(({initiative}) => {
            rolled_initiative = initiative.value
        })

        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: POSITION,
            initiative_modifier: 5,
        })

        expect(rolled_initiative).toBe(20.05)
    })

    test("throws when querying the current creature with an empty order", () => {
        expect(() => test_game.initiative_order.get_current_creature()).toThrow(AssertionError)
    })

    test("throws when starting battle with an empty order", () => {
        expect(() => test_game.initiative_order.start()).toThrow(AssertionError)
    })

    test("throws when advancing turn with an empty order", () => {
        expect(() => test_game.initiative_order.next_turn()).toThrow(AssertionError)
    })

    test("throws when setting current turn to a creature not in the order", () => {
        const outsider = test_game.creatures.create(create_creature_data("outsider"))
        given_creature_with_initiative({name: "combatant", initiative_roll: 10})

        expect(() => test_game.initiative_order.set_current_turn(outsider)).toThrow(AssertionError)
    })
})