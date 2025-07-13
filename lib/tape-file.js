// TAPE VM
//
// Load and save Tape programs to/from file system.

const fs = require('fs');
const { TapeFormatter } = require('./tape-formatter');

class TapeFile {
    static saveFile(filename, program) {
        const lines = TapeFormatter.formatTape(program);
        fs.writeFileSync(filename, lines.join('\n') + '\n', 'utf8');
    }

    static loadFile(filename) {
        let lines = fs.readFileSync(filename, 'utf8').split('\n');
        lines = lines.filter(line => line.trim().length > 0);

        const program = new Array(256).fill(0);
        let idx = 0;

        for (const line of lines) {
            let match = line.match(/\[(\d+) (\d+) (\d+) (\d+)\]/);
            if (match) {
                program[idx++] = Number(match[1]);
                program[idx++] = Number(match[2]);
                program[idx++] = Number(match[3]);
                program[idx++] = Number(match[4]);
            }
        }

        return { program, lines };

    }

    static generateDiff(program, originalLines) {
        const newLines = TapeFormatter.formatTape(program);
        let diffs = 0;
        let output = [];

        let aPointer = 0;
        let bPointer = 0;

        while (aPointer < newLines.length && bPointer < originalLines.length) {
            const newLine = newLines[aPointer] || '';
            const originalLine = originalLines[bPointer] || '';

            if (originalLine.startsWith('#')) {
                bPointer++;
                continue;
            }

            if (newLine.trim() !== originalLine.trim()) {
                diffs++;
                output.push([`-${originalLine}`, bPointer]);
                output.push([`+${newLine}`, bPointer]);
            }

            aPointer++;
            bPointer++;
        }

        if (bPointer < originalLines.length) {
            for (; bPointer < originalLines.length; bPointer++) {
                if (originalLines[bPointer].startsWith('#')) continue;
                output.push([`-${originalLines[bPointer]}`, bPointer]);
                diffs++;
            }
        }

        if (aPointer < newLines.length) {
            for (; aPointer < newLines.length; aPointer++) {
                output.push([`+${newLines[aPointer]}`, bPointer++]);
                diffs++;
            }
        }

        return { diffs, output };
    }

    static applyDiff(originalLines, diff) {
        let newLines = [...originalLines];

        for (const [line, index] of diff.output) {
            if (line.startsWith('-')) {
                newLines.splice(index, 1);
            } else if (line.startsWith('+')) {
                newLines.splice(index, 0, line.slice(1).trim());
            }
        }

        return newLines;
    }
}

module.exports = { TapeFile };
