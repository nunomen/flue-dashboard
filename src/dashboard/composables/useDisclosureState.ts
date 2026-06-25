import { readonly, shallowRef } from 'vue'

export function useDisclosureState(initial = false) {
  const open = shallowRef(initial)

  function show() {
    open.value = true
  }

  function hide() {
    open.value = false
  }

  function toggle() {
    open.value = !open.value
  }

  return {
    open: readonly(open),
    show,
    hide,
    toggle,
  }
}
