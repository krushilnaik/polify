import { ref } from "vue";
import { defineStore } from "pinia";

export const useImageStore = defineStore("image", () => {
  const image = ref<HTMLImageElement>();
  const hasImage = ref(false);

  function setImage(data: HTMLImageElement) {
    image.value = data;
    hasImage.value = true;
  }

  function clearImage() {
    image.value = undefined;
    hasImage.value = false;
  }

  return { image, setImage, hasImage, clearImage };
});
