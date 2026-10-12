import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("number literal", () => {
    test("evaluates zero", () => {
        const {evaluate_expression, game_queries} = create_expression_test_context()

        expect(game_queries.evaluate_number(evaluate_expression("0"))).toBe(0)
    })

    test("evaluates a positive number", () => {
        const {evaluate_expression, game_queries} = create_expression_test_context()

        expect(game_queries.evaluate_number(evaluate_expression("5"))).toBe(5)
    })
})
