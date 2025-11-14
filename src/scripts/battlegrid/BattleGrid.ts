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
    transform_position_to_footprint_one
} from "scripts/battlegrid/Position";
import {AnimationQueue} from "scripts/AnimationQueue";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "scripts/powers/basic";
import type {BattleGridVisual} from "scripts/battlegrid/BattleGridVisual";
import {create_is_flanking} from "scripts/battlegrid/queries/is_flanking";
import {create_get_shortest_path} from "scripts/battlegrid/queries/get_shortest_path";

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

    const get_creature_by_position = (position: Position): Creature => {
        const creature = creatures.find(creature => positions_share_surface(creature.data.position, position))
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    const is_terrain_occupied = (position: Position, {exclude}: { exclude?: Array<Creature> } = {}): boolean => {
        for (const p1 of transform_position_to_footprint_one(position))
            for (const creature of creatures.filter(c => exclude ? !exclude.includes(c) : true))
                for (const p2 of transform_position_to_footprint_one(creature.data.position))
                    if (positions_equal_footprint_one(p1, p2)) return true
        return false
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

    const battle_grid = {} as BattleGrid

    battle_grid.visual = visual
    battle_grid.size = size
    battle_grid.creatures = creatures
    battle_grid.board = board

    battle_grid.create_creature = create_creature
    battle_grid.get_square = get_square
    battle_grid.is_terrain_occupied = is_terrain_occupied
    battle_grid.get_creature_by_position = get_creature_by_position
    battle_grid.push_creature = push_creature
    battle_grid.move_creature_one_square = move_creature_one_square
    battle_grid.is_flanking = create_is_flanking(battle_grid)
    battle_grid.get_shortest_path = create_get_shortest_path(battle_grid)

    return battle_grid
}

export type BattleGrid = {
    visual: BattleGridVisual
    size: { x: number, y: number }
    creatures: ReadonlyArray<Creature>
    board: Array<Array<Square>>

    get_square: (position: PositionFootprintOne) => Square
    is_terrain_occupied: (position: Position, options?: { exclude?: Array<Creature> }) => boolean
    get_creature_by_position: (position: Position) => Creature

    create_creature: (data: CreatureData) => Creature
    push_creature: (props: { position: Position, creature: Creature }) => void
    move_creature_one_square: (props: { position: Position, creature: Creature }) => void

    is_flanking: ({attacker, defender}: { attacker: Creature, defender: Creature }) => boolean
    get_shortest_path: ({creature, destination}: { creature: Creature, destination: Position }) => Array<Position>
}


export type Square = {
    visual: SquareVisual,
    position: PositionFootprintOne
}

export const distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

