
const fs = require('fs');

const { Tape, TapeError } = require('./tape.js');
const { TapeFile } = require('./tape-file.js');
console.error('statring');

const args = process.argv.slice(2);

let tapeFile = undefined;
let options = {
    repair: false,
    compile: false,
    update: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-c') {
        options.compile = true;
    } else if (args[i] === '-r') {
        options.repair = true;
    } else if (args[i] === '-u') {
        options.update = true;
    } else if (args[i].startsWith('-')) {
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    } else {
        if (tapeFile) {
            console.error('Only one tape file can be specified.');
            process.exit(1);
        }
        tapeFile = args[i];
    }
}

if (!tapeFile) {
    process.exit(1);
}

const tapefile = TapeFile.loadFile(tapeFile);

const diff = TapeFile.generateDiff(tapefile.program, tapefile.lines);

console.error(options);
if (diff.diffs > 0 || options.repair) {
    if (options.repair) {
        console.error('Repairing tape file...');
        console.error(tapefile.program);
        const result = TapeFile.applyDiff(tapefile.program, tapefile.lines, diff).join('\n');
        console.log(result);
        if (options.update) {
            fs.writeFileSync(tapeFile, result + '\n', 'utf8');
            console.error(`Tape file ${tapeFile} updated in place.`);
        }
        console.error('FUCK');
        process.exit(0);
    } else {
        throw new Error([
            `Compilation failed: your program may behave inconsistently.`,
            `Diff (${diff.diffs} lines):`,
            ...diff.output
        ].join('\n'));
    }
    console.error('what?');
}

console.error('somehow out of it');

console.error(TapeFile.formatTape(tapefile.program).join('\n'));

const tape = new Tape(tapefile.program);
tape.run();
