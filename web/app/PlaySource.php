<?php

namespace App;

/**
 * Where a logged play came from.
 *
 * Kept as data rather than a boolean because a third source is already planned: the Best 50 image
 * import (Fase 3) is neither a manual entry nor a private-server scan.
 */
enum PlaySource: string
{
    case Manual = 'manual';
    case Scan = 'scan';
}
