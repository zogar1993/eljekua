import {assert} from "assert";

import {AstNodeNumberResolved} from "expressions/token_evaluator/types";

(window as any).rig_dice_roll = (faces: number, result: number) => {
    const rigs = rigged_rolls[faces]
    if (rigs === undefined) throw Error(`You can only throw D&D dice, there is no 'd${faces}'`)
    rigged_rolls[faces] = [...rigs, result]
}

const rigged_rolls: Record<number, Array<number>> =  {
    4: [],
    6: [],
    8: [],
    10: [],
    12: [],
    20: []
}

const get_rigged_roll = (faces: number) => {
    const rigs = rigged_rolls[faces]
    if (rigs === undefined) throw Error(`You can only throw D&D dice, there is no 'd${faces}'`)
    if (rigs.length === 0) return null
    const result = rigs[0]
    rigged_rolls[faces] = rigs.slice(1)
    return result
}

export const roll_d = (faces: number): AstNodeNumberResolved => {
    const rigged_roll = get_rigged_roll(faces)

    return {
        type: "number_resolved",
        value: rigged_roll === null ? get_random_number({min: 1, max: faces}) : rigged_roll,
        description: `d${faces}`
    }
}

const get_random_number = ({min, max}: { min: number, max: number }) => {
    assert(min <= max, () => "min can not be lower than max")
    const result = Math.floor(random() * (max - min + 1)) + min
    assert(min <= result && result <= max, () => `result of random needs to be between mind and max, was ${result}`)
    return result
}

let seed = new Date().getTime()

const random = () => {
    seed += 1
    return new MersenneTwister(seed).random()
}

// Adapted from https://gist.github.com/banksean/300494
class MersenneTwister {
    /* Period parameters */
    N = 624;
    M = 397;
    MATRIX_A = 0x9908b0df;   /* constant vector a */
    UPPER_MASK = 0x80000000; /* most significant w-r bits */
    LOWER_MASK = 0x7fffffff; /* least significant r bits */

    mt = new Array(this.N); /* the array for the state vector */
    mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */

    constructor(seed?: number) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }
        this.init_genrand(seed);
    }


    /* initializes mt[N] with a seed */
    init_genrand = (s: number) => {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            const s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
                + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    }

    genrand_int32 = () => {
        var y;
        var mag01 = new Array(0x0, this.MATRIX_A);
        /* mag01[x] = x * MATRIX_A  for x=0,1 */

        if (this.mti >= this.N) { /* generate N words at one time */
            var kk;

            if (this.mti == this.N + 1)   /* if init_genrand() has not been called, */
                this.init_genrand(5489); /* a default initial seed is used */

            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

            this.mti = 0;
        }

        y = this.mt[this.mti++];

        /* Tempering */
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);

        return y >>> 0;
    }

    /* generates a random number on [0,1)-real-interval */
    random = () => this.genrand_int32() * (1.0 / 4294967296.0);
}