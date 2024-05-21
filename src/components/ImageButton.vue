<template>
  <button
      v-on:click="eventoClick"
      class="image-button"
  >
    <img :src="imageSrc" :alt="altText" />
  </button>
</template>

<script>
export default {
  methods: {
    eventoClick() {
      console.log("eventoClick");
      this.$emit('buttonClick');
    }
  },
  props: {
    imageSrc: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: 'Button Image',
    },
  },
}
</script>

<style scoped>
.image-button {
  cursor: pointer;
  padding: 10px;
}

.image-button img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.2s;
}

.image-button:hover img {
  transform: scale(1.1);
}
</style>
