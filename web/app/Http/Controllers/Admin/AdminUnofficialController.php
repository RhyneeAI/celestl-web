<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UnofficialChart;
use App\Models\UnofficialSong;
use App\Services\PrivateServerPusher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AdminUnofficialController extends Controller
{
    /**
     * List every custom song + its 5 difficulty slots (PST/PRS/FTR/BYD/ETR -- INS isn't modeled
     * here yet since the base private server's own chart table has no slot for it, see
     * database/migrations/*_create_unofficial_charts_table.php).
     */
    public function index(): Response
    {
        $songs = UnofficialSong::query()
            ->with('charts')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (UnofficialSong $song) => [
                'id' => $song->id,
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
                'charts' => $song->charts->map(fn (UnofficialChart $chart) => [
                    'id' => $chart->id,
                    'difficulty' => $chart->difficulty->value,
                    'constant' => $chart->constant,
                    'aff_original_filename' => $chart->aff_original_filename,
                    'pushed_at' => $chart->pushed_at?->toIso8601String(),
                ]),
            ]);

        return Inertia::render('admin/unofficial', [
            'songs' => $songs,
        ]);
    }

    /**
     * Create a new custom song shell (no charts yet -- those are uploaded one at a time per
     * difficulty via storeChart()).
     */
    public function storeSong(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('unofficial_songs', 'slug')],
            'title' => ['required', 'string', 'max:255'],
            'artist' => ['nullable', 'string', 'max:255'],
        ]);

        UnofficialSong::create($data);

        return redirect()->route('admin.unofficial');
    }

    public function destroySong(UnofficialSong $unofficialSong): RedirectResponse
    {
        // Charts' .aff files on Celestl's own disk go with it -- the private server's own copy
        // (if it was ever pushed there) is untouched, that's a separate manual/future step.
        foreach ($unofficialSong->charts as $chart) {
            if ($chart->aff_storage_path) {
                Storage::disk('local')->delete($chart->aff_storage_path);
            }
        }

        $unofficialSong->delete();

        return redirect()->route('admin.unofficial');
    }

    /**
     * Upload (or replace) one difficulty's .aff file + constant for a custom song. Stored on
     * Celestl's own private disk for now -- pushing it onto the private server's filesystem/API
     * is the next step (CLAUDE.md § Unofficial), not done here yet.
     */
    public function storeChart(Request $request, UnofficialSong $unofficialSong): RedirectResponse
    {
        $data = $request->validate([
            'difficulty' => ['required', Rule::in(['PST', 'PRS', 'FTR', 'BYD', 'ETR'])],
            // Tanpa batas atas (chart custom boleh lebih tinggi dari 12). Max 1 desimal: private server
            // menyimpan constant sebagai integer `constant * 10` (core/song.py), jadi digit ke-2 akan
            // hilang saat di-push — lebih baik ditolak di sini. Min 0: constant <= 0 dianggap unrank.
            'constant' => ['nullable', 'numeric', 'min:0', 'decimal:0,1'],
            'aff' => ['nullable', 'file', 'max:2048', 'extensions:aff'],
        ]);

        $attributes = [
            'constant' => $data['constant'] ?? null,
        ];

        if ($request->hasFile('aff')) {
            $file = $request->file('aff');
            $path = $file->storeAs(
                "unofficial-charts/{$unofficialSong->slug}",
                "{$data['difficulty']}.aff",
                'local',
            );

            $attributes['aff_original_filename'] = $file->getClientOriginalName();
            $attributes['aff_storage_path'] = $path;
        }

        UnofficialChart::updateOrCreate(
            ['unofficial_song_id' => $unofficialSong->id, 'difficulty' => $data['difficulty']],
            $attributes,
        );

        return redirect()->route('admin.unofficial');
    }

    /**
     * Push this song's constants + .aff files to the private server (see PrivateServerPusher).
     */
    public function pushSong(UnofficialSong $unofficialSong, PrivateServerPusher $pusher): RedirectResponse
    {
        try {
            $pusher->push($unofficialSong);
        } catch (RuntimeException $e) {
            return back()->withErrors(['push' => $e->getMessage()]);
        }

        return redirect()->route('admin.unofficial');
    }
}
