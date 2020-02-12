export default function({ store, redirect }: any) {
  // If the user is authenticated redirect to home page
  if (store.state.token) {
    return redirect('/')
  }
}
