// TAPE VM
//
// Internal constants for machine instruction set.

const WORD = 64;
const DWORD = 128;

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

const PAG = 24;

const ADDW = ADD + WORD;
const SUBW = SUB + WORD;
const MULW = MUL + WORD;
const DIVW = DIV + WORD;
const MODW = MOD + WORD;
const ANDW = AND + WORD;
const ORW = OR + WORD;
const NOTW = NOT + WORD;
const XORW = XOR + WORD;
const NORW = NOR + WORD;
const PRNW = PRN + WORD;

const ADDDW = ADD + DWORD;
const SUBDW = SUB + DWORD;
const MULDW = MUL + DWORD;
const DIVDW = DIV + DWORD;
const MODDW = MOD + DWORD;
const ANDDW = AND + DWORD;
const ORDW = OR + DWORD;
const NOTDW = NOT + DWORD;
const XORDW = XOR + DWORD;
const NORDW = NOR + DWORD;
const PRNDW = PRN + DWORD;

module.exports = {
    NOP,
    ADD,
    SUB,
    MUL,
    DIV,
    MOD,
    AND,
    OR,
    NOT,
    XOR,
    NOR,
    END,
    PRN,
    PRS,
    JMP,
    JZ,
    JNZ,
    JS,
    JNS,
    PAG,
    ADDW,
    SUBW,
    MULW,
    DIVW,
    MODW,
    ANDW,
    ORW,
    NOTW,
    XORW,
    NORW,
    PRNW,
    ADDDW,
    SUBDW,
    MULDW,
    DIVDW,
    MODDW,
    ANDDW,
    ORDW,
    NOTDW,
    XORDW,
    NORDW,
    PRNDW
};
