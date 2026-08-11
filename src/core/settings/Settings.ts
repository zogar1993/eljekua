export const create_settings = () => ({
    attack_roll_resolution_is_random: false,
})

export type Settings = ReturnType<typeof create_settings>;