<template>
  <div class="rounded-2xl bg-[#1a1d32] border border-[#16133e] shadow-xl p-4 sm:p-5 space-y-4">
    <!-- Header: Title, Metric Summary & Time Filter Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Title & Current Potential Metric -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-[#f768dd] shadow-[0_0_8px_#f768dd]"></span>
          <span class="text-[10px] font-brand font-black uppercase tracking-widest text-[#9a99a8]">
            Potential Growth · {{ playerName }}
          </span>
        </div>
        <div class="flex items-baseline gap-3">
          <span class="font-mono font-black text-2xl sm:text-3xl tracking-tight text-[#fffafa]">
            {{ currentDisplayPtt.toFixed(3) }}
            <span class="text-xs font-brand font-bold text-[#f768dd] tracking-wider ml-0.5">PTT</span>
          </span>

          <!-- Delta Change Badge in Period -->
          <span
            :class="[
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-black border transition-all',
              deltaChange > 0
                ? 'bg-[#acff82]/15 text-[#acff82] border-[#acff82]/30 shadow-[0_0_12px_rgba(172,255,130,0.2)]'
                : deltaChange < 0
                  ? 'bg-[#e14763]/15 text-[#e14763] border-[#e14763]/30 shadow-[0_0_12px_rgba(225,71,99,0.2)]'
                  : 'bg-[#3f3c68]/30 text-[#9a99a8] border-[#3f3c68]/50'
            ]"
            :title="`Net change over ${activeFilterLabel}: ${deltaChange >= 0 ? '+' : ''}${deltaChange.toFixed(3)} PTT`"
          >
            <span>{{ deltaChange > 0 ? '▲' : deltaChange < 0 ? '▼' : '—' }}</span>
            <span>{{ deltaChange > 0 ? '+' : '' }}{{ deltaChange.toFixed(3) }}</span>
          </span>
        </div>
      </div>

      <!-- Time Filter Tab Buttons (1D, 3D, 1W, 1M, 3M, 1Y) -->
      <div class="flex items-center gap-1 bg-[#0c0c22] p-1 rounded-xl border border-[#3f3c68]/40 self-start sm:self-auto overflow-x-auto max-w-full">
        <button
          v-for="f in timeFilters"
          :key="f.key"
          type="button"
          @click="activeFilter = f.key"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-brand font-bold transition-all shrink-0 cursor-pointer',
            activeFilter === f.key
              ? 'bg-[#f768dd] text-[#0c0c22] shadow-md shadow-[#f768dd]/20'
              : 'text-[#9a99a8] hover:text-[#fffafa] hover:bg-[#16133e]'
          ]"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Range Statistics Banner: Min, Max, Records Count -->
    <div class="flex items-center justify-between text-[11px] font-mono text-[#9a99a8] bg-[#0c0c22]/60 px-3 py-1.5 rounded-xl border border-[#16133e]">
      <div class="flex items-center gap-3">
        <span>Period Min: <b class="text-[#fffafa]">{{ minRangePtt.toFixed(3) }}</b></span>
        <span class="text-[#3f3c68]">·</span>
        <span>Period Max: <b class="text-[#ffd76a]">{{ maxRangePtt.toFixed(3) }}</b></span>
      </div>
      <div>
        <span class="text-[#9a99a8]">{{ plotPoints.length }} point(s) recorded</span>
      </div>
    </div>

    <!-- SVG Graph Container -->
    <div class="relative w-full overflow-hidden select-none" ref="chartContainer">
      <svg
        viewBox="0 0 600 170"
        class="w-full h-auto overflow-visible cursor-crosshair"
        @mousemove="handleMouseMove"
        @mouseleave="hoveredPoint = null"
      >
        <defs>
          <!-- Line Stroke Gradient (Cyan -> Magenta -> Gold) -->
          <linearGradient id="pttStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#03a8e6" />
            <stop offset="50%" stop-color="#f768dd" />
            <stop offset="100%" stop-color="#ffd76a" />
          </linearGradient>

          <!-- Area Fill Gradient (Magenta fade to dark) -->
          <linearGradient id="pttAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f768dd" stop-opacity="0.28" />
            <stop offset="60%" stop-color="#9b51e0" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#0c0c22" stop-opacity="0.0" />
          </linearGradient>

          <!-- Glow Filter for the Line -->
          <filter id="pttGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Horizontal Background Grid Lines & Y-Axis Labels -->
        <g class="text-[9px] font-mono fill-[#6f6e80]">
          <!-- Max Grid Line -->
          <line
            :x1="padLeft"
            :y1="padTop"
            :x2="600 - padRight"
            :y2="padTop"
            stroke="#3f3c68"
            stroke-opacity="0.35"
            stroke-dasharray="3,3"
          />
          <text :x="padLeft - 6" :y="padTop + 3" text-anchor="end">
            {{ yMax.toFixed(2) }}
          </text>

          <!-- Mid Grid Line -->
          <line
            :x1="padLeft"
            :y1="padTop + plotH / 2"
            :x2="600 - padRight"
            :y2="padTop + plotH / 2"
            stroke="#3f3c68"
            stroke-opacity="0.25"
            stroke-dasharray="3,3"
          />
          <text :x="padLeft - 6" :y="padTop + plotH / 2 + 3" text-anchor="end">
            {{ ((yMax + yMin) / 2).toFixed(2) }}
          </text>

          <!-- Min Grid Line -->
          <line
            :x1="padLeft"
            :y1="padTop + plotH"
            :x2="600 - padRight"
            :y2="padTop + plotH"
            stroke="#3f3c68"
            stroke-opacity="0.35"
            stroke-dasharray="3,3"
          />
          <text :x="padLeft - 6" :y="padTop + plotH + 3" text-anchor="end">
            {{ yMin.toFixed(2) }}
          </text>
        </g>

        <!-- Area Fill Under Path -->
        <path
          v-if="areaPathD"
          :d="areaPathD"
          fill="url(#pttAreaGrad)"
        />

        <!-- Smooth Curved Line Stroke -->
        <path
          v-if="strokePathD"
          :d="strokePathD"
          fill="none"
          stroke="url(#pttStrokeGrad)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#pttGlow)"
        />

        <!-- Data Point Circles (Skip anchor synthetic points if desired, or keep subtle) -->
        <g v-for="(p, idx) in plotPoints" :key="idx">
          <circle
            :cx="p.x"
            :cy="p.y"
            r="3"
            class="fill-[#fffafa] stroke-[#0c0c22] stroke-[1.5]"
          />
        </g>

        <!-- Pulsing Indicator on the Latest Active Point -->
        <g v-if="latestPlotPoint">
          <circle
            :cx="latestPlotPoint.x"
            :cy="latestPlotPoint.y"
            r="6"
            fill="#f768dd"
            opacity="0.4"
            class="animate-ping"
          />
          <circle
            :cx="latestPlotPoint.x"
            :cy="latestPlotPoint.y"
            r="4.5"
            fill="#ffd76a"
            stroke="#fffafa"
            stroke-width="1.5"
          />
        </g>

        <!-- Interactive Hover Crosshair & Dot -->
        <g v-if="hoveredPoint">
          <!-- Vertical Dotted Guide Line -->
          <line
            :x1="hoveredPoint.x"
            :y1="padTop"
            :x2="hoveredPoint.x"
            :y2="padTop + plotH"
            stroke="#f768dd"
            stroke-width="1"
            stroke-dasharray="2,2"
          />

          <!-- Highlight Circle on Hovered Point -->
          <circle
            :cx="hoveredPoint.x"
            :cy="hoveredPoint.y"
            r="7"
            fill="#f768dd"
            fill-opacity="0.3"
          />
          <circle
            :cx="hoveredPoint.x"
            :cy="hoveredPoint.y"
            r="4.5"
            fill="#fffafa"
            stroke="#f768dd"
            stroke-width="2"
          />
        </g>

        <!-- X-Axis Date Range Labels at Bottom -->
        <g class="text-[9px] font-mono fill-[#6f6e80]">
          <text :x="padLeft" :y="166" text-anchor="start">
            {{ formatXLabel(windowStartTime) }}
          </text>
          <text :x="padLeft + plotW / 2" :y="166" text-anchor="middle">
            {{ formatXLabel(windowStartTime + (windowEndTime - windowStartTime) / 2) }}
          </text>
          <text :x="600 - padRight" :y="166" text-anchor="end">
            {{ formatXLabel(windowEndTime) }}
          </text>
        </g>
      </svg>

      <!-- Floating Hover Tooltip -->
      <div
        v-if="hoveredPoint"
        class="pointer-events-none absolute z-20 rounded-xl bg-[#0c0c22]/95 backdrop-blur-md px-3 py-2 text-xs font-sans text-white border border-[#f768dd]/50 shadow-2xl transition-transform"
        :style="{
          left: `${tooltipLeft}%`,
          top: `${tooltipTop}%`,
          transform: tooltipTransform,
        }"
      >
        <div class="flex items-center gap-1.5 text-[10px] font-mono text-[#9a99a8]">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#f768dd]"></span>
          <span>{{ formatTooltipDate(hoveredPoint.time) }}</span>
        </div>
        <div class="mt-0.5 flex items-baseline gap-2">
          <span class="font-mono font-black text-base text-[#ffd76a]">
            {{ hoveredPoint.ratingPtt.toFixed(3) }}
          </span>
          <span class="font-brand text-[10px] uppercase font-bold text-[#f768dd]">PTT</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface PotentialPoint {
  time: number;
  ratingPtt: number;
}

