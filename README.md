# TAPE

A toy emulator. Simulates "tape programs", which are 4096-byte magnetic tape programs run on a turing-esque emulator capable of performing a small subset of RISC-like machine instructions. There are no registers, so every instruction reads and writes directly from addresses on the tape.

I built this to play around with low-level optimization techniques; I expect it to be useful for very little in the real world.

## Machine Instructions

### Opcode Table

| Opcode | Instruction    | Description                                                 |
| ------ | -------------- | ----------------------------------------------------------- |
| `000`  | `NOP`          | No-op (has no effect)                                       |
| `001`  | `ADD   A B C`  | `[A]` = `[B] + [C]`                                         |
| `002`  | `SUB   A B C`  | `[A]` = `[B] - [C]`                                         |
| `003`  | `MUL   A B C`  | `[A]` = `[B] * [C]`                                         |
| `004`  | `DIV   A B C`  | `[A]` = `[B] / [C]`                                         |
| `005`  | `MOD   A B C`  | `[A]` = `[B] % [C]`    (remainder)                          |
| `006`  | `AND   A B C`  | `[A]` = `[B] & [C]`    (binary and)                         |
| `007`  | `OR    A B C`  | `[A]` = `[B] \| [C]`   (binary or)                          |
| `008`  | `NOT   A B`    | `[A]` = `![B]`         (binary not)                         |
| `009`  | `XOR   A B C`  | `[A]` = `[B] ^ [C]`    (binary xor)                         |
| `010`  | `NOR   A B C`  | `[A]` = `!([B] | [C])` (binary nor)                         |
| `011`  | `END`          | End program                                                 |
| `012`  | `PRN   A`†     | Print number at address `[A]`                               |
| `013`  | `PRS   A B`‡   | Print string at address `[A]` of length `B`                 |
| `014`  | `JMP   A`      | Jump to address in `[A]`                                    |
| `015`  | `JZ    A B`    | Jump to address in `[A]` if `[B] == 0`                      |
| `016`  | `JNZ   A B`    | Jump to address in `[A]` if `[B] != 0`                      |
| `017`  | `JS    A B`    | Jump to address in `[A]` if `[B] < 0`                       |
| `018`  | `JNS   A B`    | Jump to address in `[A]` if `[B] >= 0`                      |
| `024`  | `PAG   A B C`‡ | Set memory page offsets for slots A, B, and C               |
| `065`  | `ADDW  A B C`  | Add word (2 bytes)                                          |
| `066`  | `SUBW  A B C`  | Subtract word (2 bytes)                                     |
| `067`  | `MULW  A B C`  | Multiply word (2 bytes)                                     |
| `068`  | `DIVW  A B C`  | Divide word (2 bytes)                                       |
| `069`  | `MODW  A B C`  | Modulo word (2 bytes)                                       |
| `070`  | `ANDW  A B C`  | Binary and word (2 bytes)                                   |
| `071`  | `ORW   A B C`  | Binary or word (2 bytes)                                    |
| `072`  | `NOTW  A B`    | Binary not word (2 bytes)                                   |
| `073`  | `XORW  A B C`  | Binary xor word (2 bytes)                                   |
| `074`  | `NORW  A B C`  | Binary nor word (2 bytes)                                   |
| `076`  | `PRNW  A`†     | Print 2-byte number at address `[A]`                        |
| `129`  | `ADDDW A B C`  | Add dword (4 bytes)                                         |
| `130`  | `SUBDW A B C`  | Subtract dword (4 bytes)                                    |
| `131`  | `MULDW A B C`  | Multiply dword (4 bytes)                                    |
| `132`  | `DIVDW A B C`  | Divide dword (4 bytes)                                      |
| `133`  | `MODDW A B C`  | Modulo dword (4 bytes)                                      |
| `134`  | `ANDDW A B C`  | Binary and dword (4 bytes)                                  |
| `135`  | `ORDW  A B C`  | Binary or dword (4 bytes)                                   |
| `136`  | `NOTDW A B`    | Binary not dword (4 bytes)                                  |
| `137`  | `XORDW A B C`  | Binary xor dword (4 bytes)                                  |
| `138`  | `NORDW A B C`  | Binary nor dword (4 bytes)                                  |
| `140`  | `PRNDW A`†     | Print 4-byte number at address `[A]`                        |

† A "print" statement is nonsensically high-level for a machine like this, but it makes it a lot easier to play with!

‡ Rare instructions that take an immediate value. Operand (B) of `PRS` is an immediate value, as are all operands of `PAG`. For all other instructions, every value is a pointer to an address.

### Byte Values

By default, all operations are 1 byte (8-bit) operations. Several operations also have a "W" (word) variant, which adds `64` to the opcode and operates on 2 bytes (16 bits). Finally, "DW" (double word) variants add `128` to the opcode and operate on 4 bytes (32 bits).

For word and dword variants, math is performed little-endian (lowest bits are in first byte, highest bits in last byte).

### Memory page offsets

Although there are operations that support reading and writing multiply bytes, the operands to an individual instruction are always a single byte, and thus can only _address_ up to 256 bytes of tape memory at a time. In order to read and write the full tape, the `PAG` instruction can be used to set the memory page offset (from 0 to 15).

 - There are 3 operands to the `PAG` instruction, which set the memory page offset for slots A, B, and C.
 - These slots roughly correspond to the operands passed to each instruction: for example, `PAG 1 0 0` means that memory page 1 is set for the first operand, while memory page 0 is set for the second and third operand. So, `ADD 7 31 34` would read the values of addresses `31` and `34`, and then place the result in memory address `263` (7 + 256).
 - Jumps are special, in that they read memory to determine the target address and then jump to the target address (thus requiring 2 applications of memory page offset). For all jumps, slot A determines the page offset of the memory address read, and the value retrieved is jumped to within the memory page offset of slot C.

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
