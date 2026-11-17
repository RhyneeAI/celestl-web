<template>
  <div class="flex min-h-screen flex-col bg-[#0c0c22] text-[#fffafa] font-sans antialiased">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-[#0c0c22]/95 backdrop-blur border-b border-[#16133e]/50">
      <div class="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6">
        <NuxtLink to="/" class="font-brand text-[18px] font-semibold tracking-wide text-[#fffafa] flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#f768dd] shadow-[0_0_8px_#f768dd]"></span>
          Celestl
        </NuxtLink>

        <nav class="ml-auto flex items-center gap-1.5 sm:gap-2">
          <NuxtLink
            to="/"
            :class="[
              'rounded-xl px-3 py-1.5 text-[13.5px] font-semibold transition-colors',
              route.path === '/' || (route.path.startsWith('/songs') && !route.path.startsWith('/admin'))
                ? 'bg-[#16133e] text-[#fffafa]'
                : 'text-[#9a99a8] hover:bg-[#1e203a] hover:text-[#fffafa]'
            ]"
          >
            Songs
          </NuxtLink>

          <NuxtLink
            to="/packs"
            :class="[
              'rounded-xl px-3 py-1.5 text-[13.5px] font-semibold transition-colors',
              route.path.startsWith('/packs') && !route.path.startsWith('/admin')
                ? 'bg-[#16133e] text-[#fffafa]'
                : 'text-[#9a99a8] hover:bg-[#1e203a] hover:text-[#fffafa]'
            ]"
          >
            Packs
          </NuxtLink>

          <NuxtLink
            to="/calculator"
            :class="[
              'rounded-xl px-3 py-1.5 text-[13.5px] font-semibold transition-colors',
              route.path.startsWith('/calculator')
                ? 'bg-[#16133e] text-[#fffafa]'
                : 'text-[#9a99a8] hover:bg-[#1e203a] hover:text-[#fffafa]'
            ]"
          >
            Calculator
          </NuxtLink>

          <div class="h-4 w-px bg-[#3f3c68]/40 mx-1"></div>

          <NuxtLink
            to="/admin"
            class="rounded-xl px-2.5 py-1.5 text-[12.5px] font-medium text-[#7b5d85] hover:text-[#f768dd] hover:bg-[#16133e]/60 transition-colors"
          >
            Admin ↗
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Body -->
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-[#16133e]/40 py-6 text-center text-[12px] text-[#6f6e80]">
      <div class="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Celestl &bull; Unofficial Arcaea Score Tracker & Tool</span>
        <span>Arcaea &copy; Lowiro. All assets belong to their respective owners.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>
