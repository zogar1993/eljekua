import {Creature} from "scripts/battlegrid/creatures/Creature";
import {assert} from "scripts/assert";
import {Expr} from "scripts/expressions/evaluator/types";
import {Instruction} from "scripts/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";

export const create_power_frame = ({power_name, instructions, owner}: {
    power_name: string,
    instructions: Array<Instruction>,
    owner: Creature
}): PowerFrame => {
    const self = {
        instructions: [...instructions],
        variables: new Map<string, Expr>(),
    }

    const set_variable = (name: string, variable: Expr) => {
        self.variables.set(name, variable)
    }

    const peek_instruction = (): Instruction => {
        assert(self.instructions.length > 0, () => "no instructions left when calling peek instruction")
        return self.instructions[0]
    }

    const next_instruction = (): Instruction => {
        assert(self.instructions.length > 0, () => "no instructions left when calling next instruction")
        const [next, ...instructions] = self.instructions
        self.instructions = instructions
        return next
    }

    const has_instructions = (): boolean => {
        return self.instructions.length > 0
    }

    const has_variable = (name: string): boolean => {
        return self.variables.has(name)
    }

    const add_instructions = (instructions: Array<Instruction>): void => {
        self.instructions = [...instructions, ...self.instructions]
    }

    const get_variable = (name: string): Expr => {
        const variable = self.variables.get(name)
        //TODO P3 make error handling smoother everywhere
        if (!variable)
            throw Error(`variable '${name}' not found in context. Context: ${to_formatted_json_string(self.variables)}. Power: '${power_name}.'`)
        return variable
    }

    set_variable(SYSTEM_KEYWORD.OWNER, {type: "creatures", value: [owner]})

    const get_instructions = (): Array<Instruction> => self.instructions
    const get_variables = (): Map<string, Expr> => self.variables

    return {
        set_variable,
        peek_instruction,
        next_instruction,
        has_instructions,
        has_variable,
        add_instructions,
        get_variable,
        power_name,
        get_instructions,
        get_variables
    }
}

export type PowerFrame = {
    set_variable: (name: string, variable: Expr) => void
    peek_instruction: () => Instruction
    next_instruction: () => Instruction
    has_instructions: () => boolean
    has_variable: (name: string) => boolean
    add_instructions: (instructions: Array<Instruction>) => void
    get_variable: (name: string) => Expr
    power_name: string

    //TODO this is ugly, separate church from state
    get_instructions: () => Array<Instruction>
    get_variables: () => Map<string, Expr>
}

const to_formatted_json_string = (obj: object) => JSON.stringify(obj, null, 2)
