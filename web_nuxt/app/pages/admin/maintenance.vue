<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black font-brand tracking-tight text-[#fffafa] flex items-center gap-3">
          <span>Server Maintenance & Sync</span>
          <span
            :class="[
              'text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border flex items-center gap-1.5',
              status?.daemon?.isRunning
                ? 'bg-[#acff82]/15 text-[#acff82] border-[#acff82]/30'
                : 'bg-[#e14763]/15 text-[#e14763] border-[#e14763]/30'
            ]"
          >
            <span class="inline-block size-1.5 rounded-full" :class="status?.daemon?.isRunning ? 'bg-[#acff82] animate-pulse' : 'bg-[#e14763]'" />
            <span>{{ status?.daemon?.isRunning ? 'DAEMON RUNNING' : 'DAEMON STOPPED' }}</span>
          </span>
        </h1>
        <p class="text-xs sm:text-[13px] text-[#9a99a8] mt-1">
          Arcaea daemon controller, database synchronization, B50 ratings recalculation, and integrity auditing.
        </p>
      </div>

      <button
        type="button"
        @click="() => refresh()"
        :disabled="pending"
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#fffafa] border border-white/5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
      >
        <svg class="h-3.5 w-3.5" :class="{ 'animate-spin': pending }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh Status</span>
      </button>
    </div>

    <!-- Status Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Daemon Controller Card -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Arcaea Daemon</span>
            <span class="text-xs font-mono font-bold text-[#9a99a8]">Port 8765</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span
              class="size-3 rounded-full"
              :class="status?.daemon?.isRunning ? 'bg-[#acff82] shadow-[0_0_10px_#acff82]' : 'bg-[#e14763] shadow-[0_0_10px_#e14763]'"
            />
            <span class="text-lg font-black font-brand text-white">
              {{ status?.daemon?.isRunning ? 'Active & Serving' : 'Offline' }}
            </span>
          </div>
          <p class="text-xs text-[#9a99a8] mt-1 font-mono">
            {{ status?.daemon?.isRunning ? `PID: ${status.daemon.pid}` : 'Daemon process inactive' }}
          </p>
        </div>

        <!-- Service Control Buttons -->
        <div class="flex items-center gap-2 pt-2 border-t border-[#16133e]">
          <button
            v-if="!status?.daemon?.isRunning"
            type="button"
            :disabled="actionLoading"
            @click="runServiceAction('start')"
            class="flex-1 py-1.5 px-3 rounded-xl bg-[#acff82] hover:bg-[#acff82]/90 text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            ▶ Start Daemon
          </button>
          <button
            v-if="status?.daemon?.isRunning"
            type="button"
            :disabled="actionLoading"
            @click="runServiceAction('restart')"
            class="flex-1 py-1.5 px-3 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            🔄 Restart
          </button>
          <button
            v-if="status?.daemon?.isRunning"
            type="button"
            :disabled="actionLoading"
            @click="runServiceAction('stop')"
            class="flex-1 py-1.5 px-3 rounded-xl bg-[#e14763]/20 hover:bg-[#e14763]/30 text-xs font-bold text-[#e14763] border border-[#e14763]/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            ⏹ Stop
          </button>
        </div>
      </div>

      <!-- 2. SQLite Database Card -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">SQLite Database</span>
            <span class="text-xs font-mono font-bold text-[#60a5fa]">{{ status?.database?.sizeFormatted }}</span>
          </div>
          <div class="mt-2 text-lg font-black font-brand text-white truncate" title="arcaea_database.db">
            arcaea_database.db
          </div>
          <p class="text-xs text-[#9a99a8] mt-1 font-mono truncate" :title="status?.database?.path">
            Modified: {{ status?.database?.lastModified }}
          </p>
        </div>

        <div class="pt-2 border-t border-[#16133e] flex items-center justify-between">
          <span class="text-[11px] text-[#acff82] font-semibold">✓ Local DB Active</span>
          <span class="text-[11px] text-[#6f6e80] font-mono">WAL Mode</span>
        </div>
      </div>

      <!-- 3. Songs & Charts Card -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Song Catalog</span>
            <span class="text-xs font-mono font-bold text-[#ffd76a]">{{ status?.songlist?.totalSongs }} Songs</span>
          </div>
          <div class="mt-2 text-lg font-black font-brand text-white">
            {{ status?.songlist?.totalCharts }} Total Charts
          </div>
          <p class="text-xs text-[#9a99a8] mt-1 font-mono truncate" :title="status?.songlist?.path">
            Modified: {{ status?.songlist?.lastModified }}
          </p>
        </div>

        <div class="pt-2 border-t border-[#16133e] flex items-center justify-between">
          <NuxtLink to="/admin/unofficial" class="text-xs text-[#f768dd] font-bold hover:underline flex items-center gap-1">
            <span>Manage Charts</span>
            <span>→</span>
          </NuxtLink>
          <span class="text-[11px] text-[#9a99a8] font-mono">remote_dl: true</span>
        </div>
      </div>

      <!-- 4. VPS Cloud Sync Card -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">VPS Cloud Sync</span>
            <span
              :class="[
                'text-[10px] px-2 py-0.5 rounded-full font-mono font-bold',
                status?.vps?.hasSshKey
                  ? 'bg-[#acff82]/20 text-[#acff82] border border-[#acff82]/40'
                  : 'bg-[#e14763]/20 text-[#e14763] border border-[#e14763]/40'
              ]"
            >
              {{ status?.vps?.hasSshKey ? 'SSH READY' : 'NO KEY' }}
            </span>
          </div>
          <div class="mt-2 text-lg font-black font-brand text-white font-mono">
            {{ status?.vps?.host }}
          </div>
          <p class="text-xs text-[#9a99a8] mt-1 font-mono">
            Container: celest-arcaea-server
          </p>
        </div>

        <div class="pt-2 border-t border-[#16133e] flex items-center justify-between">
          <span class="text-[11px] text-[#9a99a8] font-mono">User: {{ status?.vps?.user }}</span>
          <span class="text-[11px] text-[#60a5fa] font-mono">Port 8765</span>
        </div>
      </div>
    </div>

    <!-- Quick Operations Panels -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Operation 1: Sync DB -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="size-10 rounded-2xl bg-[#f768dd]/15 border border-[#f768dd]/30 flex items-center justify-center text-lg">
            🔄
          </div>
          <h3 class="text-base font-bold font-brand text-white">
            Sync Songlist to Database
          </h3>
          <p class="text-xs text-[#9a99a8] leading-relaxed">
            Synchronizes chart constants (PST, PRS, FTR, BYD, ETR) and fragment/memories prices from <code class="text-white">songlist</code> into SQLite database table <code class="text-white">chart</code>.
          </p>
        </div>

        <button
          type="button"
          :disabled="actionLoading"
          @click="runSyncDatabase"
          class="w-full py-2.5 px-4 rounded-xl bg-[#f768dd] hover:bg-[#d946ef] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{{ runningTask === 'sync' ? 'Synchronizing…' : 'Execute Sync Database' }}</span>
        </button>
      </div>

      <!-- Operation 2: Recalculate Ratings -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="size-10 rounded-2xl bg-[#ffd76a]/15 border border-[#ffd76a]/30 flex items-center justify-center text-lg">
            ⚡
          </div>
          <h3 class="text-base font-bold font-brand text-white">
            Recalculate Modern B50 Ratings
          </h3>
          <p class="text-xs text-[#9a99a8] leading-relaxed">
            Recomputes Potential (PTT) for every score and registered user across local server and remote VPS container using the active Modern Best 50 formula.
          </p>
        </div>

        <button
          type="button"
          :disabled="actionLoading"
          @click="runRecalculateRatings"
          class="w-full py-2.5 px-4 rounded-xl bg-[#ffd76a] hover:bg-[#facc15] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{{ runningTask === 'recalculate' ? 'Recalculating…' : 'Execute Recalculate B50' }}</span>
        </button>
      </div>

      <!-- Operation 3: Integrity Audit -->
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="size-10 rounded-2xl bg-[#acff82]/15 border border-[#acff82]/30 flex items-center justify-center text-lg">
            🛡️
          </div>
          <h3 class="text-base font-bold font-brand text-white">
            Run Chart Integrity Audit
          </h3>
          <p class="text-xs text-[#9a99a8] leading-relaxed">
            Executes the 8-suite automated verifier (<code class="text-white">celest-audit --check</code>) checking base difficulties, vorbis audio, background resolution, and syntax safety.
          </p>
        </div>

        <button
          type="button"
          :disabled="actionLoading"
          @click="runIntegrityAudit"
          class="w-full py-2.5 px-4 rounded-xl bg-[#acff82] hover:bg-[#86efac] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{{ runningTask === 'audit' ? 'Auditing Charts…' : 'Run Audit (--check)' }}</span>
        </button>
      </div>
    </div>

    <!-- Output Terminal Drawer -->
    <div v-if="terminalOutput" class="rounded-3xl bg-[#080816] p-5 border border-[#16133e] shadow-2xl space-y-3">
      <div class="flex items-center justify-between border-b border-[#16133e] pb-3">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-[#acff82]" />
          <span class="text-xs font-bold font-mono text-white">{{ terminalTitle }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="copyOutput"
            class="text-xs text-[#9a99a8] hover:text-white px-2 py-1 rounded bg-[#1e203a] font-mono cursor-pointer"
          >
            📋 Copy Output
          </button>
          <button
            type="button"
            @click="terminalOutput = ''"
            class="text-xs text-[#9a99a8] hover:text-white px-2 py-1 rounded bg-[#1e203a] font-mono cursor-pointer"
          >
            ✕ Close
          </button>
        </div>
      </div>

      <pre class="max-h-96 overflow-y-auto text-xs font-mono text-[#acff82] leading-relaxed whitespace-pre-wrap p-2">{{ terminalOutput }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Admin · Server Maintenance',
});

const { data: status, pending, refresh } = await useFetch<any>('/api/admin/server/maintenance/status');

const actionLoading = ref(false);
const runningTask = ref<string | null>(null);
const terminalTitle = ref('Execution Log');
const terminalOutput = ref('');

async function runServiceAction(action: 'start' | 'stop' | 'restart') {
  if (!confirm(`Are you sure you want to ${action} the Celest Arcaea server daemon?`)) return;
  actionLoading.value = true;
  try {
    const res = await $fetch<any>('/api/admin/server/maintenance/service', {
      method: 'POST',
      body: { action },
    });
    terminalTitle.value = `Service Action: ${action.toUpperCase()}`;
    terminalOutput.value = res.output || res.message;
    await refresh();
  } catch (err: any) {
    alert(err?.data?.statusMessage || `Failed to ${action} service`);
  } finally {
    actionLoading.value = false;
  }
}

async function runSyncDatabase() {
  actionLoading.value = true;
  runningTask.value = 'sync';
  try {
    const res = await $fetch<any>('/api/admin/server/maintenance/sync-db', {
      method: 'POST',
    });
    terminalTitle.value = 'Sync Songlist to Database';
    terminalOutput.value = res.output;
    alert(res.message);
    await refresh();
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to sync database');
  } finally {
    actionLoading.value = false;
    runningTask.value = null;
  }
}

async function runRecalculateRatings() {
  actionLoading.value = true;
  runningTask.value = 'recalculate';
  try {
    const res = await $fetch<any>('/api/admin/server/maintenance/recalculate', {
      method: 'POST',
    });
    terminalTitle.value = 'Recalculate Modern B50 Potential Ratings';
    terminalOutput.value = `[Local Output]:\n${res.localOutput}\n\n[VPS Sync]:\n${res.vpsOutput || (res.vpsSynced ? 'Synchronized to VPS' : 'Local only')}`;
    alert(res.message);
    await refresh();
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to recalculate ratings');
  } finally {
    actionLoading.value = false;
    runningTask.value = null;
  }
}

async function runIntegrityAudit() {
  actionLoading.value = true;
  runningTask.value = 'audit';
  try {
    const res = await $fetch<any>('/api/admin/server/maintenance/audit', {
      method: 'POST',
    });
    terminalTitle.value = 'Chart & Asset Integrity Audit (celest-audit --check)';
    terminalOutput.value = res.output;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to run audit');
  } finally {
    actionLoading.value = false;
    runningTask.value = null;
  }
}

function copyOutput() {
  if (!terminalOutput.value) return;
  navigator.clipboard.writeText(terminalOutput.value);
  alert('Terminal log copied to clipboard!');
}
</script>

