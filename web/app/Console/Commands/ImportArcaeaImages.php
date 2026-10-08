<?php

namespace App\Console\Commands;

use App\Difficulty;
use App\Models\Chart;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

#[Signature('celestl:import-arcaea-images {--force : Rebuild files that already exist}')]
#[Description('Copy local Arcaea jacket/pack art onto the public disk and record the paths in the database')]
class ImportArcaeaImages extends Command
{
    /**
     * Longest edge of the generated thumbnails, in pixels.
     *
     * Jackets ship at 768x768 and 300-600KB each. A song grid shows dozens at once, so loading the
     * originals there costs ~20MB per screen. 384 is half the source, still sharp on a 2x phone
     * screen at the ~190px the cards actually use.
     */
    private const THUMB_SIZE = 384;

    /** JPEG quality for jacket thumbnails. 82 is visually lossless at this size. */
    private const JPEG_QUALITY = 82;

    public function handle(): int
    {
        $source = rtrim((string) config('celestl.arcaea_data_path'), '/');

        if (! File::isDirectory($source)) {
            $this->error("Data folder not found: {$source}");
            $this->line('Set ARCAEA_DATA_PATH, or see CLAUDE.md § Data dan hak cipta.');

            return self::FAILURE;
        }

        if (! extension_loaded('gd')) {
            $this->error('The GD extension is required to build thumbnails.');

            return self::FAILURE;
        }

        $disk = Storage::disk('public');

        foreach (['jackets', 'jackets/thumbs', 'packs', 'packs/thumbs'] as $folder) {
            $disk->makeDirectory($folder);
        }

        $songs = $this->importJackets($source, $disk->path(''));
        $overrides = $this->importChartJackets($source, $disk->path(''));
        $packs = $this->importPackArt($source, $disk->path(''));

        $this->newLine();
        $this->summarize('Jackets', $songs);
        $this->summarize('Per-difficulty jackets', $overrides);
        $this->summarize('Pack art', $packs);

        if (! File::exists(public_path('storage'))) {
            $this->newLine();
            $this->warn('public/storage is missing, so nothing will be served yet. Run: php artisan storage:link');
        }

        return self::SUCCESS;
    }

