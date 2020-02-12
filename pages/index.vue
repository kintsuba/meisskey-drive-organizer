<template>
  <v-container fill-height>
    <v-row justify="center" align-content="center">
      <v-col cols="8" class="text-center">
        <v-btn color="primary" x-large :loading="isLoading" @click="loadDrive"
          >Load Drive</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import crypto from 'crypto'
import Vue from 'vue'
import axios from 'axios'
const Cookie = process.client ? require('js-cookie') : undefined

const generateHash = (text: string) => {
  const sha256 = crypto.createHash('sha256')
  sha256.update(text)
  return sha256.digest('hex')
}

export default Vue.extend({
  components: {},
  middleware: 'authenticated',
  data() {
    return {
      isLoading: false,
      isLoaded: false
    }
  },
  methods: {
    logout() {
      Cookie.remove('token')
      this.$store.commit('setToken', null)
    },
    async loadDrive() {
      this.isLoading = true
      const appSecret = process.env.APP_SECRET

      const token = this.$store.state.token
      const {
        data: { user }
      } = await axios.post(
        'https://misskey.m544.net/api/auth/session/userkey',
        { appSecret, token }
      )
      console.log(user)
      const i = generateHash(
        `${this.$store.state.token}${process.env.APP_SECRET}`
      )
      const result = await axios.post(
        'https://misskey.m544.net/api/drive/files',
        {
          i,
          limit: 20
        },
        { withCredentials: false }
      )
      console.log(result)
      this.isLoading = false
      this.isLoaded = true
    }
  }
})
</script>

<style lang="scss" scoped></style>
