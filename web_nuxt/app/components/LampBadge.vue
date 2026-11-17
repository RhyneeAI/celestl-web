<template>
  <div class="relative inline-flex items-center justify-center shrink-0" :style="{ width: `${width}px`, height: `${height}px` }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 50.557 42.423"
      class="select-none overflow-visible"
    >
      <defs>
        <!-- Gradient based on clear lamp -->
        <linearGradient :id="`grad-${uid}`" v-bind="gradientProps">
          <stop offset="0" :stop-color="colors.stop0" />
          <stop offset="1" :stop-color="colors.stop1" />
        </linearGradient>

        <filter :id="`filter-${uid}`" x="0" y="0" width="50.557" height="42.423" filterUnits="userSpaceOnUse">
          <feOffset dx="3" dy="3" input="SourceAlpha" />
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood flood-opacity="0.25" />
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
    </svg>

    <!-- Centered Lamp Letter (C, F, PM, E, H, L) -->
    <span
      class="absolute inset-0 flex items-center justify-center font-brand font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none"
      :style="{ fontSize: `${fontSize}px`, paddingLeft: '1px' }"
    >
      {{ letter }}
    </span>
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

const width = computed(() => (props.size * 50.557) / 42.423);
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
      return {
        stop0: '#1f2937',
        stop1: '#4b5563',
        facet: '#6b7280',
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
      return 'H';
    case 'easy_clear':
    case 'easy':
      return 'E';
    case 'lost':
      return 'L';
    case 'normal_clear':
    case 'clear':
    default:
      return 'C';
  }
});
</script>

