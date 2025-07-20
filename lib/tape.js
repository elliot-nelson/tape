// TAPE VM

const { NOP, ADD, SUB, MUL, DIV, MOD, AND, OR, NOT, XOR, NOR, END, PRN, PRS, JMP, JZ, JNZ, JS, JNS, PAG, ADDW, SUBW, MULW, DIVW, MODW, ANDW, ORW, NOTW, XORW, NORW, PRNW, ADDDW, SUBDW, MULDW, DIVDW, MODDW, ANDDW, ORDW, NOTDW, XORDW, NORDW, PRNDW } = require('./instructions');
const { TapeFormatter } = require('./tape-formatter.js');

class TapeError extends Error {
    constructor(message) {
        super(message);
    }
}

class Tape {
    constructor(program = [], options = {}) {
        this.load(program);
        this.trace = options?.trace || false;
    }

    clear() {
        this.tape = new Array(256).fill(0);
        this.ip = 0;
        this.next = 0;
        this.history = [];
    }

    load(program = []) {
        this.clear();
        for (let i = 0; i < program.length && i < 256; i++) {
            this.write(i, program[i]);
        }
    }

    signed(value, bytes = 1) {
        const signedBit = 1 << (bytes * 8 - 1);

        if (value & signedBit) {
            const mask = (1 << (bytes * 8)) - 1;
            const halfMask = mask >> 1;

            return -((~value & halfMask) + 1);
        } else {
            return value;
        }
    }

    read(address, signed = true, bytes = 1) {
        let value = 0;
        for (let i = 0; i < bytes; i++) {
            if (address + i < 0 || address + i >= this.tape.length) {
                throw new TapeError(`FATAL Attempted read out of bounds: ${address + i}`);
            }
            value |= (this.tape[address + i] & 0xFF) << (i * 8);
        }
        if (signed) {
            return this.signed(value, bytes);
        } else {
            return value;
        }
    }

    write(address, value, bytes = 1) {
        let bytesWritten = [];

        if (typeof value !== 'number' || (value | 0) !== value) {
            throw new TapeError(`INTERNAL Attempted to write non-integer value: ${value}`);
        }

        for (let i = 0; i < bytes; i++) {
            if (address + i < 0 || address + i >= this.tape.length) {
                throw new TapeError(`FATAL Attempted write out of bounds: ${address + i}`);
            }
            let byteValue = (value >> (i * 8)) & 0xFF;
            this.tape[address + i] = byteValue;
            bytesWritten.push(byteValue);
        }

        if (this.history.length > 0) {
            this.history[this.history.length - 1].write = [address, bytesWritten];
        }
    }

    run(entrypoint = 0, options = {}) {
        this.ip = entrypoint;

        try {
            for (;;) {
                this.next = this.ip + 4;
                this.execute(this.ip);

                if (this.history.length > 0 && this.trace) {
                    console.error(TapeFormatter.formatHistoryEntry(this.history[this.history.length - 1]));
                }

                if (this.next < 0 || this.next >= this.tape.length) {
                    break;
                }

                this.ip = this.next;
            }
        } catch (e) {
            console.log('catching');
            if (e instanceof TapeError) {
                e.history = this.history;
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

        if (this.history.length > 8) {
            this.history.shift();
        }
        this.history.push({ ip: address, row: [opcode, a, b, c] });

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
                throw new TapeError(`FATAL Invalid instruction: ${TapeFormatter.formatRow(address, [opcode, a, b, c])}`);
        }
    }
}

module.exports = { Tape, TapeError };
