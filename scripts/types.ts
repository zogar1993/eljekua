export type Power = {
    name: string,
    action: "standard" | "movement",
    targeting: {
        type: "melee" | "movement",
        distance?: 1 | "owner.movement",
        target_type: "terrain" | "enemy",
        terrain_prerequisite?: "unoccupied",
        amount: 1
    },
    happenings: Array<
        {
            type: "move" | "shift",
            target: "owner",
            destination: "target"
        } |
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
        } |
        {
            type: "apply_damage",
            target: "power_target"
            value: "4"
        }
    >
}
