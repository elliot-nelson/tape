
const fs = require('fs');

const program = [
    10, 17, 3, 0,
    4, 9, 0, 3,
    3, 1, 2, 0,
    4, 0, 1, 0,
    15, 0, 9, 3,
    0,0,0,0,
    11,0,0,0,
    0,0,0,0,
    65,92,93,94,
    90,7,2,3
];

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
function formatInstruction(row) {
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

function format(program) {
    const lines = [];
    let lastIndex = 255;

    // Rewind until we find a non-zero value
    for (;(program[lastIndex] || 0) === 0 && lastIndex >= 0; lastIndex--);
    for (lastIndex = lastIndex + 1; lastIndex % 4 > 0; lastIndex++);

    for (let i = 0; i < lastIndex; i += 4) {
        const row = program.slice(i, i + 4);

        lines.push([
            String(i).padStart(4, '0'),
            Buffer.from(row).toString('hex'),
            '[' + row.map(x => String(x).padStart(3, '0')).join(' ') + ']',
            row.map(x => (x < 32 || x > 126) ? '.' : String.fromCharCode(x)).join(''),
            '|',
            formatInstruction(row)
        ].join(' '));
    }

    return lines;
}

function boxwrap(lines) {
    const splitX = 38;
    const maxLength = Math.max(...lines.map(line => line.length));
    const border = '═'.repeat(maxLength + 2);
    const wrapped = [];
    wrapped.push(`╔${border.substring(0, splitX)}╤${border.substring(splitX + 1)}╗`);
    for (let line of lines) {
        line = line.replace(/\|/g, '│');
        wrapped.push(`║ ${line.padEnd(maxLength)} ║`);
    }
    wrapped.push(`╚${border.substring(0, splitX)}╧${border.substring(splitX + 1)}╝`);
    return wrapped;
}

console.log(format(program).join('\n'));
console.log(boxwrap(format(program)).join('\n'));

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
                console.log(argMatch);
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


const dick = loadFile('example.tape', {compile: true });
console.log('example:');
console.log(boxwrap(format(dick)).join('\n'));
