import {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import {
    assert_positions_have_same_footprint,
    Position,
    PositionFootprintOne,
    positions_equal_footprint_one,
    positions_share_surface,
    transform_position_to_f1
} from "scripts/battlegrid/Position";
import {AnimationQueue} from "scripts/AnimationQueue";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "scripts/powers/basic";
import type {BattleGridVisual} from "scripts/battlegrid/BattleGridVisual";

export const create_battle_grid = ({
                                       create_visual_square,
                                       create_visual_creature,
                                       create_battle_grid_visual,
                                       size,
                                   }: {
    create_battle_grid_visual: ({width, height}: { width: number, height: number }) => BattleGridVisual
    create_visual_square: (square: { x: number, y: number }) => SquareVisual,
    create_visual_creature: (creature: CreatureData) => CreatureVisual,
    size: { x: number, y: number }
}): BattleGrid => {
    const visual: BattleGridVisual = create_battle_grid_visual({width: size.x, height: size.y})
    const creatures: Array<Creature> = []
    const board: Array<Array<Square>> = Array.from({length: size.y}, (_, y) => {
            return Array.from({length: size.x}, (_, x) => {
                const visual = create_visual_square({x, y})
                return {visual, position: {x, y, footprint: 1}}
            })
        }
    )

    const get_square = ({x, y}: PositionFootprintOne) => {
        if (x < 0 || x >= size.x || y < 0 || y >= size.y)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${size.x}, height:${size.y})`)
        return board[y][x]
    }

    const get_squares = (position: Position) => {
        return transform_position_to_f1(position).map(p => get_square(p))
    }


    const is_terrain_occupied = (position: Position, {exclude}: { exclude?: Array<Creature> } = {}): boolean => {
        for (const p1 of transform_position_to_f1(position))
            for (const creature of creatures.filter(c => exclude ? !exclude.includes(c) : true))
                for (const p2 of transform_position_to_f1(creature.data.position))
                    if (positions_equal_footprint_one(p1, p2)) return true
        return false
    }

    const get_creature_by_position = (position: Position): Creature => {
        const creature = creatures.find(creature => positions_share_surface(creature.data.position, position))
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    const get_creatures_in_positions = (positions: Array<PositionFootprintOne>): Array<Creature> => {
        const creatures = positions.filter(position => is_terrain_occupied(position)).map(get_creature_by_position)
        return [...new Set(creatures)]
    }

    const create_creature = (data: CreatureData) => {
        const d = {...data, powers: [...BASIC_MOVEMENT_ACTIONS, ...BASIC_ATTACK_ACTIONS, ...data.powers]}
        const visual = create_visual_creature(d)
        const creature = new Creature({data: d, visual})
        creatures.push(creature)
        return creature
    }

    const move_creature_one_square = ({position, creature}: { position: Position, creature: Creature }) => {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.move_one_square(position))
    }

    const push_creature = ({position, creature}: { position: Position, creature: Creature }) => {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.push_to(position))
    }

    return {
        visual,
        size,
        creatures,
        board,

        create_creature,
        get_square,
        get_squares,
        is_terrain_occupied,
        get_creature_by_position,
        get_creatures_in_positions,
        push_creature,
        move_creature_one_square
    }
}

export type BattleGrid = {
    visual: BattleGridVisual
    size: { x: number, y: number }
    creatures: ReadonlyArray<Creature>
    board: Array<Array<Square>>

    get_square: (position: PositionFootprintOne) => Square
    get_squares: (position: Position) => Array<Square>

    is_terrain_occupied: (position: Position, options?: { exclude?: Array<Creature> }) => boolean
    get_creature_by_position: (position: Position) => Creature
    get_creatures_in_positions: (positions: Array<PositionFootprintOne>) => Array<Creature>

    create_creature: (data: CreatureData) => Creature
    push_creature: (props: { position: Position, creature: Creature }) => void
    move_creature_one_square: (props: { position: Position, creature: Creature }) => void
}


export type Square = {
    visual: SquareVisual,
    position: PositionFootprintOne
}

export const distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}