    /**
     * @return array{copied: int, skipped: int, missing: int, invalid: int}
     */
    private function importJackets(string $source, string $publicRoot): array
    {
        $stats = ['copied' => 0, 'skipped' => 0, 'missing' => 0, 'invalid' => 0];
        $songs = Song::query()->get(['id', 'slug', 'jacket_path', 'jacket_thumb_path']);
        $bar = $this->output->createProgressBar($songs->count());
        $bar->setFormat(' Jackets  %current%/%max% [%bar%] %message%');
        $bar->setMessage('');

        foreach ($songs as $song) {
            $bar->setMessage($song->slug);

            // Jacket files are named by the song's internal id, which is exactly our slug -- the
            // wiki's Module:SongData convention, not a fuzzy title match (CLAUDE.md § Jacket art).
            $file = "{$source}/jackets/{$song->slug}.jpg";

            if (! File::isFile($file)) {
                $stats['missing']++;
                $bar->advance();

                continue;
            }

            $path = "jackets/{$song->slug}.jpg";
            $thumb = "jackets/thumbs/{$song->slug}.jpg";

            $result = $this->publish($file, $publicRoot.$path, $publicRoot.$thumb, 'jpeg');
            $stats[$result]++;

            if ($result !== 'invalid') {
                // Always refresh the columns: the file can already be there from an earlier run
                // while the database was rebuilt from scratch.
                $song->update(['jacket_path' => $path, 'jacket_thumb_path' => $thumb]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return $stats;
    }

    /**
     * Jackets that belong to one difficulty rather than the whole song.
     *
     * The wiki names these `File:Songs <id> <pst|prs|ftr|byd|etr|ins>.jpg` (Module:SongData), so
     * they land here as `<slug>_<diff>.jpg`. Charts without such a file keep null and fall back to
     * the song's jacket at render time -- that is the overwhelming majority of them, so a missing
     * file is normal here and is not reported per chart the way a missing pack image is.
     *
     * Identical pictures are matched by content, not by filename. Several songs (Prism, To the
     * Furthest Dream and the rest of the Past+Present group) carry one override per difficulty as
     * separate wiki files that may hold the same picture; comparing bytes keeps those as a single
     * artwork, so the detail page offers a switch only when there is really something to switch to.
     *
     * @return array{copied: int, skipped: int, missing: int, invalid: int}
     */
    private function importChartJackets(string $source, string $publicRoot): array
    {
        $stats = ['copied' => 0, 'skipped' => 0, 'missing' => 0, 'invalid' => 0];

        $songs = Song::query()
            ->with('charts:id,song_id,difficulty,jacket_path,jacket_thumb_path')
            ->get(['id', 'slug']);

        foreach ($songs as $song) {
            // Keyed by file hash: the song's own jacket maps to null, meaning "no override needed".
            $byHash = [];
            $base = "{$source}/jackets/{$song->slug}.jpg";

            if (File::isFile($base)) {
                $byHash[md5_file($base)] = null;
            }

            // Lowest difficulty first, so when several share one picture the published file is
            // named after the lowest of them every run, rather than whatever order the rows load in.
            $charts = $song->charts->sortBy(
                fn (Chart $chart) => array_search($chart->difficulty, Difficulty::cases(), true)
            );

            foreach ($charts as $chart) {
                $difficulty = strtolower($chart->difficulty->value);
                $file = "{$source}/jackets/{$song->slug}_{$difficulty}.jpg";

                if (! File::isFile($file)) {
                    $stats['missing']++;

                    continue;
                }

                $hash = md5_file($file);

                if (array_key_exists($hash, $byHash)) {
                    $seen = $byHash[$hash];
                    $chart->update([
                        'jacket_path' => $seen['path'] ?? null,
                        'jacket_thumb_path' => $seen['thumb'] ?? null,
                    ]);
                    $stats['skipped']++;

                    continue;
                }

                $path = "jackets/{$song->slug}_{$difficulty}.jpg";
                $thumb = "jackets/thumbs/{$song->slug}_{$difficulty}.jpg";

                $result = $this->publish($file, $publicRoot.$path, $publicRoot.$thumb, 'jpeg');
                $stats[$result]++;

                if ($result === 'invalid') {
                    // Leave the chart pointing at nothing, so it falls back to the song's jacket
                    // instead of linking a file that was never written.
                    continue;
                }

                $byHash[$hash] = ['path' => $path, 'thumb' => $thumb];
                $chart->update(['jacket_path' => $path, 'jacket_thumb_path' => $thumb]);
            }
        }

        return $stats;
    }

    /**
     * @return array{copied: int, skipped: int, missing: int, invalid: int}
     */
    private function importPackArt(string $source, string $publicRoot): array
    {
        $stats = ['copied' => 0, 'skipped' => 0, 'missing' => 0, 'invalid' => 0];
        $packs = Pack::query()->with('parent:id,slug')->get();

        foreach ($packs as $pack) {
            $file = "{$source}/packs/{$pack->slug}.png";

            // A chapter/append pack shows its parent's banner in game, so it inherits the file when
            // it has none of its own (CLAUDE.md § Pack art).
            if (! File::isFile($file) && $pack->parent) {
                $file = "{$source}/packs/{$pack->parent->slug}.png";
            }

            if (! File::isFile($file)) {
                $stats['missing']++;
                $this->line("  no art for pack: {$pack->slug}");

                continue;
            }

            $path = "packs/{$pack->slug}.png";
            $thumb = "packs/thumbs/{$pack->slug}.png";

            // PNG, not JPEG: pack art is transparent, and the card's aspect ratio comes from the
            // non-transparent bounding box (CLAUDE.md § tinggi kartu Pack).
            $result = $this->publish($file, $publicRoot.$path, $publicRoot.$thumb, 'png');
            $stats[$result]++;

            if ($result === 'invalid') {
                continue;
            }

            [$trimWidth, $trimHeight] = $this->contentSize($file);

            $pack->update([
                'image_path' => $path,
                'image_thumb_path' => $thumb,
                'image_trim_width' => $trimWidth,
                'image_trim_height' => $trimHeight,
            ]);
        }

        return $stats;
    }

    /**
     * Size of the image's non-transparent content, which the pack card uses as its aspect ratio.
     *
     * Scans inward from each edge and stops at the first row/column that has any opaque pixel, so
     * the common case (artwork filling its canvas) costs a few rows rather than the whole bitmap.
     *
     * @return array{0: int|null, 1: int|null}
     */
    private function contentSize(string $file): array
    {
        $image = imagecreatefrompng($file);

        if ($image === false) {
            return [null, null];
        }

        $width = imagesx($image);
        $height = imagesy($image);

        $opaqueRow = function (int $y) use ($image, $width): bool {
            for ($x = 0; $x < $width; $x++) {
                // The alpha byte lives in bits 24-30; 127 is fully transparent in GD, not 255.
                if (((imagecolorat($image, $x, $y) >> 24) & 0x7F) < 127) {
                    return true;
                }
            }

            return false;
        };

        $opaqueColumn = function (int $x) use ($image, $height): bool {
            for ($y = 0; $y < $height; $y++) {
                if (((imagecolorat($image, $x, $y) >> 24) & 0x7F) < 127) {
                    return true;
                }
            }

            return false;
        };

        $top = 0;
        while ($top < $height && ! $opaqueRow($top)) {
            $top++;
        }

        if ($top === $height) {
            imagedestroy($image);

            // Fully transparent: nothing to measure, so the card keeps its default ratio.
            return [null, null];
        }

        $bottom = $height - 1;
        while ($bottom > $top && ! $opaqueRow($bottom)) {
            $bottom--;
        }

        $left = 0;
        while ($left < $width && ! $opaqueColumn($left)) {
            $left++;
        }

        $right = $width - 1;
        while ($right > $left && ! $opaqueColumn($right)) {
            $right--;
        }

        imagedestroy($image);

        return [$right - $left + 1, $bottom - $top + 1];
    }

    /**
     * @param  array{copied: int, skipped: int, missing: int, invalid: int}  $stats
     */
    private function summarize(string $label, array $stats): void
    {
        $this->info("{$label}: {$stats['copied']} copied, {$stats['skipped']} already present, {$stats['missing']} without a source file.");

        if ($stats['invalid'] > 0) {
            // Loud, because a broken source file is a download that needs redoing, not a song that
            // simply has no art on this install.
            $this->error("{$label}: {$stats['invalid']} source file(s) could not be read and were skipped. Re-download them, then run this again.");
        }
    }

    /**
     * Is this a file GD can actually decode?
     *
     * A truncated or empty download looks like a perfectly good .jpg to the filesystem, and
     * passing one to imagecreatefromjpeg() raises a warning that Laravel turns into an exception,
     * killing the whole import over one bad file. Checking first turns that into a skip.
     */
    private function isUsableImage(string $file): bool
    {
        return filesize($file) > 0 && @getimagesize($file) !== false;
    }

    /**
     * Copy one source image and build its thumbnail.
     *
     * Returns 'copied', 'skipped' when both outputs already existed, or 'invalid' when the source
     * cannot be decoded -- in which case nothing is written, so a broken download never reaches
     * the public disk or the database.
     */
    private function publish(string $source, string $target, string $thumb, string $format): string
    {
        if (! $this->isUsableImage($source)) {
            $this->newLine();
            $this->warn("  unreadable source, skipped: {$source}");

            return 'invalid';
        }

        $force = (bool) $this->option('force');
        $written = false;

        if ($force || ! File::isFile($target)) {
            File::copy($source, $target);
            $written = true;
        }

        if ($force || ! File::isFile($thumb)) {
            $this->thumbnail($source, $thumb, $format);
            $written = true;
        }

        return $written ? 'copied' : 'skipped';
    }

    private function thumbnail(string $source, string $target, string $format): void
    {
        // Callers check isUsableImage() first, so a failure here means GD knows the format but
        // cannot decode this particular file; fall back to shipping it unresized rather than dying.
        $image = $format === 'png' ? @imagecreatefrompng($source) : @imagecreatefromjpeg($source);

        if ($image === false) {
            $this->warn("  could not resize, copied at full size: {$source}");
            File::copy($source, $target);

            return;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, self::THUMB_SIZE / max($width, $height));

        $resized = imagecreatetruecolor((int) round($width * $scale), (int) round($height * $scale));

        if ($format === 'png') {
            // Without these two, GD composites onto opaque black and the transparent margin that
            // the pack-card aspect ratio depends on is lost.
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
        }

        imagecopyresampled(
            $resized, $image,
            0, 0, 0, 0,
            imagesx($resized), imagesy($resized), $width, $height,
        );

        if ($format === 'png') {
            imagepng($resized, $target, 6);
        } else {
            imagejpeg($resized, $target, self::JPEG_QUALITY);
        }

        imagedestroy($resized);
        imagedestroy($image);
    }
}
