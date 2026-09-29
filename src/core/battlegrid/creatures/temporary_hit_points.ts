import type {Creature} from "core/battlegrid/creatures/Creature";

export const grant_creature_temporary_hit_points = ({creature, amount}: {
    creature: Creature
    amount: number
}) => {
    if (amount < 0)
        throw Error(`temporary hit points must be non-negative, got ${amount}`)

    creature.temporary_hit_points = Math.max(creature.temporary_hit_points, amount)
}

export const clear_creature_temporary_hit_points = ({creature}: { creature: Creature }) => {
    creature.temporary_hit_points = 0
}

export const subtract_damage_from_creature = ({creature, damage}: {
    creature: Creature
    damage: number
}) => {
    let remaining = damage

    if (creature.temporary_hit_points > 0) {
        const absorbed = Math.min(creature.temporary_hit_points, remaining)
        creature.temporary_hit_points -= absorbed
        remaining -= absorbed
    }

    creature.data.hp_current -= remaining
}
