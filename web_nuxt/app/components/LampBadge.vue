<template>
  <div class="relative inline-flex items-center justify-center shrink-0" :style="{ width: `${width}px`, height: `${height}px` }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 36.558 28.424"
      class="select-none overflow-visible"
    >
      <defs>
        <!-- Gradient based on clear lamp -->
        <linearGradient :id="`grad-${uid}`" v-bind="gradientProps">
          <stop offset="0" :stop-color="colors.stop0" />
          <stop offset="1" :stop-color="colors.stop1" />
        </linearGradient>

        <filter :id="`filter-${uid}`" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="2" dy="2" input="SourceAlpha" />
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feFlood flood-opacity="0.3" />
          <feComposite operator="in" in2="blur" />
          <feComposite in="SourceGraphic" />
        </filter>
      </defs>

      <g transform="translate(-263.181 -468.99)">
        <g transform="translate(263.681 469.49)">
          <g transform="matrix(1, 0, 0, 1, -0.5, -0.5)" :filter="`url(#filter-${uid})`">
            <path
              d="M1225.326,1461.23h-8.134l-13.712,13.712,13.712,13.712h8.134l13.712-13.712Z"
              transform="translate(-1202.98 -1460.73)"
              :fill="`url(#grad-${uid})`"
            />
          </g>
          <!-- Corner facet reflection -->
          <path
            d="M1206.017,1509.076l5.729-8.129-8.266,8.266,13.712,13.712h8.134l-6.283-2.605Z"
            transform="translate(-1203.48 -1495.502)"
            :fill="colors.facet"
          />
        </g>
      </g>

      <!-- Centered Lamp Letter inside SVG at exact diamond geometric center (18.28, 14.21) -->
      <text
        x="18.28"
        y="14.21"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#ffffff"
        class="select-none pointer-events-none font-brand font-black"
        :font-size="letter === 'PM' ? 9.5 : 12"
        style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.85)); font-weight: 900;"
      >
        {{ letter }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    lamp: string;
    size?: number;
  }>(),
  {
    size: 42,
  }
);

const width = computed(() => (props.size * 36.558) / 28.424);
const height = computed(() => props.size);
const fontSize = computed(() => Math.round(props.size * 0.38));

// Generate unique id for SVG filters/gradients
const uid = computed(() => `lamp-${Math.random().toString(36).slice(2, 9)}`);

const colors = computed(() => {
  switch (props.lamp) {
    case 'pure_memory':
    case 'pm':
      return {
        stop0: '#643262',
        stop1: '#119190',
        facet: '#328aa0',
      };
    case 'full_recall':
    case 'fr':
      return {
        stop0: '#2b1b54',
        stop1: '#5b32a8',
        facet: '#805ad5',
      };
    case 'hard_clear':
    case 'hard':
      return {
        stop0: '#240a15',
        stop1: '#a82b4b',
        facet: '#b3526c',
      };
    case 'easy_clear':
    case 'easy':
      return {
        stop0: '#0d2818',
        stop1: '#16a34a',
        facet: '#4ade80',
      };
    case 'lost':
    case 'track_lost':
    case 'fail':
      return {
        stop0: '#1a1d32',
        stop1: '#374151',
        facet: '#ba0e6b',
      };
    case 'normal_clear':
    case 'clear':
    default:
      return {
        stop0: '#4c2a4a',
        stop1: '#9623a5',
        facet: '#9441a0',
      };
  }
});

const gradientProps = computed(() => {
  if (props.lamp === 'pure_memory' || props.lamp === 'pm') {
    return { y1: '0.037', x2: '0.968', y2: '1', gradientUnits: 'objectBoundingBox' };
  }
  if (props.lamp === 'normal_clear' || props.lamp === 'clear') {
    return { x2: '1.334', y2: '1.798', gradientUnits: 'objectBoundingBox' };
  }
  return { x2: '1', y2: '1', gradientUnits: 'objectBoundingBox' };
});

const letter = computed(() => {
  switch (props.lamp) {
    case 'pure_memory':
    case 'pm':
      return 'PM';
    case 'full_recall':
    case 'fr':
      return 'F';
    case 'hard_clear':
    case 'hard':
      return 'C';
    case 'easy_clear':
    case 'easy':
      return 'E';
    case 'lost':
    case 'track_lost':
    case 'fail':
      return 'L';
    case 'normal_clear':
    case 'clear':
    default:
      return 'C';
  }
});
</script>

