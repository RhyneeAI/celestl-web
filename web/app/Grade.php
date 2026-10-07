<?php

namespace App;

/**
 * Grade is derived from score alone and never stored — see CLAUDE.md § Grade dan lamp.
 * A perfect score is still EX+; "PM" is a lamp, not a grade.
 */
enum Grade: string
{
    case D = 'D';
    case C = 'C';
    case B = 'B';
    case A = 'A';
    case AA = 'AA';
    case EX = 'EX';
    case EXPlus = 'EX+';
}
