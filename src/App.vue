<script setup lang="ts">
  import { TheWelcome, Uploader } from "@/components";
</script>

<template>
  <main class="flex flex-col gap-4">
    <TheWelcome />
    <Uploader />
    <!-- <canvas
      class="w-80 md:w-[450px] aspect-square bg-black/10 dark:bg-white/10 rounded-lg"
    /> -->
  </main>
</template>
