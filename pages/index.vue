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
            <v-card tile ripple hover @click="clickCard(file.id)">
              <v-img
                :src="getThumbnail(file.id)"
                :lazy-src="getThumbnail(file.id)"
                aspect-ratio="1"
              >
              </v-img>

              <v-fade-transition>
                <v-overlay
                  v-if="isSelecting(file.id) || hover"
                  absolute
                  color="#036358"
                >
                  <v-icon
                    x-large
                    :color="isSelecting(file.id) ? 'primary' : 'white'"
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
    <v-fab-transition>
      <v-btn
        v-show="isFabDisplay"
        color="accent"
        fixed
        bottom
        right
        fab
        x-large
        class="mb-12 mr-12"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import { DriveFile } from '../types/misskey'
const Cookie = process.client ? require('js-cookie') : undefined

type DataType = {
  isLoading: boolean
  isLoaded: boolean
  isFabDisplay: boolean
  files: DriveFile[]
  fileInfo: Map<string, boolean>
  firstFilePerPageIds: string[]
  page: number
}

export default Vue.extend({
  components: {},
  middleware: 'authenticated',
  data(): DataType {
    return {
      isLoading: true,
      isLoaded: false,
      isFabDisplay: false,

      files: [],
      firstFilePerPageIds: [],
      page: 1,
      fileInfo: new Map()
    }
  },
  async created() {
    const i = this.$store.state.i
    const result = await axios.post(
      'https://misskey.m544.net/api/drive/files',
      {
        i,
        limit: 48
      }
    )
    this.files = result.data as DriveFile[]
    this.firstFilePerPageIds[this.page] = this.files[0].id
    this.isLoading = false
  },
  methods: {
    logout() {
      Cookie.remove('token')
      this.$store.commit('setToken', null)
    },
    getThumbnail(id: string) {
      const file = this.files.find((f) => f.id === id)
      return file?.thumbnailUrl
        ? file?.thumbnailUrl
        : 'https://www.silhouette-illust.com/wp-content/uploads/2016/05/1327-300x300.jpg'
    },
    isSelecting(id: string): boolean {
      return this.fileInfo.has(id) ? this.fileInfo.get(id) ?? false : false
    },
    clickCard(id: string) {
      this.isSelecting(id)
        ? this.fileInfo.set(id, false)
        : this.fileInfo.set(id, true)

      if (this.fileInfo.size > 0) {
        let select = false
        for (const isSelecting of this.fileInfo.values()) {
          if (isSelecting) select = true
        }
        if (select) {
          this.isFabDisplay = true
        } else {
          this.isFabDisplay = false
        }
      } else {
        this.isFabDisplay = false
      }
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

<style lang="scss" scoped></style>
