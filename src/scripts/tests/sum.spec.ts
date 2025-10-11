import type {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import type {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_reach_adjacent} from "scripts/battlegrid/ranges/get_reach_adjacent";

const board = document.createElement("div")
board.classList.add("board")
document.body.appendChild(board)

const create_visual_creature = (): CreatureVisual => ({
    place_at: jest.fn(),
    move_one_square: () => 0,
    push_to: () => 0,
    receive_damage: () => 0,
    display_miss: () => 0,
    display_options: () => {
    },
    remove_options: () => {
    },
    display_hit_chance: () => {
    },
    remove_hit_chance: () => {
    }
})

const create_visual_square = (): SquareVisual => ({
    clearIndicator: () => {
    },
    setIndicator: () => {
    },
})

const battle_grid = new BattleGrid({create_visual_square, create_visual_creature})

test("adds aa numbers", () => {
    const adjacents = get_reach_adjacent({battle_grid, position: {x: 1, y: 1, footprint: 1}})

    expect(adjacents).toIncludeSameMembers([
        {x: 0, y: 0, footprint: 1},
        {x: 1, y: 0, footprint: 1},
        {x: 2, y: 0, footprint: 1},
        {x: 2, y: 1, footprint: 1},
        {x: 2, y: 2, footprint: 1},
        {x: 1, y: 2, footprint: 1},
        {x: 0, y: 2, footprint: 1},
        {x: 0, y: 1, footprint: 1},
    ]);
});

