import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("owner keyword", () => {
    test("resolves to the bound creature", () => {
        const {evaluate_expression, create_test_creature, bind_owner, game_queries} = create_expression_test_context()
        const owner = create_test_creature({name: "owner"})
        bind_owner(owner)

        expect(game_queries.evaluate_creature(evaluate_expression("owner"))).toBe(owner)
    })

    test("throws when owner is not bound", () => {
        const {evaluate_expression, game_queries} = create_expression_test_context()

        expect(() => evaluate_expression("owner")).toThrow()
    })
})
