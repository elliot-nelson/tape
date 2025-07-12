
const fs = require('fs');

const NOP = 0;
const ADD = 1;
const SUB = 2;
const MUL = 3;
const DIV = 4;
const MOD = 5;
const AND = 6;
const OR = 7;
const NOT = 8;
const XOR = 9;
const NOR = 10;
const END = 11;
const PRN = 12;
const PRS = 13;
const JMP = 14;
const JZ = 15;
const JNZ = 16;
const JS = 17;
const JNS = 18;

class TapeError extends Error {
    constructor(message) {
        super(message);
    }
}

class Tape {
    constructor(program = []) {
        this.load(program);
    }

    clear() {
        this.tape = new Array(256).fill(0);
        this.ip = 0;
        this.next = 0;
    }

    load(program = []) {
        this.clear();
        for (let i = 0; i < program.length && i < 256; i++) {
            this.write(i, program[i]);
        }
    }

    read(address) {
        if (address < 0 || address >= this.tape.length) {
            throw new TapeError(`FATAL Attempted read out of bounds: ${address}`);
        }
        return this.tape[address];
    }

    write(address, value) {
        if (address < 0 || address >= this.tape.length) {
            throw new TapeError(`FATAL Attempted write out of bounds: ${address}`);
        }
        if (typeof value !== 'number' || (value | 0) !== value) {
            throw new TapeError(`INTERNAL Attempted to write non-integer value: ${value}`);
        }
        if (value < -127 || value > 127) {
            throw new TapeError(`FATAL Attempted write of overflow ${value} at ${address}`);
        }
        this.tape[address] = value;
    }

    run(entrypoint = 0) {
        this.ip = entrypoint;

        try {
            for (;;) {
                this.next = this.ip + 4;
                this.execute(this.ip);

                if (this.next < 0 || this.next >= this.tape.length) {
                    break;
                }

                this.ip = this.next;
            }
        } catch (e) {
            if (e instanceof TapeError) {
                console.error(this.ip);
            }
            throw e;
        }
    }

    printNumber(address) {
        const value = this.read(address);
        process.stdout.write(value.toString(10));
    }

    printString(address, length) {
        for (let i = 0; i < length; i++) {
            const charCode = this.read(address + i);
            process.stdout.write(String.fromCharCode(charCode));
        }
    }

    execute(address) {
        const opcode = this.read(address);
        const a = this.read(address + 1);
        const b = this.read(address + 2);
        const c = this.read(address + 3);

        this.next = address + 4;

        switch (opcode) {
            case NOP:
                break;
            case ADD:
                this.write(a, this.read(b) + this.read(c));
                break;
            case SUB:
                this.write(a, this.read(b) - this.read(c));
                break;
            case MUL:
                this.write(a, this.read(b) * this.read(c));
                break;
            case DIV:
                this.write(a, this.read(b) / this.read(c));
                break;
            case MOD:
                this.write(a, this.read(b) % this.read(c));
                break;
            case AND:
                this.write(a, this.read(b) & this.read(c));
                break;
            case OR:
                this.write(a, this.read(b) | this.read(c));
                break;
            case NOT:
                this.write(a, ~this.read(b));
                break;
            case XOR:
                this.write(a, this.read(b) ^ this.read(c));
                break;
            case NOR:
                this.write(a, ~(this.read(b) | this.read(c)));
                break;
            case END:
                this.next = -1;
                break;
            case PRN:
                this.printNumber(this.read(a));
                break;
            case PRS:
                this.printString(this.read(a), this.read(b));
                break;
            case JMP:
                this.next = this.read(a);
                break;
            case JZ:
                if (this.read(b) === 0) {
                    this.next = this.read(a);
                }
                break;
            case JNZ:
                if (this.read(b) !== 0) {
                    this.next = this.read(a);
                }
                break;
            case JS:
                if (this.read(b) < 0) {
                    this.next = this.read(a);
                }
                break;
            case JNS:
                if (this.read(b) >= 0) {
                    this.next = this.read(a);
                }
                break;
            default:
                throw new TapeError(`FATAL Invalid instruction: ${opcode}`);
        }
    }
}


function loadFile(filename, options = {}) {
        let lines = fs.readFileSync(filename, 'utf8').split('\n');
        lines = lines.filter(line => line.trim().length > 0);

        const program = [];

        let possibleFormat = undefined;

        for (const line of lines) {
            if (options.compile) {
                let match = line.match(/(NOP|ADD|SUB|MUL|DIV|MOD|AND|OR| NOT|XOR|NOR|END|PRN|PRS|JMP|JZ|JNZ|JS|JNS)(.+)/);
                if (match) {
                    const op = match[1].trim();
                    const argMatch = match[2].match(/(\d+)?.*?(\d+)?.*?(\d+)?.*?/);
                    console.error(argMatch);
                }
            } else {
                let match = line.match(/\[(\d+) (\d+) (\d+) (\d+)\]/);
                if (match) {
                    program.push(Number(match[1]));
                    program.push(Number(match[2]));
                    program.push(Number(match[3]));
                    program.push(Number(match[4]));

                    if (possibleFormat === undefined) {
                        if (line.indexOf('║') >= 0) {
                            possibleFormat = 'box';
                        } else {
                            possibleFormat = 'text';
                        }
                    }
                }
            }
        }

        return program;
    }


module.exports = {
    Tape,
    TapeError,
    loadFile
};
