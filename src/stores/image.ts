import { ref } from "vue";
import { defineStore } from "pinia";

export const useImageStore = defineStore("image", () => {
  const image = ref(0);
  // const doubleCount = computed(() => count.value * 2)
  // function increment() {
  //   count.value++
  // }
  function setImage(data) {
    image.value = data;
  }

  return { image, setImage };
});
