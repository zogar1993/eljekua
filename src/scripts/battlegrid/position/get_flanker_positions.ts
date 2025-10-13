import type {Position, PositionFootprintOne} from "scripts/battlegrid/Position";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const get_flanker_positions = (
    {attacker_position, defender_position, battle_grid}:
        { attacker_position: Position, defender_position: Position, battle_grid: BattleGrid }
): Array<PositionFootprintOne> => {
    const viewbox_rectangle = {
        x: get_viewbox_axis_from_position({position: defender_position, axis: "x", battle_grid}),
        y: get_viewbox_axis_from_position({position: defender_position, axis: "y", battle_grid}),
    }

    const attacker_rectangle = {
        x: get_axis_from_position({position: attacker_position, axis: "x"}),
        y: get_axis_from_position({position: attacker_position, axis: "y"}),
    }

    const intersection_rectangle = {
        x: get_axis_intersection(viewbox_rectangle.x, attacker_rectangle.x),
        y: get_axis_intersection(viewbox_rectangle.y, attacker_rectangle.y),
    }

    const has_intersection =
        intersection_rectangle.x.lower <= intersection_rectangle.x.upper &&
        intersection_rectangle.y.lower <= intersection_rectangle.y.upper

    if (!has_intersection) return []

    const mirror_rectangle = {
        x: get_mirror_axis({axis: intersection_rectangle.x, viewbox: viewbox_rectangle.x}),
        y: get_mirror_axis({axis: intersection_rectangle.y, viewbox: viewbox_rectangle.y}),
    }

    const flanker_rectangle = {
        x: extend_axis_if_flanker_is_on_a_side({axis: mirror_rectangle.x, viewbox: viewbox_rectangle.x}),
        y: extend_axis_if_flanker_is_on_a_side({axis: mirror_rectangle.y, viewbox: viewbox_rectangle.y})
    }

    const results: Array<PositionFootprintOne> = []
    for (let x = flanker_rectangle.x.lower; x <= flanker_rectangle.x.upper; x++)
        for (let y = flanker_rectangle.y.lower; y <= flanker_rectangle.y.upper; y++)
            results.push({x, y, footprint: 1})
    return results
}

const get_axis_intersection = ((a: Axis, b: Axis): Axis => ({
    lower: Math.max(a.lower, b.lower),
    upper: Math.min(a.upper, b.upper)
}))

const get_viewbox_axis_from_position = ({position, axis, battle_grid}: {
    position: Position,
    axis: AxisKey,
    battle_grid: BattleGrid
}): Axis => ({
    lower: Math.max(position[axis] - 1, 0),
    upper: Math.min(position[axis] + position.footprint, battle_grid.size[axis] - 1)
})

const get_axis_from_position = ({position, axis,}: { position: Position, axis: AxisKey }): Axis => ({
    lower: position[axis],
    upper: position[axis] + position.footprint - 1,
})

const get_mirror_axis = ({axis, viewbox,}: { axis: Axis, viewbox: Axis }): Axis => {
    const offset = viewbox.lower
    return {
        lower: viewbox.upper - axis.upper + offset,
        upper: viewbox.upper - axis.lower + offset,
    }
}

const extend_axis_if_flanker_is_on_a_side = ({axis, viewbox}: { axis: Axis, viewbox: Axis }) => ({
    lower: axis.lower === viewbox.lower || axis.lower === viewbox.upper ? axis.lower : viewbox.lower + 1,
    upper: axis.upper === viewbox.lower || axis.upper === viewbox.upper ? axis.upper : viewbox.upper - 1,
})


type Axis = { lower: number, upper: number }
type AxisKey = "x" | "y"
