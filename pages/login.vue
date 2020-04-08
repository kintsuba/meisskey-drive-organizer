<template>
  <v-container fill-height>
    <v-row justify="center" align-content="center">
      <v-col cols="8">
        <v-row justify="center" align-content="center">
          <h1 class="display-3 mb-12 text-center">Meisskey Drive Organizer</h1>
        </v-row>
        <v-row justify="center" align-content="center">
          <v-col cols="12">
            <p class="lead-mei text-center">
              まずは LOGIN ボタンからめいすきーにログインするのだわ。
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
            <v-btn color="primary" x-large to="/" nuxt>
              Go
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
const Cookie = process.client ? require('js-cookie') : undefined
require('dotenv').config()

export default Vue.extend({
  data() {
    return {
      disabled: true,
      isLogin: false
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

      this.$store.commit('setToken', token) // mutating to store for client rendering
      Cookie.set('token', token) // saving token in cookie for server rendering

      this.isLogin = true
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
