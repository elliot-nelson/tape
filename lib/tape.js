// TAPE VM

const { NOP, ADD, SUB, MUL, DIV, MOD, AND, OR, NOT, XOR, NOR, END, PRN, PRS, JMP, JZ, JNZ, JS, JNS } = require('./instructions');

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
                this.printNumber(a);
                break;
            case PRS:
                this.printString(a, b);
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
                throw new TapeError(`FATAL Invalid instruction: ${String(address).padStart(4, '0')} ${opcode} ${a} ${b} ${c}`);
        }
    }
}

module.exports = { Tape, TapeError };
