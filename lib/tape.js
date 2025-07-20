// TAPE VM

const { NOP, ADD, SUB, MUL, DIV, MOD, AND, OR, NOT, XOR, NOR, END, PRN, PRS, JMP, JZ, JNZ, JS, JNS, PAG, ADDW, SUBW, MULW, DIVW, MODW, ANDW, ORW, NOTW, XORW, NORW, PRNW, ADDDW, SUBDW, MULDW, DIVDW, MODDW, ANDDW, ORDW, NOTDW, XORDW, NORDW, PRNDW } = require('./instructions');
const { TapeFormatter } = require('./tape-formatter.js');

const MAX_PROGRAM_LENGTH = 4096;

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
        this.tape = new Array(MAX_PROGRAM_LENGTH).fill(0);
        this.ip = 0;
        this.next = 0;
        this.memoryPageOffset = [0, 0, 0];
        this.history = [];
    }

    load(program = []) {
        this.clear();
        for (let i = 0; i < program.length && i < MAX_PROGRAM_LENGTH; i++) {
            this.tape[i] = program[i] & 0xFF;
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
        this.memoryPageOffset = [0, 0, 0];

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

    printNumber(address, bytes = 1) {
        const value = this.read(address, true, bytes);
        process.stdout.write(value.toString(10));
    }

    printString(address, length) {
        for (let i = 0; i < length; i++) {
            const charCode = this.read(address + i);
            process.stdout.write(String.fromCharCode(charCode));
        }
    }

    pageA(address) {
        return address + (this.memoryPageOffset[0] * 256);
    }

    pageB(address) {
        return address + (this.memoryPageOffset[1] * 256);
    }

    pageC(address) {
        return address + (this.memoryPageOffset[2] * 256);
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
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) + this.read(this.pageC(c))
                );
                break;
            case ADDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) + this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case ADDDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) + this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case SUB:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) - this.read(this.pageC(c))
                );
                break;
            case SUBW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) - this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case SUBDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) - this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case MUL:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) * this.read(this.pageC(c))
                );
                break;
            case MULW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) * this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case MULDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) * this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case DIV:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) / this.read(this.pageC(c))
                );
                break;
            case DIVW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) / this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case DIVDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) / this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case MOD:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) % this.read(this.pageC(c))
                );
                break;
            case MODW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) % this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case MODDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) % this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case AND:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) & this.read(this.pageC(c))
                );
                break;
            case ANDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) & this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case ANDDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) & this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case OR:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) | this.read(this.pageC(c))
                );
                break;
            case ORW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) | this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case ORDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) | this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case NOT:
                this.write(this.pageA(a), ~this.read(this.pageB(b)));
                break;
            case NOTW:
                this.write(this.pageA(a), ~this.read(this.pageB(b), true, 2), 2);
                break;
            case NOTDW:
                this.write(this.pageA(a), ~this.read(this.pageB(b), true, 4), 4);
                break;
            case XOR:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b)) ^ this.read(this.pageC(c))
                );
                break;
            case XORW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 2) ^ this.read(this.pageC(c), true, 2),
                    2
                );
                break;
            case XORDW:
                this.write(
                    this.pageA(a),
                    this.read(this.pageB(b), true, 4) ^ this.read(this.pageC(c), true, 4),
                    4
                );
                break;
            case NOR:
                this.write(
                    this.pageA(a),
                    ~(this.read(this.pageB(b)) | this.read(this.pageC(c)))
                );
                break;
            case NORW:
                this.write(
                    this.pageA(a),
                    ~(this.read(this.pageB(b), true, 2) | this.read(this.pageC(c), true, 2)),
                    2
                );
                break;
            case NORDW:
                this.write(
                    this.pageA(a),
                    ~(this.read(this.pageB(b), true, 4) | this.read(this.pageC(c), true, 4)),
                    4
                );
                break;
            case END:
                this.next = -1;
                break;
            case PRN:
                this.printNumber(this.pageA(a));
                break;
            case PRNW:
                this.printNumber(this.pageA(a), 2);
                break;
            case PRNDW:
                this.printNumber(this.pageA(a), 4);
                break;
            case PRS:
                this.printString(this.pageA(a), b);
                break;
            case JMP:
                this.next = this.pageC(this.read(this.pageA(a), false));
                break;
            case JZ:
                if (this.read(this.pageB(b)) === 0) {
                    this.next = this.pageC(this.read(this.pageA(a), false));
                }
                break;
            case JNZ:
                if (this.read(this.pageB(b)) !== 0) {
                    this.next = this.pageC(this.read(this.pageA(a), false));
                }
                break;
            case JS:
                if (this.read(this.pageB(b)) < 0) {
                    this.next = this.pageC(this.read(this.pageA(a), false));
                }
                break;
            case JNS:
                if (this.read(this.pageB(b)) >= 0) {
                    this.next = this.pageC(this.read(this.pageA(a), false));
                }
                break;
            case PAG:
                this.memoryPageOffset = [a, b, c];
                break;
            default:
                throw new TapeError(`FATAL Invalid instruction: ${TapeFormatter.formatRow(address, [opcode, a, b, c])}`);
        }
    }
}

module.exports = { Tape, TapeError };
