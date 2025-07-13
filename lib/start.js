const fs = require('fs');
const { Tape, TapeError } = require('./tape.js');
const { TapeFormatter } = require('./tape-formatter.js');
const { TapeFile } = require('./tape-file.js');

function help() {
    console.error('Usage: tape [options] <tape-file>');
    console.error('Options:');
    console.error('  -f      Force (run program even if not well-formed)');
    console.error('  -r      Repair (print well-formed version of tape)');
    console.error('  -u      Update (if -r specified, update the input tape file)');
    console.error('');
}

function main(args) {
    let tapeFile = undefined;
    let options = {
        force: false,
        repair: false,
        update: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-h' || args[i] === '--help') {
            help();
            process.exit(0);
        } else if (args[i] === '-f' || args[i] === '--force') {
            options.force = true;
        } else if (args[i] === '-r' || args[i] === '--repair') {
            options.repair = true;
        } else if (args[i] === '-u' || args[i] === '--update') {
            options.update = true;
        } else if (args[i].startsWith('-')) {
            help();
            console.error(`Unknown option: ${args[i]}`);
            process.exit(1);
        } else {
            if (tapeFile) {
                help();
                console.error('Only one tape file can be specified.');
                process.exit(1);
            }
            tapeFile = args[i];
        }
    }

    if (!tapeFile) {
        help();
        process.exit(1);
    }

    const tapefile = TapeFile.loadFile(tapeFile);
    const diff = TapeFile.generateDiff(tapefile.program, tapefile.lines);

    if (diff.diffs > 0 || options.repair) {
        if (options.repair) {
            console.error('Repairing tape file...');
            console.error(tapefile.program);
            const result = TapeFile.applyDiff(tapefile.lines, diff).join('\n');
            console.log(result);
            if (options.update) {
                fs.writeFileSync(tapeFile, result + '\n', 'utf8');
                console.error(`Tape file ${tapeFile} updated in place.`);
            }
            process.exit(0);
        } else {
            throw new Error([
                `Compilation failed: your program may behave inconsistently.`,
                `Diff (${diff.diffs} lines):`,
                ...diff.output
            ].join('\n'));
        }
    }

    console.error('-'.repeat(64));
    console.error(TapeFormatter.formatTape(tapefile.program).join('\n'));
    console.error('-'.repeat(64));

    const tape = new Tape(tapefile.program);
    tape.run();
}

main(process.argv.slice(2));
