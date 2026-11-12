import {add_creature_status, type Status} from "core/battlegrid/creatures/Creature";
import type {PositionFootprintOne} from "core/battlegrid/Position";
import {
    Power,
    transform_power_ir_into_vm_representation,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const ORIGIN = {x: 0, y: 0, footprint: 1} as const
const TWO_SQUARES_AWAY = {x: 2, y: 0, footprint: 1} as const
const THREE_SQUARES_AWAY = {x: 3, y: 0, footprint: 1} as const
const ONE_SQUARE_AWAY = {x: 0, y: 1, footprint: 1} as const

let test_game: ReturnType<typeof create_test_game>
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let given_creature: ReturnType<typeof create_creature_test_helpers>["given_creature"]

beforeEach(() => {
    test_game = create_test_game({battle_grid_size: {x: 6, y: 6}})
    const helpers = create_creature_test_helpers({...test_game})
    given_a_creature_is_created = helpers.given_a_creature_is_created
    given_creature = helpers.given_creature
})

describe("apply status slowed", () => {
    test("adds the slowed condition to the target", () => {
        given_a_creature_is_created({name: "linuar", team: 1, position: ORIGIN, powers: [APPLY_SLOWED]})
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 1, y: 0, footprint: 1}})
        given_creature("linuar").is_in_its_turn()

        test_game.instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Apply Slowed"})
        test_game.instruction_loop.select({type: INTERACTION_TYPE.SELECT_CREATURE, creature_id: test_game.creatures.get_all().find(c => c.data.name === "ragoz")!.id})

        const ragoz = test_game.creatures.get_all().find(creature => creature.data.name === "ragoz")!
        expect(ragoz.statuses.some(({rule}) => rule.type === "slowed")).toBe(true)
    })
})

describe("movement while slowed", () => {
    test("caps walk reach at 2 when base movement is higher", () => {
        given_a_creature_is_created({name: "mover", team: 1, position: ORIGIN, movement: 6})
        const mover = test_game.creatures.get_all().find(creature => creature.data.name === "mover")!
        add_creature_status({creature: mover, status: SLOWED_UNTIL_ENCOUNTER_END})
        given_creature("mover").is_in_its_turn()

        test_game.instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Walk"})

        const interaction = test_game.game_state.available_interaction.get_current()
        expect(interaction.type).toBe(INTERACTION_TYPE.SELECT_PATH)
        if (interaction.type !== INTERACTION_TYPE.SELECT_PATH) return

        const is_clickable = (position: PositionFootprintOne) =>
            interaction.clickable.some(target => target.x === position.x && target.y === position.y)

        expect(is_clickable(TWO_SQUARES_AWAY)).toBe(true)
        expect(is_clickable(THREE_SQUARES_AWAY)).toBe(false)
    })

    test("does not reduce walk reach when base movement is already below the cap", () => {
        given_a_creature_is_created({name: "mover", team: 1, position: ORIGIN, movement: 1})
        const mover = test_game.creatures.get_all().find(creature => creature.data.name === "mover")!
        add_creature_status({creature: mover, status: SLOWED_UNTIL_ENCOUNTER_END})
        given_creature("mover").is_in_its_turn()

        test_game.instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Walk"})

        const interaction = test_game.game_state.available_interaction.get_current()
        expect(interaction.type).toBe(INTERACTION_TYPE.SELECT_PATH)
        if (interaction.type !== INTERACTION_TYPE.SELECT_PATH) return

        const is_clickable = (position: PositionFootprintOne) =>
            interaction.clickable.some(target => target.x === position.x && target.y === position.y)

        expect(is_clickable(ONE_SQUARE_AWAY)).toBe(true)
        expect(is_clickable(TWO_SQUARES_AWAY)).toBe(false)
    })
})

const APPLY_SLOWED: Power = transform_power_ir_into_vm_representation({
    name: "Apply Slowed",
    type: {action: "standard", cooldown: "at-will", attack: false},
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "creature",
        amount: 1,
    },
    effect: [{
        type: INSTRUCTION_TYPE.APPLY_STATUS,
        target_label: "primary_target",
        duration: "until_end_of_encounter",
        status: {type: "slowed"},
    }],
})

const SLOWED_UNTIL_ENCOUNTER_END: Status = {
    rule: {type: "slowed"},
    durations: [{until: "encounter_end"}],
}