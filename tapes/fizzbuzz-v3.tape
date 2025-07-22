# TAPE: FizzBuzz (Version 3)
#
# In this version, we move all of the data to the beginning of
# the program, jumping over it into the main instructions. This
# program's signature is a very small main loop, which jumps
# into a 15-entry jump table pointing at one of 4 "subroutines"
# (Fizz, Buzz, FizzBuzz, or Number).
#
# These "subroutines" are actually designed in a way where they
# COULD be called as "gosubs", where the caller places the
# desired return point before calling. (In this version, we don't
# use it, there's only one call point so we can hard-code the
# return point 108 into each subroutine.)
#
# NOP = 0
# ADD = 1 SUB = 2 MUL = 3 DIV = 4 MOD = 5
# AND = 6 OR = 7 NOT = 8 XOR = 9 NOR = 10
# END = 11
# PRN = 12 PRS = 13
# JMP = 14 JZ = 15 JNZ = 16 JS = 17 JNS = 18
#
0000 0e030064 [014 003 000 100] ...d | JMP      3 (  0  100)
0004 46697a7a [070 105 122 122] Fizz | ANDW   105  122  122
0008 42757a7a [066 117 122 122] Buzz | SUBW   117  122  122
0012 0a01140f [010 001 020 015] .... | NOR      1   20   15
0016 01006400 [001 000 100 000] ..d. | ADD      0  100    0
0020 54542854 [084 084 040 084] TT(T |
0024 38285454 [056 040 084 084] 8(TT |
0028 28385428 [040 056 084 040] (8T( |
0032 54544800 [084 084 072 000] TTH. |
0036 0000006c [000 000 000 108] ...l | NOP   (  0    0  108)
0040 0d040400 [013 004 004 000] .... | PRS      4    4 (  0)
0044 0d0c0100 [013 012 001 000] .... | PRS     12    1 (  0)
0048 0e270000 [014 039 000 000] .'.. | JMP     39 (  0    0)
0052 0000006c [000 000 000 108] ...l | NOP   (  0    0  108)
0056 0d080400 [013 008 004 000] .... | PRS      8    4 (  0)
0060 0d0c0100 [013 012 001 000] .... | PRS     12    1 (  0)
0064 0e370000 [014 055 000 000] .7.. | JMP     55 (  0    0)
0068 0000006c [000 000 000 108] ...l | NOP   (  0    0  108)
0072 0d040900 [013 004 009 000] .... | PRS      4    9 (  0)
0076 0e470000 [014 071 000 000] .G.. | JMP     71 (  0    0)
0080 0000006c [000 000 000 108] ...l | NOP   (  0    0  108)
0084 0c100000 [012 016 000 000] .... | PRN     16 (  0    0)
0088 0d0c0100 [013 012 001 000] .... | PRS     12    1 (  0)
0092 0e530000 [014 083 000 000] .S.. | JMP     83 (  0    0)
0096 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0100 0169110e [001 105 017 014] .i.. | ADD    105   17   14
0104 0e000000 [014 000 000 000] .... | JMP      0 (  0    0)
0108 0111110d [001 017 017 013] .... | ADD     17   17   13
0112 0511110f [005 017 017 015] .... | MOD     17   17   15
0116 0110100d [001 016 016 013] .... | ADD     16   16   13
0120 02131210 [002 019 018 016] .... | SUB     19   18   16
0124 127f1360 [018 127 019 096] ...` | JNS    127   19 ( 96)
0128 0b000000 [011 000 000 000] .... | END   (  0    0    0)
0132 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0136 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0140 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0144 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0148 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0152 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0156 00000000 [000 000 000 000] .... | NOP   (  0    0    0)
0160 0b757a7a [011 117 122 122] .uzz | END   (117  122  122)
