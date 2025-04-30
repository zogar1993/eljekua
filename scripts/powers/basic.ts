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


export const BASIC_MOVEMENT_ACTIONS = [shift]

/*


export const movement: Power = {
    name: "Move",
    action: "movement",
    range: {
        type: "movement",
        distance: "owner.movement"
    },
    target: {
        type: "unoccupied_terrain",
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

export const melee_basic_attack: Power = {
    name: "Melee Basic Attack",
    action: "standard",
    range: {
        type: "melee"
    },
    target: {
        type: "enemy",
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

export const shift: Power = {
    name: "Shift",
    action: "movement",
    range: {
        type: "shift",
        range: "1"
    },
    target: {
        type: "unoccupied_terrain",
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

 */