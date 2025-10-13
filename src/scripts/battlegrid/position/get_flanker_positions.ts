import type {Position, PositionFootprintOne} from "scripts/battlegrid/Position";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const get_flanker_positions = (
    {attacker_position, defender_position, battle_grid}:
        { attacker_position: Position, defender_position: Position, battle_grid: BattleGrid }
): Array<PositionFootprintOne> => {
    const viewbox_rectangle = {
        x_lower: Math.max(defender_position.x - 1, 0),
        x_upper: Math.min(defender_position.x + defender_position.footprint, battle_grid.BOARD_WIDTH - 1),
        y_lower: Math.max(defender_position.y - 1, 0),
        y_upper: Math.min(defender_position.y + defender_position.footprint, battle_grid.BOARD_HEIGHT - 1)
    }

    const attacker_rectangle = {
        x_lower: attacker_position.x,
        x_upper: attacker_position.x + attacker_position.footprint - 1,
        y_lower: attacker_position.y,
        y_upper: attacker_position.y + attacker_position.footprint - 1
    }

    const intersection_rectangle = {
        x_lower: Math.max(viewbox_rectangle.x_lower, attacker_rectangle.x_lower),
        x_upper: Math.min(viewbox_rectangle.x_upper, attacker_rectangle.x_upper),
        y_lower: Math.max(viewbox_rectangle.y_lower, attacker_rectangle.y_lower),
        y_upper: Math.min(viewbox_rectangle.y_upper, attacker_rectangle.y_upper),
    }

    const has_intersection =
        intersection_rectangle.x_lower <= intersection_rectangle.x_upper &&
        intersection_rectangle.y_lower <= intersection_rectangle.y_upper

    if (!has_intersection) return []

    const x_offset = viewbox_rectangle.x_lower
    const y_offset = viewbox_rectangle.y_lower

    const mirror_rectangle = {
        x_lower: viewbox_rectangle.x_upper - intersection_rectangle.x_upper + x_offset,
        x_upper: viewbox_rectangle.x_upper - intersection_rectangle.x_lower + x_offset,
        y_lower: viewbox_rectangle.y_upper - intersection_rectangle.y_upper + y_offset,
        y_upper: viewbox_rectangle.y_upper - intersection_rectangle.y_lower + y_offset,
    }

    const flanker_rectangle = {
        x_lower:
            mirror_rectangle.x_lower === viewbox_rectangle.x_lower ||
            mirror_rectangle.x_lower === viewbox_rectangle.x_upper ?
                mirror_rectangle.x_lower : viewbox_rectangle.x_lower + 1,
        x_upper:
            mirror_rectangle.x_upper === viewbox_rectangle.x_lower ||
            mirror_rectangle.x_upper === viewbox_rectangle.x_upper ?
                mirror_rectangle.x_upper : viewbox_rectangle.x_upper - 1,
        y_lower:
            mirror_rectangle.y_lower === viewbox_rectangle.y_lower ||
            mirror_rectangle.y_lower === viewbox_rectangle.y_upper ?
                mirror_rectangle.y_lower : viewbox_rectangle.y_lower + 1,
        y_upper:
            mirror_rectangle.y_upper === viewbox_rectangle.y_lower ||
            mirror_rectangle.y_upper === viewbox_rectangle.y_upper ?
                mirror_rectangle.y_upper : viewbox_rectangle.y_upper - 1,
    }

    const results: Array<PositionFootprintOne> = []
    for (let x = flanker_rectangle.x_lower; x <= flanker_rectangle.x_upper; x++)
        for (let y = flanker_rectangle.y_lower; y <= flanker_rectangle.y_upper; y++)
            results.push({x, y, footprint: 1})
    return results
}
