<script setup lang="ts">
  import { ref } from "vue";
  import { useImageStore } from "@/stores";

  const input = ref<HTMLInputElement>();
  const label = ref<HTMLLabelElement>();
  const filename = ref("");
  const { setImage } = useImageStore();

  const handleFileUpload = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    label.value?.classList.remove("hover");

    if (input.value) {
      input.value.files = event.dataTransfer!.files;
      filename.value = event.dataTransfer!.files[0].name;
    }

    var reader = new FileReader();

    reader.onload = function (event) {
      var img = new Image();

      img.onload = () => setImage(img);

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(event.dataTransfer!.files[0]);
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

  onMounted(() => {
    if (input.value) {
      input.value.onchange = function (e) {
        let img = new Image();
        img.onload = () => setImage(img);
        img.src = URL.createObjectURL(this.files[0]);
      };
    }
  });
</script>

<template>
  <div>
    <label
      for="fileUpload"
      class="block relative w-[450px] aspect-square rounded-lg transition-colors duration-300 overflow-clip cursor-pointer"
      id="inputLabel"
      ref="label"
      @dragenter="hover"
      @dragover="hover"
      @dragleave="deHover"
      @dragend="deHover"
      @drop="handleFileUpload"
      aria-label="Upload an image"
    >
      <!-- the canvas -->
      <slot />

      <div
        class="relative w-full h-full bg-white/10 grid place-content-center border-4 border-transparent z-10"
      >
        <div class="text-center space-y-2">
          <p class="text-2xl">Click to upload an image</p>
          <p id="filename">or drag and drop here</p>
          <span
            :style="filename ? 'opacity:1;' : 'opacity:0'"
            class="absolute bottom-2 left-1/2 -translate-x-1/2"
            >Uploaded {{ filename }}</span
          >
        </div>
      </div>
    </label>
    <input class="hidden" type="file" name="fileUpload" id="fileUpload" ref="input" />
  </div>
</template>

<style scoped lang="scss">
  .hover {
    @apply bg-emerald-500;
  }
</style>
