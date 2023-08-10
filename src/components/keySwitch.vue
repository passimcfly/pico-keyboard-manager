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
      <v-card class="button-settings">
          <v-toolbar
            color="primary"
            :title="'Button: '+ ( this.btnNr + 1)"
          ></v-toolbar>
          <v-tabs
            v-model="tab"
            bg-color="primary"
          >
            <v-tab value="1">Icon</v-tab>
            <v-tab value="2">Color</v-tab>
            <v-tab value="3">Programm</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="tab">
              <v-window-item value="1">
                  <button type="button" @click="openFile()">Open a File</button>
                  <p v-if="filePath">File Path: {{ filePath }}</p>
              </v-window-item>

              <v-window-item value="2" style="padding-left: 51px; padding-right: 51px; padding-top: 10px; height: 320px; width: 300px;">
                  <v-color-picker
                    elevation="5"
                    mode="rgb"
                    v-model="color"
                    :modes="['rgb', 'hsl', 'hex']"
                  ></v-color-picker>
              </v-window-item>

              <v-window-item value="3">
                Three
              </v-window-item>
            </v-window>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isDialogActive = false">
              close
            </v-btn>
          </v-card-actions>
        </v-card>
    </v-dialog>
  </v-sheet>
</template>

<style scoped>
.window-container-item {
  height: 400px;
}
.button-settings {
  width: 450px;
  height: 550px;
}
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
      filePath: '',
      color: '',
      tab: "1",
      isDialogActive: false,
      isActive: false,
      btn: null
    } as {
      imgId: string,
      filePath: string,
      color: string,
      tab: "1" | "2" | "3",
      isDialogActive: boolean,
      isActive: boolean,
      btn: HTMLElement | null
    };
  },
  mounted() {
    this.generateId()
    if(this.btnId) {
      this.$data.btn = document.getElementById(this.btnId)
      this.setButtonEvent()
    }
  },
  methods: {
    generateId() {
      this.imgId = 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    },
    openDialog() {
      this.$data.isDialogActive = true
      this.$data.tab = "1"
    },
    async openFile() {
      //@ts-ignore
      this.$data.filePath = await window.electronAPI.selectIcon();
    },
    setButtonEvent() {
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