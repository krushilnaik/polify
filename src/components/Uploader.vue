<script setup lang="ts">
  import { ref } from "vue";

  const input = ref<HTMLInputElement>();
  const label = ref<HTMLLabelElement>();
  const filename = ref("");

  const handleFileUpload = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    label.value?.classList.remove("hover");

    if (input.value) {
      input.value.files = event.dataTransfer.files;
      filename.value = event.dataTransfer.files[0].name;
    }
  };

  const hover = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    label.value?.classList.add("hover");
  };

  const deHover = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    label.value?.classList.remove("hover");
  };
</script>

<template>
  <div>
    <label
      for="fileUpload"
      class="relative w-[450px] aspect-square bg-white/10 rounded-lg grid place-content-center gap-2 text-center border-4 border-transparent transition-colors duration-300"
      id="inputLabel"
      ref="label"
      @dragenter="hover"
      @dragover="hover"
      @dragleave="deHover"
      @dragend="deHover"
      @drop="handleFileUpload"
      aria-label="Upload an image"
    >
      <span class="text-2xl">Click to upload an image</span>
      <span id="filename">or drag and drop here</span>
      <span
        :style="filename ? 'opacity:1;' : 'opacity:0'"
        class="absolute bottom-2 left-1/2 -translate-x-1/2"
        >Uploaded {{ filename }}</span
      >
    </label>
    <input class="hidden" type="file" name="fileUpload" id="fileUpload" ref="input" />
  </div>
</template>

<style scoped lang="scss">
  .hover {
    @apply bg-emerald-500;
  }
</style>
