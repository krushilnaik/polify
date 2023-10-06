<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useImageStore } from "@/stores";
  import { animate } from "motion";

  const input = ref<HTMLInputElement>();
  const label = ref<HTMLLabelElement>();
  const loader = ref<SVGImageElement>();
  const filename = ref("");
  const { setImage } = useImageStore();

  const uploadAnimation = () => {
    animate("#circle", {
      transform: `scale(500%)`,
    });

    if (loader.value) {
      loader.value.classList.add("uploaded");
    }

    document.getElementById("tooltip")!.style.display = "none";
  };

  const handleDrop = (event: DragEvent) => {
    label.value?.classList.remove("hover");
    event.preventDefault();
    event.stopPropagation();

    if (input.value) {
      input.value.files = event.dataTransfer!.files;
      filename.value = event.dataTransfer!.files[0].name;
    }

    var reader = new FileReader();

    reader.onload = function (event) {
      var img = new Image();
      img.onload = () => setImage(img);
      img.src = event.target?.result as string;
      uploadAnimation();
    };

    reader.readAsDataURL(event.dataTransfer!.files[0]);
  };

  const hover = () => {
    // @ts-expect-error
    if ((document.getElementById("circle") as SVGCircleElement).r !== 1900) {
      // @ts-expect-error
      animate("#circle", {
        r: 400,
      });
    }

    label.value?.classList.add("hover");
  };

  const deHover = () => {
    if (!filename.value.length) {
      // @ts-expect-error
      animate("#circle", {
        r: 0,
      });
    }

    label.value?.classList.remove("hover");
  };

  onMounted(() => {
    if (input.value) {
      input.value.onchange = function (e) {
        let img = new Image();
        img.onload = () => setImage(img);
        img.src = URL.createObjectURL(this.files[0]);
        filename.value = this.files[0].name;
        uploadAnimation();
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
      @dragover.prevent=""
      @mouseover="hover"
      @dragenter="hover"
      @mouseleave="deHover"
      @dragleave="deHover"
      @drop="handleDrop"
      aria-label="Upload an image"
    >
      <!-- the canvas -->
      <slot />

      <div
        id="tooltip"
        class="relative w-full h-full grid place-content-center border-4 border-transparent z-10"
      >
        <p class="text-2xl">Drag and drop an image here</p>
      </div>

      <svg
        viewBox="0 0 1700 1700"
        class="absolute top-0 left-0 w-full h-full rounded-xl aspect-square bg-white/10"
      >
        <defs>
          <filter id="displacementFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="1"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="50"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <mask id="circleMask">
            <circle
              cx="50%"
              cy="100%"
              r="0"
              style="transform: scale(100%)"
              id="circle"
              fill="white"
              class="[filter:url(#displacementFilter)] origin-bottom"
            />
          </mask>
        </defs>
        <image
          ref="loader"
          mask="url(#circleMask)"
          class="absolute h-full bottom-0 border-2 border-white transition-transform duration-300"
          href="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        />
      </svg>
    </label>
    <input class="hidden" type="file" name="fileUpload" id="fileUpload" ref="input" />
  </div>
</template>

<style scoped lang="scss">
  .hover {
    @apply bg-white/10;
  }

  .uploaded {
    @apply brightness-0 invert;
  }
</style>
