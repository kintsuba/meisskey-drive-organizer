<template>
  <v-container fill-height>
    <v-row justify="center" align-content="center">
      <v-col cols="8">
        <v-row justify="center" align-content="center">
          <h1 class="display-3 mb-12 text-center">Meisskey Drive Organizer</h1>
        </v-row>
        <v-row justify="center" align-content="center">
          <v-col cols="12">
            <p v-if="!isLogin" class="lead-mei text-center">
              まずは LOGIN ボタンからめいすきーにログインするのだわ。
            </p>
            <p v-else class="lead-mei text-center">
              OPEN DRIVE を押すとドライブ一覧が開くのだわ。
            </p>
          </v-col>
        </v-row>

        <v-row justify="center" align-content="center">
          <v-col v-if="!isLogin" cols="3" class="text-center">
            <v-btn color="primary" x-large @click="postLogin">
              login
            </v-btn>
          </v-col>
          <v-col v-else cols="3" class="text-center">
            <v-btn color="primary" x-large @click="open()">
              Open Drive
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import crypto from 'crypto'
import Vue from 'vue'
import axios from 'axios'
// const Cookie = process.client ? require('js-cookie') : undefined
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
console.log(process.env.NODE_ENV)
console.log(process.env.APP_SECRET)

const generateHash = (text: string) => {
  const sha256 = crypto.createHash('sha256')
  sha256.update(text)
  return sha256.digest('hex')
}

export default Vue.extend({
  data() {
    return {
      disabled: true,
      isLogin: false,

      token: ''
    }
  },

  middleware: 'notAuthenticated',
  methods: {
    async postLogin() {
      const appSecret = process.env.APP_SECRET

      const {
        data: { url, token }
      } = await axios.post(
        'https://misskey.m544.net/api/auth/session/generate',
        {
          appSecret
        }
      )

      window.open(url)

      // Cookie.set('token', token) // saving token in cookie for server rendering

      this.isLogin = true
      this.token = token
    },
    async open() {
      const appSecret = process.env.APP_SECRET
      const {
        data: { accessToken }
      } = await axios.post(
        'https://misskey.m544.net/api/auth/session/userkey',
        {
          appSecret,
          token: this.token
        }
      )

      const i = generateHash(`${accessToken}${appSecret}`)
      this.$store.commit('setToken', this.token) // mutating to store for client rendering
      this.$store.commit('setI', i)
      this.$router.push('/')
    }
  }
})
</script>
<style lang="scss" scoped>
.lead-mei {
  font-family: '-apple-system, BlinkMacSystemFont, Roboto, "游ゴシック体", YuGothic, "Yu Gothic Medium", sans-serif' !important;
  font-weight: normal;
  font-size: 1.2em;
}
</style>
