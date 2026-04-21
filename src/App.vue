<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useEntriesStore } from './stores/entries'
import { useSettingsStore } from './stores/settings'
import AppNav from './components/AppNav.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'

const router = useRouter()
const authStore = useAuthStore()
const entriesStore = useEntriesStore()
const settingsStore = useSettingsStore()

watch(
  [() => authStore.ready, () => authStore.user],
  async ([ready, user], [, prevUser]) => {
    if (!ready) return

    if (user) {
      if (!prevUser) {
        // First time we have a user: load data
        await settingsStore.load()
        entriesStore.listen()
      }
      // Redirect away from login after signing in
      if (router.currentRoute.value.path === '/login') {
        router.replace('/')
      }
    } else {
      router.replace('/login')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen flex flex-col pb-16">
    <div v-if="!authStore.ready" class="flex-1 flex items-center justify-center min-h-screen">
      <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
    <template v-else>
      <router-view />
      <AppNav v-if="authStore.user" />
    </template>
  </div>
  <UpdatePrompt />
</template>
