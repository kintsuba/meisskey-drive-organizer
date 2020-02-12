const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => {
  return {
    token: null
  }
}
export const mutations = {
  setToken(state: any, token: any) {
    state.token = token
  }
}
export const actions = {
  nuxtServerInit({ commit }: any, { req }: any) {
    let token = null
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      try {
        token = JSON.parse(parsed.token)
      } catch (err) {
        // No valid cookie found
      }
    }
    commit('setToken', token)
  }
}