const props = withDefaults(defineProps<{
  potentialHistory?: PotentialPoint[];
  currentPtt?: number;
  playerName?: string;
}>(), {
  potentialHistory: () => [],
  currentPtt: 0,
  playerName: 'Player',
});

export type TimeFilterKey = '1d' | '3d' | '1w' | '1m' | '3m' | '1y';

interface TimeFilterOption {
  key: TimeFilterKey;
  label: string;
  durationSeconds: number;
}

const timeFilters: TimeFilterOption[] = [
  { key: '1d', label: '1 Hari', durationSeconds: 86400 },
  { key: '3d', label: '3 Hari', durationSeconds: 3 * 86400 },
  { key: '1w', label: '1 Minggu', durationSeconds: 7 * 86400 },
  { key: '1m', label: '1 Bulan', durationSeconds: 30 * 86400 },
  { key: '3m', label: '3 Bulan', durationSeconds: 90 * 86400 },
  { key: '1y', label: '1 Tahun', durationSeconds: 365 * 86400 },
];

const activeFilter = ref<TimeFilterKey>('1m');

const activeFilterOption = computed(() => {
  return timeFilters.find(f => f.key === activeFilter.value) || timeFilters[3]!;
});

const activeFilterLabel = computed(() => activeFilterOption.value.label);

