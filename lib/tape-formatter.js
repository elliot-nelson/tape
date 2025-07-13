// TAPE VM
//
// Formatting Tape programs for human readability.

const { NOP, ADD, SUB, MUL, DIV, MOD, AND, OR, NOT, XOR, NOR, END, PRN, PRS, JMP, JZ, JNZ, JS, JNS } = require('./instructions');

class TapeFormatter {
    static formatInstruction(row) {
        const a = String(row[1]).padStart(3, ' ');
        const b = String(row[2]).padStart(3, ' ');
        const c = String(row[3]).padStart(3, ' ');

        switch (row[0]) {
            case NOP: return `NOP (${a}  ${b}  ${c})`;
            case ADD: return `ADD  ${a}  ${b}  ${c} `;
            case SUB: return `SUB  ${a}  ${b}  ${c} `;
            case MUL: return `MUL  ${a}  ${b}  ${c} `;
            case DIV: return `DIV  ${a}  ${b}  ${c} `;
            case MOD: return `MOD  ${a}  ${b}  ${c} `;
            case AND: return `AND  ${a}  ${b}  ${c} `;
            case OR: return  `OR   ${a}  ${b}  ${c} `;
            case NOT: return `NOT  ${a}  ${b}  ${c} `;
            case XOR: return `XOR  ${a}  ${b}  ${c} `;
            case NOR: return `NOR  ${a}  ${b}  ${c} `;
            case END: return `END (${a}  ${b}  ${c})`;
            case PRN: return `PRN  ${a} (${b}  ${c})`;
            case PRS: return `PRS  ${a}  ${b} (${c})`;
            case JMP: return `JMP  ${a} (${b}  ${c})`;
            case JZ: return  `JZ   ${a}  ${b} (${c})`;
            case JNZ: return `JNZ  ${a}  ${b} (${c})`;
            case JS: return  `JS   ${a}  ${b} (${c})`;
            case JNS: return `JNS  ${a}  ${b} (${c})`;
            default: return ``;
        }
    }

    static formatRow(address, row) {
        return [
            String(address).padStart(4, '0'),
            Buffer.from(row).toString('hex'),
            '[' + row.map(x => String(x).padStart(3, '0')).join(' ') + ']',
            row.map(x => (x < 32 || x > 126) ? '.' : String.fromCharCode(x)).join(''),
            '|',
            this.formatInstruction(row)
        ].join(' ');
    }

    static formatTape(program) {
        const lines = [];
        let lastIndex = 255;

        // Rewind until we find a non-zero value
        for (;(program[lastIndex] || 0) === 0 && lastIndex >= 0; lastIndex--);
        for (lastIndex = lastIndex + 1; lastIndex % 4 > 0; lastIndex++);

        for (let i = 0; i < lastIndex; i += 4) {
            const row = program.slice(i, i + 4);

            lines.push(this.formatRow(i, row));
        }

        return lines;
    }
}

module.exports = { TapeFormatter };
