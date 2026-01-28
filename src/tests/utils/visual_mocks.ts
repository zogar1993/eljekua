import {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {BattleGridVisual} from "scripts/battlegrid/BattleGridVisual";

const create_visual_creature = (): CreatureVisual => ({
    place_at: jest.fn(),
    move_one_square: () => 0,
    push_to: () => 0,
    receive_damage: () => 0,
    display_miss: () => 0,
    display_hit_chance: jest.fn(),
    remove_hit_chance: jest.fn(),
})

const create_visual_square = (): SquareVisual => ({
    set_highlight: jest.fn(),
    set_interaction_status: jest.fn()
})

const create_battle_grid_visual = (): BattleGridVisual => ({
    addOnMouseMoveHandler: jest.fn(),
    addOnClickHandler: jest.fn(),
})

export const visual_mocks = {
    create_visual_square,
    create_visual_creature,
    create_battle_grid_visual,
}