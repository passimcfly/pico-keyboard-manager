<template>
  <v-container class="bg-surface-variant">
    <v-row>
      <v-col>
        <KeySwitch
          :btn-nr="0"
          btn-id="btn0"
          :btnActive="btn0"
          />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="3"
          btn-id="btn3"
          :btnActive="btn3"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="6"
          btn-id="btn6"
          :btnActive="btn6"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <KeySwitch 
          :btn-nr="1"
          btn-id="btn1"
          :btnActive="btn1"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="4"
          btn-id="btn4"
          :btnActive="btn4"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="7"
          btn-id="btn7"
          :btnActive="btn7"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <KeySwitch 
          :btn-nr="2"
          btn-id="btn2"
          :btnActive="btn2"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="5"
          btn-id="btn5"
          :btnActive="btn5"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="8"
          btn-id="btn8"
          :btnActive="btn8"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <KeySwitch 
          :btn-nr="9"
          btn-id="btn9"
          :btnActive="btn9"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="10"
          btn-id="btn10"
          :btnActive="btn10"
        />
      </v-col>
      <v-col>
        <KeySwitch 
          :btn-nr="11"
          btn-id="btn11"
          :btnActive="btn11"
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
import KeySwitch from "./keySwitch.vue";
import { IpcRendererEvent } from 'electron';
import { ButtonState } from '../models/keys';
// import { buttons } from '../enums/buttons'

export default {
  components: {
    KeySwitch
  },
  data() {
    return {
      btn0: "0",
      btn1: "0",
      btn2: "0",
      btn3: "0",
      btn4: "0",
      btn5: "0",
      btn6: "0",
      btn7: "0",
      btn8: "0",
      btn9: "0",
      btn10: "0",
      btn11: "0",
    } as {
      btn0: "1" | "0",
      btn1: "1" | "0",
      btn2: "1" | "0",
      btn3: "1" | "0",
      btn4: "1" | "0",
      btn5: "1" | "0",
      btn6: "1" | "0",
      btn7: "1" | "0",
      btn8: "1" | "0",
      btn9: "1" | "0",
      btn10: "1" | "0",
      btn11: "1" | "0",
    }
  },
  mounted() {
    this.setButtonEvent()
  },
  methods: {
    processButtonStates(event: IpcRendererEvent, args: {keys: ButtonState[]}[]) {
      args[0].keys.forEach((key)=>{
        const btn = `btn${key.btn}`
        //@ts-ignore
        this.$data[btn] = key.state
      })
    },
    setButtonEvent() {
      //@ts-ignore
      window.electronAPI.on("button:press", this.processButtonStates)
    }
  }
}

</script>