# TAPE

A toy emulator. Simulates "tape programs", which are 256-byte magnetic tape programs run on a turing-esque emulator capable of performing a small subset of RISC-like machine instructions. There are no registers, so every instruction reads and writes directly from addresses on the tape.

I built this to play around with low-level optimization techniques; I expect it to be useful for very little in the real world.

## Machine Instructions

| Opcode | Instruction | Description                                                  |
| ------ | ----------- | ------------------------------------------------------------ |
| `000`  | `NOP`       | No-op (has no effect)                                        |
| `001`  | `ADD A B C` | `[A]` = `[B] + [C]`                                          |
| `002`  | `SUB A B C` | `[A]` = `[B] - [C]`                                          |
| `003`  | `MUL A B C` | `[A]` = `[B] * [C]`                                          |
| `004`  | `DIV A B C` | `[A]` = `[B] / [C]`                                          |
| `005`  | `MOD A B C` | `[A]` = `[B] % [C]`    (remainder)                           |
| `006`  | `AND A B C` | `[A]` = `[B] & [C]`    (binary and)                          |
| `007`  | `OR  A B C` | `[A]` = `[B] \| [C]`    (binary or)                          |
| `008`  | `NOT A B`   | `[A]` = `![B]`         (binary not)                          |
| `009`  | `XOR A B C` | `[A]` = `[B] ^ [C]`    (binary xor)                          |
| `010`  | `NOR A B C` | `[A]` = `!([B] | [C])` (binary nor)                          |
| `011`  | `END`       | End program                                                  |
| `012`  | `PRN A`†    | Print number at address `[A]`                                |
| `013`  | `PRS A B`‡  | Print string at address `[A]` of length `B`                  |
| `014`  | `JMP A`     | Jump to address in `[A]`                                     |
| `015`  | `JZ  A B`   | Jump to address in `[A]` if `[B] == 0`                       |
| `016`  | `JNZ A B`   | Jump to address in `[A]` if `[B] != 0`                       |
| `017`  | `JS  A B`   | Jump to address in `[A]` if `[B] < 0`                        |
| `018`  | `JNS A B`   | Jump to address in `[A]` if `[B] >= 0`                       |

† A "print" statement is nonsensically high-level for a machine like this, but it makes it a lot easier to play with!

‡ This is the only instruction that takes an immediate value as an operand (B) -- all other instructions read values from addresses.

## Tape Files

A "well-formed tape file" looks like this:

```text
0000 053b3c3d [005 059 060 061] .;<= | MOD   59   60   61
0004 0f383b00 [015 056 059 000] .8;. | JZ    56   59 (  0)
0008 053b3c3e [005 059 060 062] .;<> | MOD   59   60   62
0012 0b000000 [011 000 000 000] .... | END (  0    0    0)
```

The file format is similar to a classic hex debugger. Every line is 4 bytes long, with a memory address reminder on the left-hand side, followed by byte values in hexadecimal and decimal, ASCII output for printable characters, and finally an interpretation of the values as a machine instruction (if the first byte is a valid opcode).

There is no _compiler_ for TAPE, so the intent is that the programmer will write bytes by hand. For ease of use, in this case, the "canonical byte values" of every byte are the _decimal values_ within the square brackets (`[ ]`).

A tape file can also include comment lines, starting with `#`, which are ignored by the VM.

## Usage

To run a tape program:

```
bin/tape my-program.tape
```

Before starting, your tape file will be _validated_, by confirming every line is consistent (all values match what would be expected at that line for that set of canonical bytes). For safety, the program will fail to start if the tape file is not well-formed, and it will print a list of incorrect lines.

Hand-correcting a program would be extraordinarily tedious, so you can use tape to "repair" your program:

```
bin/tape -r my-program.tape > my-program2.tape
```

This will apply the diffs for you, generating a well-formed version of your original program, which you should probably check for correctness.

In most cases, you can trust tape to just update your original program file:

```
bin/tape -r -u my-program.tape
```

If you are confident in your machine instruction skills and don't care about validating your program, you can also YOLO. Buyer beware.

```
bin/tape -f my-program.tape
```

## Known issues
