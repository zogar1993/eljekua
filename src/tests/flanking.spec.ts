import {create_battle_grid} from "scripts/battlegrid/BattleGrid";
import {get_flanker_positions} from "scripts/battlegrid/position/get_flanker_positions";
import {visual_mocks} from "tests/utils/visual_mocks";

const battle_grid = create_battle_grid({size: {x: 10, y: 10}, ...visual_mocks});

describe("when a 1x1 attacker attacks a 1x1 defender, there is one flanking position", () => {
    [
        {
            attacker_position: {x: 0, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 2, y: 2, footprint: 1}]
        },
        {
            attacker_position: {x: 0, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 2, y: 1, footprint: 1}]
        },
        {
            attacker_position: {x: 0, y: 2, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 2, y: 0, footprint: 1}]
        },
        {
            attacker_position: {x: 1, y: 2, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 1, y: 0, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 2, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 0, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 1, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 2, footprint: 1}]
        },
        {
            attacker_position: {x: 2, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 1},
            expectation: [{x: 0, y: 1, footprint: 1}]
        },
    ].map(({attacker_position, defender_position, expectation}) => {
        test(`attacker '${JSON.stringify(attacker_position)}, defender: ${JSON.stringify(defender_position)}'`, () => {
            const result = get_flanker_positions({attacker_position, defender_position, battle_grid})
            expect(result).toIncludeSameMembers(expectation);
        });
    })
})

describe("when a 1x1 attacker attacks a 2x2 defender", () => {
    test(`by the corner there is one flanking position`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 2},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 3, y: 3, footprint: 1}]);
    });

    test(`by the side there are two flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 2},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 3, y: 1, footprint: 1}, {x: 3, y: 2, footprint: 1}]);
    });
})

describe("when a 3x3 attacker attacks a 1x1 defender", () => {
    test(`by the corner there is one flanking position`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 0, footprint: 3},
            defender_position: {x: 3, y: 3, footprint: 1},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 4, y: 4, footprint: 1}]);
    });

    test(`by the side and corner there are two flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 1, footprint: 3},
            defender_position: {x: 3, y: 3, footprint: 1},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 4, y: 3, footprint: 1}, {x: 4, y: 4, footprint: 1}]);
    });

    test(`by the side and two corners there are three flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 2, footprint: 3},
            defender_position: {x: 3, y: 3, footprint: 1},
            battle_grid
        })
        expect(result).toIncludeSameMembers([
            {x: 4, y: 2, footprint: 1},
            {x: 4, y: 3, footprint: 1},
            {x: 4, y: 4, footprint: 1}
        ]);
    });
})