<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Keypad from "./components/Keypad.vue";
</script>

<template>
  <Keypad/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
  width: 100vw;
  height: 100vh;
  border: 1px black;
  background-color: #101049;
}
.plugins {
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
}
</style>
