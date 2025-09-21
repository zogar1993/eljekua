import {Instruction, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {Creature} from "battlegrid/creatures/Creature";
import {Path, Position} from "battlegrid/Position";
import {assert} from "assert";
import {AstNodeNumberResolved} from "interpreter/interpret_token";

export class PowerContext {
    private variables: Map<string, VariableType> = new Map()
    private instructions: Array<Instruction> = []
    readonly power_name
    status: "none" | "hit" | "miss" = "none"

    constructor({name, instructions, owner}: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature
    }) {
        this.instructions = instructions
        this.power_name = name
        this.set_creature({name: "owner", value: owner})
    }

    owner = () => this.get_creature("owner")

    set_variable = ({name, ...variable}: { name: string } & VariableType) => {
        this.variables.set(name, variable)
    }

    set_creature = ({name, value}: { name: string, value: Creature }) => {
        this.variables.set(name, {type: "creature", value})
    }

    set_creatures = ({name, value}: { name: string, value: Array<Creature> }) => {
        this.variables.set(name, {type: "creatures", value})
    }

    set_path = ({name, value}: { name: string, value: Path }) => {
        this.variables.set(name, {type: "path", value})
    }

    set_resolved_number = ({name, value}: { name: string, value: AstNodeNumberResolved }) => {
        this.variables.set(name, {type: "resolved_number", value})
    }

    get_power = (name: string): PowerVM => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "power") throw Error(`variable ${name} expected to be a 'power', but its a '${variable.type}'`)
        return variable.value
    }

    get_creature = (name: string): Creature => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "creature") throw Error(`variable ${name} expected to be a 'creature', but its a '${variable.type}'`)
        return variable.value
    }

    get_creatures = (name: string): Array<Creature> => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type === "creature") return [variable.value]
        if (variable.type === "creatures") return variable.value
        throw Error(`variable ${name} expected to be a 'creature' or 'creatures', but its a '${variable.type}'`)
    }

    get_position = (name: string): Position => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "position") throw Error(`variable ${name} expected to be a 'position', but its a '${variable.type}'`)
        return variable.value
    }

    get_path = (name: string): Path => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "path") throw Error(`variable ${name} expected to be a 'path', but its a '${variable.type}'`)
        return variable.value
    }

    peek_instruction = (): Instruction => {
        assert(this.instructions.length > 0, () => "no instructions left when calling peek instruction")
        return this.instructions[0]
    }

    next_instruction = (): Instruction => {
        assert(this.instructions.length > 0, () => "no instructions left when calling next instruction")
        const [next, ...instructions] = this.instructions
        this.instructions = instructions
        return next
    }

    has_instructions = (): boolean => {
        return this.instructions.length > 0
    }

    has_variable = (name: string): boolean => {
        return this.variables.has(name)
    }

    add_instructions = (instructions: Array<Instruction>): void => {
        this.instructions = [...instructions, ...this.instructions]
    }

    get_variable = (name: string) => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        return variable
    }
}

export type VariableType =
    VariableTypeCreature
    | VariableTypePosition
    | VariableTypePath
    | VariableTypeCreatures
    | VariableTypeResolvedNumber
    | VariableTypePower

type VariableTypeCreature = { type: "creature", value: Creature }
type VariableTypeCreatures = { type: "creatures", value: Array<Creature> }
type VariableTypePosition = { type: "position", value: Position }
type VariableTypePath = { type: "path", value: Path }
type VariableTypeResolvedNumber = { type: "resolved_number", value: AstNodeNumberResolved }
type VariableTypePower = { type: "power", value: PowerVM }
