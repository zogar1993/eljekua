import type {Creature} from "core/battlegrid/creatures/Creature";

export const SLOWED_SPEED = 2

export const get_creature_speed = ({creature}: { creature: Creature }): number => {
    const base = creature.data.speed
    if (creature.statuses.some(({rule}) => rule.type === "slowed"))
        return Math.min(base, SLOWED_SPEED)
    return base
}