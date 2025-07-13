# TAPE: FizzBuzz (Version 1)
#
# Prints the numbers from 1-100.
#  - Multiples of "3" print "Fizz" instead.
#  - Multiples of "5" print "Buzz" instead.
#  - Multiple of both print "FizzBuzz" instead.
#
# NOP = 0
# ADD = 1 SUB = 2 MUL = 3 DIV = 4 MOD = 5
# AND = 6 OR = 7 NOT = 8 XOR = 9 NOR = 10
# END = 11
# PRN = 12 PRS = 13
# JMP = 14 JZ = 15 JNZ = 16 JS = 17 JNS = 18
#
# Save (x % 3) in 59
0000 053b3c3d [005 059 060 061] .;<= | MOD   59   60   61
# Save (x % 5) in 55
0004 05373c3e [005 055 060 062] .7<> | MOD   55   60   62
# Jump to 24 if 59 == 0
0008 0f0b3b18 [015 011 059 024] ..;. | JZ    11   59 ( 24)
# Jump to 32 if 55 == 0
0012 0f0f3720 [015 015 055 032] ..7  | JZ    15   55 ( 32)
# Print x
0016 0c3c0000 [012 060 000 000] .<.. | PRN   60 (  0    0)
# Jump to 36
0020 0e170024 [014 023 000 036] ...$ | JMP   23 (  0   36)
# Print Fizz
0024 0d400400 [013 064 004 000] .@.. | PRS   64    4 (  0)
# Jump to 36 if 55 != 0
0028 101f3724 [016 031 055 036] ..7$ | JNZ   31   55 ( 36)
# Print Buzz
0032 0d440400 [013 068 004 000] .D.. | PRS   68    4 (  0)
# Print \n
0036 0d3f0100 [013 063 001 000] .?.. | PRS   63    1 (  0)
# x = x + 1
0040 013c3c3a [001 060 060 058] .<<: | ADD   60   60   58
# Save (100 - x) in 59
0044 023b393c [002 059 057 060] .;9< | SUB   59   57   60
# Jump to 0 if 59 < 0
0048 12333b00 [018 051 059 000] .3;. | JNS   51   59 (  0)
# End
0052 0b000000 [011 000 000 000] .... | END (  0    0    0)
# Data
0056 00640100 [000 100 001 000] .d.. | NOP (100    1    0)
0060 0103050a [001 003 005 010] .... | ADD    3    5   10
0064 46697a7a [070 105 122 122] Fizz |
0068 42757a7a [066 117 122 122] Buzz |
