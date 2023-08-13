<template>
  <v-sheet class="key-button" v-on:click="openDialog" :id="btnId">
    <div class="img-container">
      <v-img
        width="46px"
        height="46px"
        :cover="true"
        aspect-ratio="1"
        v-bind:src="iconBase64"
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
                <div>
                  <v-text-field 
                    :readonly="true"
                    v-model="editConfig.iconPath"
                    label="Set icon path" 
                    prepend-inner-icon="mdi-file" 
                    @click="openIconFile()"
                  ></v-text-field> 
                </div>
                <v-sheet class="edit-key-button">
                  <div class="img-container">
                    <v-img
                      width="46px"
                      height="46px"
                      :cover="true"
                      aspect-ratio="1"
                      :src="editIconBase64"
                      class="image"
                      :id="imgId"
                    ></v-img>
                  </div>
                </v-sheet>
              </v-window-item>

              <v-window-item value="2" style="padding-left: 51px; padding-right: 51px; padding-top: 10px; height: 320px; width: 300px;">
                  <v-color-picker
                    elevation="5"
                    mode="rgb"
                    v-model="editConfig.color"
                    :modes="['rgb', 'hsl', 'hex']"
                  ></v-color-picker>
              </v-window-item>

              <v-window-item value="3">
                <div>
                  <v-text-field 
                    :readonly="true"
                    v-model="editConfig.programmPath"
                    label="Set programm path" 
                    prepend-inner-icon="mdi-file" 
                    @click="openProgrammFile()"
                  ></v-text-field> 
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="cancelDialog()">
              cancel
            </v-btn>
            <v-btn variant="text" @click="saveDialog()">
              save
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
.edit-key-button {
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
}
.key-button-active, .key-button:active {
  top: 4px;
}
</style>

<script lang="ts">
import { ButtonConfig } from '../models/buttonConfig'

export default {
  components: {},
  props: {
    btnId: String,
    btnNr: Number,
    btnActive: String
  },
  data: () => {
    return {
      imgId: '',
      config: {
        btn: 0,
        iconPath: '',
        color: '',
        programmPath: ''
      },
      editConfig: {
        btn: 0,
        iconPath: '',
        color: '',
        programmPath: ''
      },
      tab: "1",
      isDialogActive: false,
      isActive: false,
      btn: null,
      iconBase64: '',
      editIconBase64: ''
    } as {
      imgId: string,
      config: ButtonConfig,
      editConfig: ButtonConfig
      tab: "1" | "2" | "3",
      isDialogActive: boolean,
      isActive: boolean,
      btn: HTMLElement | null,
      iconBase64: string,
      editIconBase64: string
    };
  },
  async mounted() {
    this.generateId()
    if(this.btnId) {
      this.$data.btn = document.getElementById(this.btnId)
      // this.setButtonEvent()
    }
    this.readConfig()
  },
  methods: {
    generateId() {
      this.imgId = 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    },
    openDialog() {
      this.$data.isDialogActive = true
      this.$data.tab = "1"
    },
    cancelDialog() {
      this.$data.isDialogActive = false
      this.$data.editConfig = this.$data.config
      this.$data.editIconBase64 = this.$data.iconBase64
    },
    saveDialog() {
      this.$data.isDialogActive = false
      this.writeConfig()
    },
    async openIconFile() {
      //@ts-ignore
      const path = await window.electronAPI.selectPath("Select Icon", ["png", "jpg", "ico"]);
      this.$data.editConfig.iconPath = path !== null ? path : this.$data.editConfig.iconPath
      this.$data.editIconBase64 = await this.readIconFile(this.$data.editConfig.iconPath)
    },
    async openProgrammFile() {
      //@ts-ignore
      const path = await window.electronAPI.selectPath("Select Programm or Shortcut", ["exe","", "ink", "url"]);
      this.$data.editConfig.programmPath = path !== null ? path : this.$data.editConfig.programmPath
    },
    async readIconFile(path: string): Promise<string> {
      //@ts-ignore
      const src = await window.electronAPI.readIconFile(path);
      return src ? src : ""
    },
    async readConfig() {
      //@ts-ignore
      let config: ButtonConfig = await window.electronAPI.readConfig(this.btnNr);
      this.$data.config = config
      this.$data.editConfig = config
      this.$data.iconBase64 = await this.readIconFile(this.$data.config.iconPath)
      this.$data.editIconBase64 = await this.readIconFile(this.$data.editConfig.iconPath)
    },
    async writeConfig() {
      const editConfig = {
        btn: this.$data.editConfig.btn,
        color: this.$data.editConfig.color,
        iconPath: this.$data.editConfig.iconPath,
        programmPath: this.$data.editConfig.programmPath
      } as ButtonConfig
      //@ts-ignore
      this.$data.config = await window.electronAPI.writeConfig(editConfig);
      this.$data.iconBase64 = this.$data.editIconBase64;
    },
    changeBtnState(state: "1" | "0") {
      if(state === "1" && this.$data.btn)
        this.$data.btn.classList.add("key-button-active")
      if(
        state === "0" && 
        this.$data.btn && 
        this.$data.btn.classList.contains("key-button-active")
      )
        this.$data.btn.classList.remove("key-button-active")
    },
  },
  watch: {
    btnActive: {
      handler(value) {
        this.changeBtnState(value)
      }
    }
  }
}
</script>