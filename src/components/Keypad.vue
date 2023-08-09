<template>
  <v-container class="bg-surface-variant">
    <v-row>
      <v-col>
        <KeySwitch
          :btn-nr="0"
          btn-id="btn0"
          img-src="https://picsum.photos/500/300?image=10"
          />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="3"
          btn-id="btn3" 
          img-src="https://picsum.photos/500/300?image=20"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="6"
          btn-id="btn6" 
          img-src="https://picsum.photos/500/300?image=30"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <KeySwitch 
          :btn-nr="1"
          btn-id="btn1" 
          img-src="https://picsum.photos/500/300?image=40"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="4"
          btn-id="btn4" 
          img-src="https://picsum.photos/500/300?image=50"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="7"
          btn-id="btn7" 
          img-src="https://picsum.photos/500/300?image=60"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <KeySwitch 
          :btn-nr="2"
          btn-id="btn2" 
          img-src="https://picsum.photos/500/300?image=70"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="5"
          btn-id="btn5" 
          img-src="https://picsum.photos/500/300?image=80"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="8"
          btn-id="btn8" 
          img-src="https://picsum.photos/500/300?image=90"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <KeySwitch 
          :btn-nr="9"
          btn-id="btn9" 
          img-src="https://picsum.photos/500/300?image=100"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="10"
          btn-id="btn10" 
          img-src="https://picsum.photos/500/300?image=110"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="11"
          btn-id="btn11" 
          img-src="https://picsum.photos/500/300?image=120"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-col {
  padding: 12px;
}
.v-container {
  width: 320px;
}

</style>

<script lang="ts">
// import { ref } from "vue";
import KeySwitch from "./keySwitch.vue";


export default {
  components: {
    KeySwitch
  }
}

</script>