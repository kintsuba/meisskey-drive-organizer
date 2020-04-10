<template>
  <v-container>
    <v-row>
      <v-col
        v-for="file in files"
        :key="file.id"
        class="d-flex child-flex"
        xl="1"
        lg="2"
        md="2"
        sm="3"
        cols="5"
      >
        <v-hover>
          <template v-slot:default="{ hover }">
            <v-card tile ripple hover @click="clickCard(file)">
              <v-img
                :src="getThumbnail(file.id)"
                :lazy-src="getThumbnail(file.id)"
                aspect-ratio="1"
              >
              </v-img>

              <v-fade-transition>
                <v-overlay
                  v-if="file.isSelecting || hover"
                  absolute
                  color="#036358"
                >
                  <v-icon
                    x-large
                    :color="file.isSelecting ? 'primary' : 'white'"
                    >fas fa-check-circle</v-icon
                  >
                </v-overlay>
              </v-fade-transition>
            </v-card>
          </template>
        </v-hover>
      </v-col>
    </v-row>
    <v-pagination
      :value="page"
      :length="length"
      class="mt-6"
      @input="selectPage"
      @next="nextPage"
      @previous="previousPage"
    ></v-pagination>
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-dialog v-model="removeDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Remove Files</span>
        </v-card-title>
        <v-card-text>
          Remove these files, Okay?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="removeDialog = false">Close</v-btn>
          <v-btn color="red" text @click="removeSelectingFiles">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="moveDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Move Files</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectingFolder"
            :items="folders"
            label="Folder"
            item-text="name"
            required
            return-object
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="moveDialog = false">Close</v-btn>
          <v-btn color="red" text @click="moveSelectingFiles">Move</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="fab-container">
      <v-row>
        <v-col class="d-flex flex-column align-center">
          <v-slide-y-reverse-transition>
            <v-btn
              v-show="isSubFabDisplay"
              color="accent"
              fab
              class="mb-2"
              @click="removeDialog = true"
            >
              <v-icon>fas fa-trash</v-icon>
            </v-btn>
          </v-slide-y-reverse-transition>
          <v-slide-y-reverse-transition>
            <v-btn
              v-show="isSubFabDisplay"
              color="accent"
              fab
              class="mb-2"
              @click.stop="openMoveDialog"
            >
              <v-icon>fas fa-file-export</v-icon>
            </v-btn>
          </v-slide-y-reverse-transition>
          <v-slide-y-reverse-transition>
            <v-btn
              v-show="isFabDisplay"
              color="accent"
              fab
              x-large
              @click="isClickedFab = !isClickedFab"
            >
              <v-icon>{{
                isSubFabDisplay ? 'fas fa-chevron-down' : 'fas fa-chevron-up'
              }}</v-icon>
            </v-btn>
          </v-slide-y-reverse-transition>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import { DriveFile, DriveFolder } from '../types/misskey'

type DataType = {
  isLoading: boolean
  isClickedFab: boolean
  files: DriveFile[]
  fileInfo: Map<string, boolean>
  folders: DriveFolder[]
  selectingFolder: DriveFolder
  firstFilePerPageIds: string[]
  page: number
  removeDialog: boolean
  moveDialog: boolean
  i: string
}

