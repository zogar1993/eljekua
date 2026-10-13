import type {BattleGrid} from "core/battlegrid/BattleGrid";
import type {PositionFootprintOne} from "core/battlegrid/Position";
import {get_reach_push} from "core/battlegrid/position/get_reach_push";
import {get_shortest_path} from "core/battlegrid/queries/get_shortest_path";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const BLOCKING_STRUCTURE = {
    blocks_movement: true,
    blocks_line_of_sight: false,
    blocks_line_of_effect: false,
}

const NON_BLOCKING_STRUCTURE = {
    blocks_movement: false,
    blocks_line_of_sight: true,
    blocks_line_of_effect: false,
}

const set_structure_at = (battle_grid: BattleGrid, position: PositionFootprintOne, structure: {
    blocks_movement: boolean
    blocks_line_of_sight: boolean
    blocks_line_of_effect: boolean
}) => {
    battle_grid.get_square(position).structure = structure
}

const CREATURE_START = {x: 0, y: 0, footprint: 1} as const
const BLOCKED_SQUARE = {x: 1, y: 0, footprint: 1} as const
const DESTINATION_BEYOND_BLOCK = {x: 2, y: 0, footprint: 1} as const
const PUSHER_ANCHOR = {x: 0, y: 0, footprint: 1} as const

describe("blocking movement", () => {
    let test_game: ReturnType<typeof create_test_game>
    let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
    let given_creature: ReturnType<typeof create_creature_test_helpers>["given_creature"]

    beforeEach(() => {
        test_game = create_test_game({battle_grid_size: {x: 5, y: 5}})
        const helpers = create_creature_test_helpers({
            creatures: test_game.creatures,
            instruction_loop: test_game.instruction_loop,
            vm_state: test_game.vm_state,
            add_creature_to_game: test_game.add_creature_to_game,
            set_current_turn_to_creature: test_game.set_current_turn_to_creature,
            available_interaction: test_game.game_state.available_interaction,
        })
        given_a_creature_is_created = helpers.given_a_creature_is_created
        given_creature = helpers.given_creature
    })

    test("shift does not offer a square blocked by a structure", () => {
        given_a_creature_is_created({name: "mover", team: 1, position: CREATURE_START})
        set_structure_at(test_game.battle_grid, BLOCKED_SQUARE, BLOCKING_STRUCTURE)
        given_creature("mover").is_in_its_turn()

        test_game.instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Shift"})

        const interaction = test_game.game_state.available_interaction.get_current()
        expect(interaction.type).toBe(INTERACTION_TYPE.SELECT_PATH)
        if (interaction.type !== INTERACTION_TYPE.SELECT_PATH) return

        expect(interaction.clickable.some(position =>
            position.x === BLOCKED_SQUARE.x && position.y === BLOCKED_SQUARE.y,
        )).toBe(false)
    })

    test("walk does not offer a square blocked by a structure", () => {
        given_a_creature_is_created({name: "mover", team: 1, position: CREATURE_START})
        set_structure_at(test_game.battle_grid, BLOCKED_SQUARE, BLOCKING_STRUCTURE)
        given_creature("mover").is_in_its_turn()

        test_game.instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Walk"})

        const interaction = test_game.game_state.available_interaction.get_current()
        expect(interaction.type).toBe(INTERACTION_TYPE.SELECT_PATH)
        if (interaction.type !== INTERACTION_TYPE.SELECT_PATH) return

        expect(interaction.clickable.some(position =>
            position.x === BLOCKED_SQUARE.x && position.y === BLOCKED_SQUARE.y,
        )).toBe(false)
    })

    test("walk paths around a square blocked by a structure", () => {
        given_a_creature_is_created({name: "mover", team: 1, position: CREATURE_START})
        set_structure_at(test_game.battle_grid, BLOCKED_SQUARE, BLOCKING_STRUCTURE)
        given_creature("mover").is_in_its_turn()

        const mover = test_game.creatures.get_all().find(creature => creature.data.name === "mover")!
        const path = get_shortest_path({
            creature: mover,
            destination: DESTINATION_BEYOND_BLOCK,
            battle_grid: test_game.battle_grid,
        })

        expect(path.some(position => position.x === BLOCKED_SQUARE.x && position.y === BLOCKED_SQUARE.y)).toBe(false)
        expect(path[path.length - 1]).toEqual(DESTINATION_BEYOND_BLOCK)
    })

    test("push does not offer a square blocked by a structure", () => {
        given_a_creature_is_created({name: "defender", team: 2, position: BLOCKED_SQUARE})
        set_structure_at(test_game.battle_grid, DESTINATION_BEYOND_BLOCK, BLOCKING_STRUCTURE)

        const defender = test_game.creatures.get_all().find(creature => creature.data.name === "defender")!
        const destinations = get_reach_push({
            anchor: PUSHER_ANCHOR,
            defender,
            distance: 1,
            battle_grid: test_game.battle_grid,
        })

        expect(destinations.some(position =>
            position.x === DESTINATION_BEYOND_BLOCK.x && position.y === DESTINATION_BEYOND_BLOCK.y,
        )).toBe(false)
    })

    test("does not block movement when structure blocks_movement is false", () => {
        given_a_creature_is_created({name: "mover", team: 1, position: CREATURE_START})
        set_structure_at(test_game.battle_grid, BLOCKED_SQUARE, NON_BLOCKING_STRUCTURE)
        given_creature("mover").is_in_its_turn()

        test_game.instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Shift"})

        const interaction = test_game.game_state.available_interaction.get_current()
        expect(interaction.type).toBe(INTERACTION_TYPE.SELECT_PATH)
        if (interaction.type !== INTERACTION_TYPE.SELECT_PATH) return

        expect(interaction.clickable.some(position =>
            position.x === BLOCKED_SQUARE.x && position.y === BLOCKED_SQUARE.y,
        )).toBe(true)
    })
})
