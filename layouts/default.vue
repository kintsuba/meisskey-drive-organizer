<template>
  <v-app :class="bg">
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          exact
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar dark app :color="color" style="z-index:6">
      <v-app-bar-nav-icon dark @click.stop="drawer = !drawer" />
      <v-toolbar-title id="head-logo" v-text="title" />
      <v-spacer />
      <v-btn dark icon title="Change Theme" @click="changeTheme">
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
    <v-footer app :color="color" dark style="z-index:6">
      <small>&copy; 2020 Kintsuba</small>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      drawer: false,
      items: [
        {
          icon: 'fas fa-home',
          title: 'Overview',
          to: '/'
        }
      ],
      title: 'Meisskey Drive Organizer'
    }
  },
  computed: {
    color() {
      return this.$vuetify.theme.dark ? '' : 'primary darken-1'
    },
    themeIcon() {
      return this.$vuetify.theme.dark ? 'fas fa-sun' : 'fas fa-moon'
    },
    bg() {
      return this.$vuetify.theme.dark ? 'dark-bg' : 'light-bg'
    }
  },
  methods: {
    changeTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    }
  }
})
</script>
<style lang="scss" scoped>
#head-logo {
  font-family: 'Concert One', 'Nico Moji', cursive !important;
  font-size: 1.5rem;
}
.light-bg {
  // background-image: url('~assets/img/paper-bg-02.jpg');
  background-size: cover;
}
.dark-bg {
  // background-image: '';
  background-size: cover;
}
</style>
