import {tokenize} from './tokenize';

test('number literal', () => expect(tokenize("0")).toEqual([{type: "number", value: 0}]));

test('positive number literal', () => expect(tokenize("13")).toEqual([{type: "number", value: 13}]));

test('negative number literal', () => expect(tokenize("-13")).toEqual([{type: "number", value: -13}]));

test('keyword', () => expect(tokenize("owner")).toEqual([{type: "keyword", value: "owner"}]));

test('property', () => expect(tokenize("owner.movement")).toEqual([
    {type: "keyword", value: "owner", property: "movement"},
]));

test('plus sign', () => expect(tokenize("3 + 2")).toEqual([
    {type: "number", value: 3},
    {type: "number", value: 2},
]));

test('minus sign', () => expect(tokenize("3 - 2")).toEqual([
    {type: "number", value: 3},
    {type: "number", value: 2, negative: true},
]));