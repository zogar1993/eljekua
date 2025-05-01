export type Power = {
    name: string,
    action: "shift" | "movement",
    targeting: {
        type: "movement",
        distance: 1 | "owner.movement",
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
    },
    happenings: [
        {
            type: "move" | "shift",
            target: "owner",
            destination: "target"
        }
    ]
}
