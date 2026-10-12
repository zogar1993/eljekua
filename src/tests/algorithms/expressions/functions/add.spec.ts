import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("$add", () => {
    test("sums resolved number parameters", () => {
        const {evaluate_expression, game_queries} = create_expression_test_context()

        expect(game_queries.evaluate_number(evaluate_expression("$add(2, 3, 4)"))).toBe(9)
    })

    test("throws when a parameter is not a number", () => {
        const {evaluate_expression, create_test_creature, bind_owner, game_queries} = create_expression_test_context()
        bind_owner(create_test_creature({name: "owner"}))

        expect(() => evaluate_expression("$add(owner, 2)")).toThrow(/not all params evaluate to numbers/)
    })
})
