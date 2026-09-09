export const VISUAL_TEST_CREATURE_IMAGE = {
    WARRIOR: "warrior",
    CLERIC: "cleric",
    MAGE: "mage",
} as const

export type VisualTestCreatureImageName = typeof VISUAL_TEST_CREATURE_IMAGE[keyof typeof VISUAL_TEST_CREATURE_IMAGE]

export type VisualTestCreatureImageOption = {
    name: VisualTestCreatureImageName
    label: string
    image: string
}

export const VISUAL_TEST_CREATURE_IMAGE_OPTIONS: Array<VisualTestCreatureImageOption> = [
    {
        name: VISUAL_TEST_CREATURE_IMAGE.WARRIOR,
        label: "Warrior",
        image: `url("/public/visual_tests/creature_warrior.png")`,
    },
    {
        name: VISUAL_TEST_CREATURE_IMAGE.CLERIC,
        label: "Cleric",
        image: `url("/public/visual_tests/creature_cleric.png")`,
    },
    {
        name: VISUAL_TEST_CREATURE_IMAGE.MAGE,
        label: "Mage",
        image: `url("/public/visual_tests/creature_mage.png")`,
    },
]

export const get_visual_test_creature_image_url = (name: VisualTestCreatureImageName) =>
    VISUAL_TEST_CREATURE_IMAGE_OPTIONS.find(option => option.name === name)?.image
    ?? VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image
