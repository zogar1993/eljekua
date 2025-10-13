import {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import {
    assert_positions_have_same_footprint,
    Position,
    PositionFootprintOne,
    positions_equal,
    positions_equal_footprint_one,
    positions_share_surface
} from "scripts/battlegrid/Position";
import {AnimationQueue} from "scripts/AnimationQueue";
import {get_reach_adjacent} from "scripts/battlegrid/ranges/get_reach_adjacent";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "scripts/powers/basic";
import {get_flanker_positions} from "scripts/battlegrid/position/get_flanker_positions";
import {are_creatures_allied} from "scripts/creatures/are_creatures_allied";

export class BattleGrid {
    readonly BOARD_HEIGHT = 10
    readonly BOARD_WIDTH = 10
    readonly creatures: Array<Creature> = []

    board: Array<Array<Square>>
    create_visual_creature: (creature: CreatureData) => CreatureVisual
    get_square = ({x, y}: PositionFootprintOne) => {
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${this.BOARD_WIDTH}, height:${this.BOARD_HEIGHT})`)
        return this.board[y][x]
    }

    constructor({
                    create_visual_square,
                    create_visual_creature
                }: {
        create_visual_square: (square: { x: number, y: number }) => SquareVisual,
        create_visual_creature: (creature: CreatureData) => CreatureVisual,
    }) {
        const html_board = document.querySelector(".board")! as HTMLDivElement

        const get_click_coordinate_from_mouse_event = (e: MouseEvent): ClickableCoordinate => {
            const rect = html_board.getBoundingClientRect();
            const BORDER_WIDTH = 1

            const BATTLE_GRID_PIXEL_WIDTH = rect.width - BORDER_WIDTH * 2
            const COORDINATE_PIXEL_WIDTH = BATTLE_GRID_PIXEL_WIDTH / (this.BOARD_WIDTH * 2)
            const coordinate_x = Math.floor((e.clientX - rect.left) / COORDINATE_PIXEL_WIDTH);

            const BATTLE_GRID_PIXEL_HEIGHT = rect.width - BORDER_WIDTH * 2
            const COORDINATE_PIXEL_HEIGHT = BATTLE_GRID_PIXEL_HEIGHT / (this.BOARD_HEIGHT * 2)
            const coordinate_y = Math.floor((e.clientY - rect.top) / COORDINATE_PIXEL_HEIGHT);

            return {
                x: Math.min(Math.max(0, coordinate_x), (this.BOARD_WIDTH * 2) - 1),
                y: Math.min(Math.max(0, coordinate_y), (this.BOARD_HEIGHT * 2) - 1)
            }
        }

        html_board.addEventListener('mousemove', (e: MouseEvent) => {
            const coordinate = get_click_coordinate_from_mouse_event(e)
            this.onMouseMoveHandlers.forEach(handler => handler(coordinate))
        });

        html_board.addEventListener('click', (e: MouseEvent) => {
            const coordinate = get_click_coordinate_from_mouse_event(e)
            this.onClickHandlers.forEach(handler => handler(coordinate))
        });

        this.create_visual_creature = create_visual_creature
        this.board = Array.from({length: this.BOARD_HEIGHT}, (_, y) => {
                return Array.from({length: this.BOARD_WIDTH}, (_, x) => {
                    const visual = create_visual_square({x, y})
                    return {visual, position: {x, y, footprint: 1}}
                })
            }
        )
    }

    // get_area_burst({origin, radius}: { origin: Position, radius: number }): Array<Position> {
    //     const lower_x = Math.max(0, origin.x - radius)
    //     const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + radius)
    //     const lower_y = Math.max(0, origin.y - radius)
    //     const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + radius)
    //     const result = [];
    //     for (let x = lower_x; x <= upper_x; x++)
    //         for (let y = lower_y; y <= upper_y; y++)
    //             result.push({x, y});
    //     return result
    // }

    get_shortest_path = ({creature, destination}: { creature: Creature, destination: Position }) => {
        const origin = creature.data.position
        const visited: Array<Position> = [origin]

        type WeightedPath = {
            path: Array<Position>,
            distance: { squares: number, intuitive: number },
            moved: number,
            weight: number
        }
        const initial_distance = distance_between_positions(origin, destination)
        let paths: Array<WeightedPath> =
            [{
                path: [origin],
                moved: 0,
                distance: {
                    squares: initial_distance,
                    intuitive: intuitive_distance_between_positions(origin, destination)
                },
                weight: initial_distance
            }]
        const extend_path = ({old_path, position}: { old_path: WeightedPath, position: Position }): WeightedPath => {
            const distance = distance_between_positions(position, destination)
            const moved = old_path.moved + 1
            return {
                path: [...old_path.path, position],
                distance: {squares: distance, intuitive: intuitive_distance_between_positions(position, destination)},
                moved,
                weight: distance + moved
            }
        }

        while (paths.length > 0) {
            const min_weight = Math.min(...paths.map(x => x.weight))
            const min_weight_paths = paths.filter(x => x.weight === min_weight)
            const min_intuitive_distance = Math.min(...min_weight_paths.map(x => x.distance.intuitive))
            const current_path = paths.find(x => x.distance.intuitive === min_intuitive_distance)!

            // remove the current path from the list, we only need its products, and we also avoid dead ends
            paths = paths.filter(x => x !== current_path)

            const head = current_path.path[current_path.path.length - 1]
            const alternatives = get_reach_adjacent({position: head, battle_grid: this})
                .filter(a => visited.every(b => !positions_equal(a, b)))
                .filter(a => !this.is_terrain_occupied(a, {exclude: [creature]}))

            const ending_position = alternatives.find(alternative => positions_equal(alternative, destination))
            if (ending_position) return [...current_path.path, ending_position]

            visited.push(...alternatives)

            paths = [
                ...alternatives.map(position => extend_path({old_path: current_path, position})),
                ...paths
            ]
        }

        throw Error(`Path not found from ${JSON.stringify(origin)} to ${JSON.stringify(destination)}`)
    }

    is_flanking({attacker, defender}: { attacker: Creature, defender: Creature }) {
        if (attacker.data.team === null) return false

        //TODO refactor battle_grid so that functions are attached to it
        //TODO test actual flanking
        const positions = get_flanker_positions({
            attacker_position: attacker.data.position,
            defender_position: defender.data.position,
            battle_grid: this
        })

        if (positions.every(position => !this.is_terrain_occupied(position))) return false

        const flankers = positions.map(this.get_creature_by_position)
        return flankers.some(flanker => are_creatures_allied(flanker, attacker))
    }

    move_creature_one_square({position, creature}: { position: Position, creature: Creature }) {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.move_one_square(position))
    }

    push_creature({position, creature}: { position: Position, creature: Creature }) {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.push_to(position))
    }

    get_creature_by_position = (position: Position): Creature => {
        const creature = this.creatures.find(creature => positions_share_surface(creature.data.position, position))
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    is_terrain_occupied = (position: Position, {exclude}: { exclude?: Array<Creature> } = {}): boolean => {
        for (const p1 of transform_position_to_footprint_one(position))
            for (const creature of this.creatures.filter(c => exclude ? !exclude.includes(c) : true))
                for (const p2 of transform_position_to_footprint_one(creature.data.position))
                    if (positions_equal_footprint_one(p1, p2)) return true
        return false
    }

    create_creature = (data: CreatureData) => {
        const d = {...data, powers: [...BASIC_MOVEMENT_ACTIONS, ...BASIC_ATTACK_ACTIONS, ...data.powers]}
        const visual = this.create_visual_creature(d)
        const creature = new Creature({data: d, visual})
        this.creatures.push(creature)
        return creature
    }

    onMouseMoveHandlers: Array<(coordinate: ClickableCoordinate) => void> = []
    addOnMouseMoveHandler = (handler: (coordinate: ClickableCoordinate) => void) => {
        this.onMouseMoveHandlers.push((coordinate: ClickableCoordinate) => {
            //TODO maybe this needs a cleanup on mouse leave, and maybe the caller needs to do the same with position
            if (latest_coordinate === null || !coordinates_equal(coordinate, latest_coordinate)) {
                latest_coordinate = coordinate
                handler(coordinate)
            }
        })
    }

    onClickHandlers: Array<(coordinate: ClickableCoordinate) => void> = []
    addOnClickHandler = (handler: (coordinate: ClickableCoordinate) => void) => {
        this.onClickHandlers.push((coordinate: ClickableCoordinate) => {
            if (latest_coordinate === null) return
            if (!coordinates_equal(coordinate, latest_coordinate))
                throw Error(`clicked coordinate '${JSON.stringify(coordinate)}' does not match latest coordinate '${JSON.stringify(latest_coordinate)}'`)
            handler(latest_coordinate)
        })
    }
}

let latest_coordinate: ClickableCoordinate | null = null

export type Square = {
    visual: SquareVisual,
    position: Position
}

export const distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}
const intuitive_distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export const transform_position_to_footprint_one = (position: Position): Array<PositionFootprintOne> => {
    if (position.footprint === 1) return [position as PositionFootprintOne]
    const positions: Array<PositionFootprintOne> = []
    for (let offset_x = 0; offset_x < position.footprint; offset_x++)
        for (let offset_y = 0; offset_y < position.footprint; offset_y++)
            positions.push({x: position.x + offset_x, y: position.y + offset_y, footprint: 1})
    return positions
}

export type ClickableCoordinate = { x: number, y: number }

export const coordinates_equal = (a: ClickableCoordinate, b: ClickableCoordinate) => {
    return a.x === b.x && a.y === b.y
}
