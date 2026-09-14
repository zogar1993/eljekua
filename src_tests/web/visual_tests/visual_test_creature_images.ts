export const VISUAL_TEST_CREATURE_IMAGE = {
    WARRIOR: "warrior",
    CLERIC: "cleric",
    MAGE: "mage",
    SHIELD: "shield",
    SLIME: "slime",
    SKELETON: "skeleton",
    WING: "wing",
    SPIKED_MACE: "spiked_mace",
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
    {
        name: VISUAL_TEST_CREATURE_IMAGE.SHIELD,
        label: "Shield",
        image: `url("/public/visual_tests/creature_shield.png")`,
    },
    {
        name: VISUAL_TEST_CREATURE_IMAGE.SLIME,
        label: "Dungeon slime",
        image: `url("/public/visual_tests/creature_slime.png")`,
    },
    {
        name: VISUAL_TEST_CREATURE_IMAGE.SKELETON,
        label: "Skeleton",
        image: `url("/public/visual_tests/creature_skeleton.png")`,
    },
    {
        name: VISUAL_TEST_CREATURE_IMAGE.WING,
        label: "Wing",
        image: `url("/public/visual_tests/creature_wing.png")`,
    },
    {
        name: VISUAL_TEST_CREATURE_IMAGE.SPIKED_MACE,
        label: "Spiked mace",
        image: `url("/public/visual_tests/creature_spiked_mace.png")`,
    },
]

export const get_visual_test_creature_image_url = (name: VisualTestCreatureImageName) =>
    VISUAL_TEST_CREATURE_IMAGE_OPTIONS.find(option => option.name === name)?.image
    ?? VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image
