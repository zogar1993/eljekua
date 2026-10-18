import type {BattleGrid} from "core/battlegrid/BattleGrid";
import type {Position, PositionFootprintOne} from "core/battlegrid/Position";
import {assert_is_footprint_one} from "core/battlegrid/Position";
import type {Structure} from "core/battlegrid/Structure";
import {assert_is_true} from "stdlib/assert";

const separator_blocks_movement = (structure: Structure | null): boolean =>
    structure?.blocks_movement ?? false

//TODO probably can move footprint out of the positions and just have it live on the algorithms

export const can_move_between = (
    battle_grid: BattleGrid,
    orig: Position,
    dest: Position,
): boolean => {
    assert_is_footprint_one(orig)
    assert_is_footprint_one(dest)

    const dx = dest.x - orig.x
    const dy = dest.y - orig.y

    assert_is_true(dx !== 0 || dy !== 0)
    assert_is_true(Math.abs(dx) < 2)
    assert_is_true(Math.abs(dy) < 2)

    // checks if there is a barrier that prevents horizontal movement
    if (dy === 0) {
        const x_axis_separator_x = dx === 1 ? orig.x : orig.x - 1
        const x_separator = battle_grid.get_separator_x_axis({x: x_axis_separator_x, y: orig.y})
        return !separator_blocks_movement(x_separator.structure)
    }
    // checks if there is a barrier that prevents vertical movement
    if (dx === 0) {
        const y_axis_separator_y = dy === 1 ? orig.y : orig.y - 1
        const y_separator = battle_grid.get_separator_y_axis({x: orig.x, y: y_axis_separator_y})
        return !separator_blocks_movement(y_separator.structure)
    }

    // checks for diagonal movement
    // for it to be valid we check the "+" that forms between the positions
    const min_x = Math.min(orig.x, dest.x)
    const min_y = Math.min(orig.y, dest.y)


    // if both hemispheres are separate, it can't move
    const separates_n = separator_blocks_movement(battle_grid.get_separator_x_axis({x: min_x, y: min_y}).structure)
    const separates_s = separator_blocks_movement(battle_grid.get_separator_x_axis({x: min_x, y: min_y + 1}).structure)
    if (separates_n && separates_s) return false

    const separates_e = separator_blocks_movement(battle_grid.get_separator_y_axis({x: min_x + 1, y: min_y}).structure)
    const separates_w = separator_blocks_movement(battle_grid.get_separator_y_axis({x: min_x, y: min_y}).structure)
    if (separates_e && separates_w) return false

    // if one of the positions is cornered, then it can't move
    const is_nw_to_se_diagonal = dx + dy !== 0
    if (is_nw_to_se_diagonal) {
        if (separates_n && separates_w) return false
        if (separates_s && separates_e) return false
    } else {
        if (separates_n && separates_e) return false
        if (separates_s && separates_w) return false
    }

    return true
}
