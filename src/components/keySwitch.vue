<template>
  <v-sheet class="key-button" v-on:click="openDialog" :id="btnId">
    <div class="img-container">
      <v-img
      width="46px"
      height="46px"
      :cover="true"
      aspect-ratio="1"
      :src="imgSrc"
      class="image"
      :id="imgId"
      ></v-img>
    </div>
    <v-dialog transition="dialog-bottom-transition" width="auto" v-model="isDialogActive">
        <v-card>
          <v-toolbar
            color="primary"
            title="Opening from the bottom"
          ></v-toolbar>
          <v-card-text>
            <div class="text-h2 pa-12">Hello world!</div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isDialogActive = false"
              >close</v-btn
            >
          </v-card-actions>
        </v-card>
    </v-dialog>
  </v-sheet>
</template>

<style scoped>
.img-container {
  margin: 5px;
}
.image {
  margin: 0px;
  border-radius: 30%;
}
.key-button {
  background-image: url("../images/keySwitchBackground.png");
  background-color: rgb(var(--v-theme-surface-variant)) !important;
  width: 80px;
  height: 80px;
  margin-left: 0px;
  margin-right: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 12px;
  position: relative;
  top: 0;
  transition: top ease 0.1s;
}
.key-button-active, .key-button:active {
  top: 4px;
}
</style>

<script lang="ts">
import { IpcRendererEvent } from 'electron';
import { ButtonState } from '../models/keys'

export default {
  components: {},
  props: {
    imgSrc: String,
    btnId: String,
    btnNr: Number
  },
  data: () => {
    return {
      imgId: '',
      isDialogActive: false,
      isActive: false,
      btn: null
    } as {
      imgId: string,
      isDialogActive: boolean,
      isActive: boolean,
      btn: HTMLElement | null
    };
  },
  mounted() {
    this.generateId()
    if(this.btnId) {
      this.$data.btn = document.getElementById(this.btnId)
      this.eventLogger()
    }
  },
  methods: {
    generateId() {
      this.imgId = 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    },
    openDialog() {
      this.$data.isDialogActive = true
    },
    eventLogger() {
      //@ts-ignore
      window.electronAPI.on("button:press", (event: IpcRendererEvent, args: {keys: ButtonState[]}[]) => {
        if(args[0].keys[this.btnNr!].state === "1" && this.$data.btn)
          this.$data.btn.classList.add("key-button-active")
        if(
          args[0].keys[this.btnNr!].state === "0" && 
          this.$data.btn && 
          this.$data.btn.classList.contains("key-button-active")
        )
          this.$data.btn.classList.remove("key-button-active")
      })
    }
  }
}
</script>