export default function({ store, redirect }: any) {
  // If the user is not authenticated
  if (!store.state.token) {
    return redirect('/login')
  }
}
