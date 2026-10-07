<?php

namespace App\Services;

use App\Models\UnofficialChart;
use App\Models\UnofficialSong;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Pushes a custom ("Unofficial") song to the self-hosted private Arcaea server:
 *  - constants via its admin REST API (POST /songs, or PUT /songs/{id} if it already exists);
 *  - .aff files by copying them into the server's database/songs/<song_id>/<n>.aff (the server has
 *    no upload endpoint, so this only works while both run on the same machine);
 *  - then asks the server to refresh its song file cache so it notices the new files.
 *
 * See CLAUDE.md § Unofficial.
 */
class PrivateServerPusher
{
    /** Difficulty index the server uses (same as songlist.json ratingClass; no INS slot). */
    private const DIFFICULTY_INDEX = ['PST' => 0, 'PRS' => 1, 'FTR' => 2, 'BYD' => 3, 'ETR' => 4];

    /**
     * @return array{created: bool, charts: int, files: int}
     */
    public function push(UnofficialSong $song): array
    {
        $token = config('celestl.private_server.api_token');
        if (! $token) {
            throw new RuntimeException('ARCAEA_PRIVATE_SERVER_API_TOKEN belum diisi di web/.env (samakan dengan API_TOKEN di config.py server).');
        }

        $song->loadMissing('charts');
        $charts = $song->charts->filter(fn ($c) => $c->constant !== null || $c->aff_storage_path);

        if ($charts->isEmpty()) {
            throw new RuntimeException('Belum ada chart (constant atau file .aff) yang bisa di-push untuk lagu ini.');
        }

        $http = $this->http($token);

        $apiCharts = $charts
            ->filter(fn ($c) => $c->constant !== null)
            ->map(fn ($c) => [
                'difficulty' => self::DIFFICULTY_INDEX[$c->difficulty->value],
                'chart_const' => (float) $c->constant,
            ])
            ->values()
            ->all();

        $created = ! $this->songExists($http, $song->slug);

        if ($created) {
            $this->expectOk($this->send(fn () => $http->post('/api/v1/songs', [
                'song_id' => $song->slug,
                'name' => $song->title,
                'charts' => $apiCharts,
            ])), 'membuat lagu');
        } else {
            $this->expectOk($this->send(fn () => $http->put("/api/v1/songs/{$song->slug}", [
                'name' => $song->title,
                'charts' => $apiCharts,
            ])), 'memperbarui lagu');
        }

        $files = $this->copyAffFiles($song, $charts);

        $this->expectOk($this->send(
            // Body must be a JSON object even when empty: the server calls request.get_json() and
            // splats it into set_params(**...), so no body (415) or `[]` (not a mapping) both fail.
            fn () => $http->withBody('{}', 'application/json')
                ->post('/api/v1/system/operations/refresh_song_file_cache')
        ), 'refresh cache file lagu');

        $song->charts()->whereIn('id', $charts->pluck('id'))->update(['pushed_at' => now()]);

        return ['created' => $created, 'charts' => count($apiCharts), 'files' => $files];
    }

    private function http(string $token): PendingRequest
    {
        return Http::baseUrl(rtrim((string) config('celestl.private_server.url'), '/'))
            ->withHeaders(['Token' => $token])
            ->acceptJson()
            ->timeout(15);
    }

    private function songExists(PendingRequest $http, string $slug): bool
    {
        $json = $this->send(fn () => $http->get("/api/v1/songs/{$slug}"));

        return ($json['code'] ?? null) === 0;
    }

    /**
     * @param  callable(): Response  $request
     * @return array<string, mixed>
     */
    private function send(callable $request): array
    {
        try {
            $response = $request();
        } catch (ConnectionException $e) {
            throw new RuntimeException(
                'Tidak bisa menghubungi private server di '.config('celestl.private_server.url').' — pastikan servernya jalan.',
                previous: $e,
            );
        }

        if ($response->status() === 401 || $response->status() === 403) {
            throw new RuntimeException('Private server menolak token API (cek API_TOKEN di config.py server vs web/.env).');
        }

        return $response->json() ?? [];
    }

    /**
     * @param  array<string, mixed>  $json
     */
    private function expectOk(array $json, string $action): void
    {
        if (($json['code'] ?? null) !== 0) {
            $message = $json['msg'] ?? 'tanpa pesan';
            throw new RuntimeException("Private server gagal {$action}: {$message}");
        }
    }

    /**
     * @param  Collection<int, UnofficialChart>  $charts
     */
    private function copyAffFiles(UnofficialSong $song, $charts): int
    {
        $songsPath = rtrim((string) config('celestl.private_server.songs_path'), '/');

        if (! is_dir($songsPath)) {
            throw new RuntimeException("Folder songs private server tidak ditemukan: {$songsPath} (atur ARCAEA_PRIVATE_SERVER_SONGS_PATH).");
        }

        $dir = "{$songsPath}/{$song->slug}";
        if (! is_dir($dir) && ! mkdir($dir, 0775, true) && ! is_dir($dir)) {
            throw new RuntimeException("Gagal membuat folder {$dir}.");
        }

        $copied = 0;
        foreach ($charts as $chart) {
            if (! $chart->aff_storage_path || ! Storage::disk('local')->exists($chart->aff_storage_path)) {
                continue;
            }

            $target = $dir.'/'.self::DIFFICULTY_INDEX[$chart->difficulty->value].'.aff';
            file_put_contents($target, Storage::disk('local')->get($chart->aff_storage_path));
            $copied++;
        }

        return $copied;
    }
}
