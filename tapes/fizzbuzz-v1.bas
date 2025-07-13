' QB64: FizzBuzz (Version 1)
'
' Prints the numbers from 1-100.
'  - Multiples of "3" print "Fizz" instead.
'  - Multiples of "5" print "Buzz" instead.
'  - Multiple of both print "FizzBuzz" instead.
'
' This simple, no-frills FizzBuzz program avoids loops
' or any other higher-level flow control structures, to
' make it a 1-1 comparison with our TAPE version in fizzbuzz-v1.tape.
'
100 N = 1
110 IF N MOD 3 = 0 GOTO 150
120 IF N MOD 5 = 0 GOTO 170
130 PRINT STR$(N);
140 GOTO 180
150 PRINT "Fizz";
160 IF N MOD 5 > 0 GOTO 180
170 PRINT "Buzz";
180 PRINT
190 N = N + 1
200 IF N <= 100 GOTO 110
