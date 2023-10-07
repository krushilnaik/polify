<script setup lang="ts">
  import { ref } from "vue";
  import { useImageStore } from "@/stores";

  const imageStore = useImageStore();
  const svg = ref<SVGElement>();

  imageStore.$subscribe((_mutation, _state) => {
    console.log("buiding low poly");
    if (svg.value) {
      svg.value.style.background = "white";
    }
  });
</script>

<template>
  <svg
    ref="svg"
    class="bg-white/10 w-80 md:w-[450px] aspect-square rounded-lg transition-colors duration-500 delay-300"
    stroke="currentColor"
    stroke-width="0.5"
  ></svg>
</template>