// Anchor time: latest timestamp in data or current time
const effectiveNow = computed(() => {
  const maxInHistory = props.potentialHistory.length > 0
    ? Math.max(...props.potentialHistory.map(p => p.time))
    : 0;
  const currentTs = Math.floor(Date.now() / 1000);
  return Math.max(currentTs, maxInHistory);
});

const windowEndTime = computed(() => effectiveNow.value);
const windowStartTime = computed(() => windowEndTime.value - activeFilterOption.value.durationSeconds);

// Process points for the active time window
interface ProcessedPoint {
  time: number;
  ratingPtt: number;
  isAnchor?: boolean;
}

const windowPoints = computed<ProcessedPoint[]>(() => {
  const all = [...props.potentialHistory].sort((a, b) => a.time - b.time);
  const start = windowStartTime.value;
  const end = windowEndTime.value;

  // Points strictly inside window
  const inside = all.filter(p => p.time >= start && p.time <= end);

  // Points before start (for continuous baseline)
  const before = all.filter(p => p.time < start);
  const prevPoint = before.length > 0 ? before[before.length - 1] : null;

  const res: ProcessedPoint[] = [];

  // 1. Initial point at start of window
  if (prevPoint) {
    res.push({ time: start, ratingPtt: prevPoint.ratingPtt, isAnchor: true });
  } else if (inside.length > 0 && inside[0]!.time > start) {
    res.push({ time: start, ratingPtt: inside[0]!.ratingPtt, isAnchor: true });
  }

  // 2. Interior points
  for (const pt of inside) {
    res.push({ time: pt.time, ratingPtt: pt.ratingPtt });
  }

  // 3. Ending point at windowEndTime
  const latestPtt = inside.length > 0
    ? inside[inside.length - 1]!.ratingPtt
    : (prevPoint ? prevPoint.ratingPtt : props.currentPtt);

  if (res.length === 0) {
    res.push({ time: start, ratingPtt: latestPtt, isAnchor: true });
    res.push({ time: end, ratingPtt: latestPtt, isAnchor: true });
  } else if (res[res.length - 1]!.time < end) {
    res.push({ time: end, ratingPtt: latestPtt, isAnchor: true });
  }

  return res;
});

// Current PTT display & delta
const currentDisplayPtt = computed(() => {
  if (props.currentPtt > 0) return props.currentPtt;
  if (windowPoints.value.length > 0) {
    return windowPoints.value[windowPoints.value.length - 1]!.ratingPtt;
  }
  return 0;
});

const deltaChange = computed(() => {
  const pts = windowPoints.value;
  if (pts.length < 2) return 0;
  const startVal = pts[0]!.ratingPtt;
  const endVal = pts[pts.length - 1]!.ratingPtt;
  return Number((endVal - startVal).toFixed(3));
});

