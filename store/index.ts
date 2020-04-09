// const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => {
  return {
    token: null,
    i: null
  }
}
export const mutations = {
  setToken(state: any, token: any) {
    state.token = token
  },
  setI(state: any, i: any) {
    state.i = i
  }
}
export const actions = {
  // nuxtServerInit({ commit }: any, { req }: any) {
  //   let token: string = ''
  //   if (req.headers.cookie) {
  //     const parsed = cookieparser.parse(req.headers.cookie)
  //     try {
  //       token = JSON.parse(parsed.token)
  //     } catch (err) {
  //       // No valid cookie found
  //     }
  //   }
  //   commit('setToken', token)
  // }
}
