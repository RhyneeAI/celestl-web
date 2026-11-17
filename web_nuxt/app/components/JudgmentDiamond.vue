<template>
  <div class="flex flex-col items-center select-none">
    <!-- Category Label -->
    <button
      type="button"
      :class="[
        'text-[11px] font-brand font-black uppercase tracking-wider transition-all duration-150',
        labelColorClass,
        type === 'pure' ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
      ]"
      @click="type === 'pure' ? toggleShiny() : null"
      :title="type === 'pure' ? (isShiny ? 'Click to show Total Pure' : 'Click to show Shiny Pure') : undefined"
    >
      <span v-if="type === 'pure' && isShiny" class="inline-flex items-center gap-1 text-[#ffd76a] drop-shadow-[0_0_8px_rgba(255,215,106,0.6)]">
        <span>SHINY</span>
        <span class="text-[9px]">★</span>
      </span>
      <span v-else>
        {{ labelText }}
      </span>
    </button>

    <!-- Diamond SVG Badge with Number Inside -->
    <div
      :class="[
        'relative mt-1 inline-flex items-center justify-center transition-transform duration-150',
        type === 'pure' ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      ]"
      @click="type === 'pure' ? toggleShiny() : null"
      :title="tooltipText"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="48"
        height="37"
        viewBox="0 0 42.715 33.172"
        class="overflow-visible drop-shadow-md"
      >
        <defs>
          <!-- Unique Gradient for Pure -->
          <linearGradient
            v-if="type === 'pure' && !isShiny"
            :id="`grad-pure-${uid}`"
            x1="0.166"
            x2="0.897"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stop-color="#9b1691" />
            <stop offset="1" stop-color="#4176b9" />
          </linearGradient>

          <!-- Golden Gradient for Shiny Pure Active -->
          <linearGradient
            v-else-if="type === 'pure' && isShiny"
            :id="`grad-shiny-${uid}`"
            x1="0.166"
            x2="0.897"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stop-color="#78350f" />
            <stop offset="0.5" stop-color="#b45309" />
            <stop offset="1" stop-color="#d97706" />
          </linearGradient>

          <!-- Filter Shadow -->
          <filter :id="`shadow-${uid}`" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="2" dy="2" input="SourceAlpha" />
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feFlood flood-opacity="0.3" />
            <feComposite operator="in" in2="blur" />
            <feComposite in="SourceGraphic" />
          </filter>

          <linearGradient :id="`facet-grad-${uid}`" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#d4145a" stop-opacity="0.2" />
            <stop offset="1" stop-color="#bf2269" />
          </linearGradient>
        </defs>

        <g transform="translate(0.5 0.5)">
          <g>
            <!-- Main Diamond Body -->
            <g transform="matrix(1, 0, 0, 1, -0.5, -0.5)" :filter="`url(#shadow-${uid})`">
              <path
                d="M1229.109,1461.229h-9.542l-16.086,16.086,16.086,16.086h9.542l16.086-16.086Z"
                transform="translate(-1202.98 -1460.73)"
                :fill="mainFill"
              />
            </g>
            <path
              d="M1338.422,1461.23h0Z"
              transform="translate(-1316.715 -1461.23)"
              :fill="`url(#facet-grad-${uid})`"
            />
            <!-- Bottom Corner Accent Facet -->
            <path
              d="M1206.457,1510.484l6.721-9.536-9.7,9.7,16.086,16.086h9.542l-7.371-3.057Z"
              transform="translate(-1203.48 -1494.558)"
              :fill="facetFill"
            />
          </g>
        </g>

        <!-- Centered Judgement Count inside SVG at exact diamond geometric center (21.36, 16.59) -->
        <text
          x="21.36"
          y="16.59"
          text-anchor="middle"
          dominant-baseline="central"
          :fill="type === 'pure' && isShiny ? '#ffd76a' : '#ffffff'"
          class="select-none font-mono font-black pointer-events-none"
          :font-size="displayCount >= 1000 ? 10.5 : 11.5"
          style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9)); font-weight: 900;"
        >
          {{ displayCount }}
        </text>
      </svg>
    </div>

    <!-- Small Subtext / Hint below PURE -->
    <div v-if="type === 'pure'" class="mt-0.5 text-[9px] font-mono font-bold tracking-tight text-[#9a99a8]">
      <span v-if="isShiny" class="text-[#ffd76a]">
        +{{ count - shinyCount }} norm
      </span>
      <span v-else class="text-[#6f6e80] hover:text-[#f768dd] transition-colors cursor-pointer" @click="toggleShiny">
        (tap for shiny)
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    type: 'pure' | 'far' | 'lost';
    count: number;
    shinyCount?: number;
  }>(),
  {
    shinyCount: 0,
  }
);

const uid = useId ? useId() : Math.random().toString(36).slice(2, 9);
const isShiny = ref(false);

function toggleShiny() {
  if (props.type === 'pure') {
    isShiny.value = !isShiny.value;
  }
}

const labelText = computed(() => {
  switch (props.type) {
    case 'pure':
      return 'PURE';
    case 'far':
      return 'FAR';
    case 'lost':
      return 'LOST';
  }
});

const labelColorClass = computed(() => {
  switch (props.type) {
    case 'pure':
      return 'text-[#a855f7] hover:text-[#c084fc]';
    case 'far':
      return 'text-[#e58f06]';
    case 'lost':
      return 'text-[#ba0e6b]';
  }
});

const mainFill = computed(() => {
  if (props.type === 'pure') {
    return isShiny.value ? `url(#grad-shiny-${uid})` : `url(#grad-pure-${uid})`;
  }
  return '#34333e';
});

const facetFill = computed(() => {
  if (props.type === 'pure') {
    return isShiny.value ? '#ffd76a' : '#5c42c9';
  }
  if (props.type === 'far') {
    return '#e58f06';
  }
  return '#ba0e6b';
});

const displayCount = computed(() => {
  if (props.type === 'pure' && isShiny.value) {
    return props.shinyCount;
  }
  return props.count;
});

const tooltipText = computed(() => {
  if (props.type === 'pure') {
    const normalPure = Math.max(0, props.count - props.shinyCount);
    return `Total Pure: ${props.count} | Shiny Pure (Max): ${props.shinyCount} | Normal Pure: ${normalPure} (Click to toggle)`;
  }
  if (props.type === 'far') {
    return `Far (Near): ${props.count}`;
  }
  return `Lost (Miss): ${props.count}`;
});
</script>

