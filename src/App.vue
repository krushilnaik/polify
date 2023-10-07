<script setup lang="ts">
  import { Uploader, SVG } from "@/components";
  import { useImageStore } from "@/stores";
  import { ref } from "vue";

  const canvas = ref<HTMLCanvasElement>();
  const imageStore = useImageStore();

  imageStore.$subscribe((_mutation, state) => {
    if (canvas.value && state.image) {
      canvas.value.width = state.image?.width;
      canvas.value.height = state.image?.height;
      canvas.value.style.opacity = "100%";

      const ctx = canvas.value.getContext("2d");
      ctx?.drawImage(state.image, 0, 0);
    }
  });
</script>

<template>
  <main class="flex gap-4">
    <Uploader>
      <canvas
        ref="canvas"
        class="absolute top-0 left-0 w-full h-full z-20 opacity-0 transition-opacity duration-500 delay-300"
      />
    </Uploader>

    <SVG />
  </main>
</template>
