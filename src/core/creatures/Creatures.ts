import {Creature} from "core/battlegrid/creatures/Creature";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "data/powers/basic";
import {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {assert_is_valid_index} from "stdlib/assert";

export const create_creatures = () => {
    const creatures: Array<Creature> = []

    const create_creature = (data: CreatureData) => {
        const basic_powers = data.template === null
            ? [...BASIC_MOVEMENT_ACTIONS, ...BASIC_ATTACK_ACTIONS]
            : [...BASIC_MOVEMENT_ACTIONS]
        const d = {...data, powers: [...basic_powers, ...data.powers]}
        const creature = new Creature({id: creatures.length, data: d})
        creatures.push(creature)
        return creature
    }

    return {
        get_all: (): ReadonlyArray<Creature> => creatures,
        get_by_id: (id: number) => {
            assert_is_valid_index(id, creatures)
            return creatures[id]
        },
        create: create_creature
    }
}

export type Creatures = ReturnType<typeof create_creatures>