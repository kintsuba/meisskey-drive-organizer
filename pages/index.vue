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
      length="10"
      class="mt-6"
      @input="selectPage"
      @next="nextPage"
      @previous="previousPage"
    ></v-pagination>
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <div class="fab-container">
      <v-row>
        <v-col class="d-flex flex-column align-center">
          <v-slide-y-reverse-transition>
            <v-btn
              v-show="isSubFabDisplay"
              color="accent"
              fab
              class="mb-2"
              @click="removeSelectingFiles"
            >
              <v-icon>fas fa-trash</v-icon>
            </v-btn>
          </v-slide-y-reverse-transition>
          <v-slide-y-reverse-transition>
            <v-btn v-show="isSubFabDisplay" color="accent" fab class="mb-2">
              <v-icon>fas fa-file-export</v-icon>
            </v-btn>
          </v-slide-y-reverse-transition>
          <v-slide-y-reverse-transition>
            <v-btn
              v-show="isFabDisplay"
              color="accent"
              fab
              x-large
              @click="isSubFabDisplay = !isSubFabDisplay"
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
import { DriveFile } from '../types/misskey'

type fab = {
  xLarge: boolean
  icon: string
  click: Function
}

type DataType = {
  isLoading: boolean
  isSubFabDisplay: boolean
  files: DriveFile[]
  fileInfo: Map<string, boolean>
  firstFilePerPageIds: string[]
  page: number
  i: string
}

export default Vue.extend({
  components: {},
  middleware: 'authenticated',
  data(): DataType {
    return {
      isLoading: true,
      isSubFabDisplay: false,
      files: [],
      firstFilePerPageIds: [],
      page: 1,
      fileInfo: new Map(),
      i: ''
    }
  },
  computed: {
    isFabDisplay(): boolean {
      return this.files.some((f) => f.isSelecting)
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
    async removeSelectingFiles() {
      this.isLoading = true

      const selectingFiles = this.files.filter((f) => f.isSelecting)
      for (const file of selectingFiles) {
        const deleteResult = await axios.post(
          'https://misskey.m544.net/api/drive/files/delete',
          {
            i: this.i,
            fileId: file.id
          }
        )
        if (deleteResult.statusText !== 'OK') console.log(deleteResult.status)
      }

      const getResult = await axios.post(
        'https://misskey.m544.net/api/drive/files',
        {
          i: this.i,
          limit: 48
        }
      )
      this.files = getResult.data as DriveFile[]
      this.firstFilePerPageIds.length = 0
      this.firstFilePerPageIds[this.page] = this.files[0].id
      this.isSubFabDisplay = false
      this.isLoading = false
    },
    getThumbnail(id: string) {
      const file = this.files.find((f) => f.id === id)
      return file?.thumbnailUrl
        ? file?.thumbnailUrl
        : 'https://www.silhouette-illust.com/wp-content/uploads/2016/05/1327-300x300.jpg'
    },
    async nextPage() {
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
        this.page = page
        this.isLoading = false
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
