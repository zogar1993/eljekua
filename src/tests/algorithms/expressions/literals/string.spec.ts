import {create_expression_test_context} from "tests/utils/create_expression_test_context";

describe("string literal", () => {
    test("evaluates to a string", () => {
        const {evaluate_expression, game_queries} = create_expression_test_context()

        expect(game_queries.evaluate_string(evaluate_expression(`"kobold"`))).toBe("kobold")
    })
})