const minRangePtt = computed(() => {
  const pts = windowPoints.value;
  if (pts.length === 0) return props.currentPtt;
  return Math.min(...pts.map(p => p.ratingPtt));
});

const maxRangePtt = computed(() => {
  const pts = windowPoints.value;
  if (pts.length === 0) return props.currentPtt;
  return Math.max(...pts.map(p => p.ratingPtt));
});

// SVG Geometry Setup
const padLeft = 45;
const padRight = 20;
const padTop = 18;
const plotW = 600 - padLeft - padRight; // 535
const plotH = 120;

const yMin = computed(() => {
  const min = minRangePtt.value;
  const max = maxRangePtt.value;
  const diff = max - min;
  if (diff < 0.05) return Math.max(0, Number((min - 0.2).toFixed(2)));
  return Math.max(0, Number((min - diff * 0.15).toFixed(2)));
});

const yMax = computed(() => {
  const min = minRangePtt.value;
  const max = maxRangePtt.value;
  const diff = max - min;
  if (diff < 0.05) return Number((max + 0.2).toFixed(2));
  return Number((max + diff * 0.15).toFixed(2));
});

interface ChartPlotPoint extends ProcessedPoint {
  x: number;
  y: number;
}

const plotPoints = computed<ChartPlotPoint[]>(() => {
  const pts = windowPoints.value;
  const startT = windowStartTime.value;
  const endT = windowEndTime.value;
  const yRange = yMax.value - yMin.value || 1;
  const tRange = endT - startT || 1;

  return pts.map(p => {
    const x = padLeft + ((p.time - startT) / tRange) * plotW;
    const yRatio = (p.ratingPtt - yMin.value) / yRange;
    const y = padTop + plotH - yRatio * plotH;
    return {
      ...p,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
    };
  });
});

const latestPlotPoint = computed(() => {
  const pts = plotPoints.value;
  return pts.length > 0 ? pts[pts.length - 1] : null;
});

// Generate smooth bezier curve path
const strokePathD = computed(() => {
  const pts = plotPoints.value;
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0]!.x},${pts[0]!.y}`;

  let d = `M ${pts[0]!.x},${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const dx = (p1.x - p0.x) * 0.45;
    d += ` C ${(p0.x + dx).toFixed(1)},${p0.y} ${(p1.x - dx).toFixed(1)},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
});

const areaPathD = computed(() => {
  const lineD = strokePathD.value;
  const pts = plotPoints.value;
  if (!lineD || pts.length === 0) return '';
  const bottomY = (padTop + plotH).toFixed(1);
  const firstX = pts[0]!.x;
  const lastX = pts[pts.length - 1]!.x;
  return `${lineD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
});

// Hover & Tooltip handling
const chartContainer = ref<HTMLElement | null>(null);
const hoveredPoint = ref<ChartPlotPoint | null>(null);

function handleMouseMove(e: MouseEvent) {
  if (!chartContainer.value || plotPoints.value.length === 0) return;
  const rect = chartContainer.value.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width * 600;

  // Find nearest point along X
  let closest: ChartPlotPoint | null = null;
  let minDiff = Infinity;
  for (const pt of plotPoints.value) {
    const diff = Math.abs(pt.x - relX);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pt;
    }
  }
  hoveredPoint.value = closest;
}

const tooltipLeft = computed(() => {
  if (!hoveredPoint.value) return 50;
  return (hoveredPoint.value.x / 600) * 100;
});

const tooltipTop = computed(() => {
  if (!hoveredPoint.value) return 50;
  return (hoveredPoint.value.y / 170) * 100;
});

const tooltipTransform = computed(() => {
  if (!hoveredPoint.value) return 'translate(-50%, -100%)';
  // If point is near the right edge, shift tooltip to the left
  if (hoveredPoint.value.x > 450) {
    return 'translate(-105%, -50%)';
  }
  if (hoveredPoint.value.x < 150) {
    return 'translate(10%, -50%)';
  }
  return 'translate(-50%, -125%)';
});

// Date formatting helpers
function formatXLabel(ts: number): string {
  const d = new Date(ts * 1000);
  const key = activeFilter.value;
  if (key === '1d') {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (key === '3d' || key === '1w') {
    return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
  }
  if (key === '1m' || key === '3m') {
    return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
  }
  return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
}

function formatTooltipDate(ts: number): string {
  const d = new Date(ts * 1000);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
</script>

