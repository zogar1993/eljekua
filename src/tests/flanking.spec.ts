import type {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import type {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import type {BattleGridVisual} from "scripts/battlegrid/BattleGridVisual";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_flanker_positions} from "scripts/battlegrid/position/get_flanker_positions";

const create_visual_creature = (): CreatureVisual => ({
    place_at: jest.fn(),
    move_one_square: () => 0,
    push_to: () => 0,
    receive_damage: () => 0,
    display_miss: () => 0,
    display_options: jest.fn(),
    remove_options: jest.fn(),
    display_hit_chance: jest.fn(),
    remove_hit_chance: jest.fn(),
})

const create_visual_square = (): SquareVisual => ({
    set_indicator: jest.fn(),
    set_interaction_status: jest.fn()
})

const create_battle_grid_visual = (): BattleGridVisual => ({
    addOnMouseMoveHandler: jest.fn(),
    addOnClickHandler: jest.fn(),
})

const battle_grid = new BattleGrid({create_visual_square, create_visual_creature, create_battle_grid_visual});

describe("when a 1x1 attacker attacks a 1x1 defender, there is one flanking position", () => {
    [
        {
            attacker_position: {x: 0, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 2, y: 2, footprint: 1}]
        },
        {
            attacker_position: {x: 0, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 2, y: 1, footprint: 1}]
        },
        {
            attacker_position: {x: 0, y: 2, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 2, y: 0, footprint: 1}]
        },
        {
            attacker_position: {x: 1, y: 2, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 1, y: 0, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 2, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 0, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 1, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 2, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 1, footprint: 1}]
        },
    ].map(({attacker_position, defender_position, expectation}) => {
        test(`attacker '${JSON.stringify(attacker_position)}, defender: ${JSON.stringify(defender_position)}'`, () => {
            const result = get_flanker_positions({attacker_position, defender_position, battle_grid})
            expect(result).toIncludeSameMembers(expectation);
        });
    })
})

describe("when a 1x1 attacker attacks a 2x2 defender", () => {
    test(`by the corner there is one flanking position`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 2},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 3, y: 3, footprint: 1}]);
    });

    test(`by the side there are two flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 2},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 3, y: 1, footprint: 1}, {x: 3, y: 2, footprint: 1}]);
    });
})

describe("when a 3x3 attacker attacks a 1x1 defender", () => {
    test(`by the corner there is one flanking position`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 0, footprint: 3},
            defender_position: {x: 3, y: 3, footprint: 1},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 4, y: 4, footprint: 1}]);
    });

    test(`by the side and corner there are two flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 1, footprint: 3},
            defender_position: {x: 3, y: 3, footprint: 1},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 4, y: 3, footprint: 1}, {x: 4, y: 4, footprint: 1}]);
    });

    test(`by the side and two corners there are three flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 2, footprint: 3},
            defender_position: {x: 3, y: 3, footprint: 1},
            battle_grid
        })
        expect(result).toIncludeSameMembers([
            {x: 4, y: 2, footprint: 1},
            {x: 4, y: 3, footprint: 1},
            {x: 4, y: 4, footprint: 1}
        ]);
    });
})