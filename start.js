
const { Tape, TapeError } = require('./tape.js');
const { TapeFile } = require('./tape-file.js');
console.error('statring');

const args = process.argv.slice(2);

let tapeFile = undefined;
let options = {
    repair: false,
    compile: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-c') {
        options.compile = true;
    } else if (args[i] === '-r') {
        options.repair = true;
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

if (diff.diffs > 0) {
    if (options.repair) {
        console.error('Repairing tape file...');
        console.log(TapeFile.applyDiff(tapefile.program, tapefile.lines, diff).join('\n'));;
        console.error('Tape file repaired successfully.');
        process.exit(0);
    } else {
        throw new Error([
            `Compilation failed: your program may behave inconsistently.`,
            `Diff (${diff.diffs} lines):`,
            ...diff.output
        ].join('\n'));
    }
}

console.log(TapeFile.formatTape(tapefile.program).join('\n'));

const tape = new Tape(tapefile.program);
tape.run();
