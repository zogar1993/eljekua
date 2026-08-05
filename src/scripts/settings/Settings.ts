export const create_settings = () => ({
    attach_roll_resolution_is_random: true,
})

export type Settings = ReturnType<typeof create_settings>;