export default Vue.extend({
  components: {},
  middleware: 'authenticated',
  data(): DataType {
    return {
      isLoading: true,
      isClickedFab: false,
      files: [],
      fileInfo: new Map(),
      folders: [],
      selectingFolder: {
        id: '',
        createdAt: '',
        name: '',
        foldersCount: 0,
        filesCount: 0
      },
      firstFilePerPageIds: [],
      page: 1,
      removeDialog: false,
      moveDialog: false,
      i: ''
    }
  },
  computed: {
    isFabDisplay(): boolean {
      return this.files.some((f) => f.isSelecting)
    },
    isSubFabDisplay(): boolean {
      return this.isClickedFab && this.isFabDisplay
    },
    length(): number {
      return this.page + 1
    }
  },
  async created() {
    this.i = this.$store.state.i
    const result = await axios.post(
      'https://misskey.m544.net/api/drive/files',
      {
        i: this.i,
        limit: 48
      }
    )
    this.files = result.data as DriveFile[]
    this.firstFilePerPageIds[this.page] = this.files[0].id
    this.isLoading = false
  },
  methods: {
    clickCard(file: DriveFile) {
      this.$set(file, 'isSelecting', !file.isSelecting)
    },
    async updateFiles() {
      const getResult = await axios.post(
        'https://misskey.m544.net/api/drive/files',
        {
          i: this.i,
          limit: 48
        }
      )
      this.files = getResult.data as DriveFile[]
      this.firstFilePerPageIds.length = 0
      this.page = 1
      this.firstFilePerPageIds[this.page] = this.files[0].id
      this.isClickedFab = false
    },
    async removeSelectingFiles() {
      this.isLoading = true

      const selectingFiles = this.files.filter((f) => f.isSelecting)
      for (const file of selectingFiles) {
        const result = await axios.post(
          'https://misskey.m544.net/api/drive/files/delete',
          {
            i: this.i,
            fileId: file.id
          }
        )
        if (result.statusText !== 'OK') console.error(result.status)
      }

      this.removeDialog = false
      this.updateFiles()
      this.isLoading = false
    },
    async moveSelectingFiles() {
      this.isLoading = true

      const selectingFiles = this.files.filter((f) => f.isSelecting)
      for (const file of selectingFiles) {
        const result = await axios.post(
          'https://misskey.m544.net/api/drive/files/update',
          {
            i: this.i,
            fileId: file.id,
            folderId: this.selectingFolder.id
          }
        )
        if (result.statusText !== 'OK') console.error(result.status)
      }
      this.moveDialog = false
      this.updateFiles()
      this.isLoading = false
    },
    getThumbnail(id: string) {
      const file = this.files.find((f) => f.id === id)
      return file?.thumbnailUrl
        ? file?.thumbnailUrl
        : 'https://www.silhouette-illust.com/wp-content/uploads/2016/05/1327-300x300.jpg'
    },
    async openMoveDialog() {
      this.i = this.$store.state.i
      const result = await axios.post(
        'https://misskey.m544.net/api/drive/folders',
        {
          i: this.i,
          limit: 100
        }
      )
      this.folders = result.data as DriveFolder[]

      this.moveDialog = true
    },

    async nextPage(fromSelect = false) {
      if (fromSelect) return // 二重防止

      this.isLoading = true
      const i = this.$store.state.i
      const result = await axios.post(
        'https://misskey.m544.net/api/drive/files',
        {
          i,
          limit: 48,
          untilId: this.files[47].id
        }
      )
      this.files = result.data as DriveFile[]
      this.isClickedFab = false
      this.firstFilePerPageIds[this.page] = this.files[0].id
      this.page++
      this.isLoading = false
    },
    async previousPage() {
      if (this.page === 1) return

      this.isLoading = true
      const i = this.$store.state.i
      const result = await axios.post(
        'https://misskey.m544.net/api/drive/files',
        {
          i,
          limit: 48,
          sinceId: this.firstFilePerPageIds[this.page - 1]
        }
      )
      this.files = result.data.reverse() as DriveFile[]
      this.isClickedFab = false
      this.page--
      this.isLoading = false
    },
    async selectPage(page: number) {
      if (this.firstFilePerPageIds[page]) {
        this.isLoading = true
        const i = this.$store.state.i
        const result = await axios.post(
          'https://misskey.m544.net/api/drive/files',
          {
            i,
            limit: 48,
            sinceId: this.firstFilePerPageIds[this.page - 1]
          }
        )
        this.files = result.data.reverse() as DriveFile[]
        this.isClickedFab = false
        this.page = page
        this.isLoading = false
      } else if (page === this.page + 1) {
        this.nextPage(true)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.fab-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
}
</style>
