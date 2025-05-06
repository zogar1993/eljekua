import type {Power} from "../types.ts";

const shift: Power = {
    name: "Shift",
    action: "movement",
    targeting: {
        type: "movement",
        distance: 1,
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
    },
    happenings: [
        {
            type: "shift",
            target: "owner",
            destination: "target"
        }
    ]
}

const movement: Power = {
    name: "Move",
    action: "movement",
    targeting: {
        type: "movement",
        distance: "owner.movement",
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
    },
    happenings: [
        {
            type: "move",
            target: "owner",
            destination: "target"
        }
    ]
}

const melee_basic_attack: Power = {
    name: "Melee Basic Attack",
    action: "standard",
    targeting: {
        type: "melee",
        target_type: "enemy",
        amount: 1
    },
    happenings: [
        {
            type: "attack",
            attack: "strength_mod",
            defense: "ac",
            hit: [
                {
                    type: "apply_damage",
                    value: "4"
                }
            ]
        }
    ]
}

const magic_melee_misile: Power = {
    name: "Magic Melee Missile",
    action: "standard",
    targeting: {
        type: "melee",
        target_type: "enemy",
        amount: 1
    },
    happenings: [
        {
            type: "apply_damage",
            target: "power_target",
            value: "4"
        }
    ]
}

export const BASIC_MOVEMENT_ACTIONS = [movement, shift]
export const BASIC_ATTACK_ACTIONS = [magic_melee_misile]
