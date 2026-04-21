<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  loading.value = true
  try {
    await authStore.signInWithGoogle()
  } catch (e: any) {
    if (e?.code === 'auth/not-allowed') {
      error.value = 'Tu cuenta no está habilitada. Pedile acceso a un familiar.'
    } else if (e?.code !== 'auth/popup-closed-by-user') {
      error.value = 'No se pudo iniciar sesión. Intentá de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-root">
    <!-- Background decoration -->
    <div class="bg-blob blob-1" />
    <div class="bg-blob blob-2" />

    <main class="login-main">
      <!-- Mark -->
      <div class="brand-mark">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2"/>
          <line x1="24" y1="10" x2="24" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="24" y1="24" x2="33" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
          <!-- tick marks -->
          <line x1="24" y1="4" x2="24" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="24" y1="41" x2="24" y2="44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="4" y1="24" x2="7" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="41" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Wordmark -->
      <h1 class="wordmark">Timelog</h1>
      <p class="subtitle">Registro de horas compartido<br>entre tu familia</p>

      <!-- Divider -->
      <div class="divider" />

      <!-- Google button -->
      <button
        class="google-btn"
        :class="{ 'google-btn--loading': loading }"
        :disabled="loading"
        @click="login"
      >
        <span class="google-btn__inner">
          <svg v-if="!loading" class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <svg v-else class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#d1d5db" stroke-width="3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span>{{ loading ? 'Iniciando sesión…' : 'Continuar con Google' }}</span>
        </span>
      </button>

      <!-- Error -->
      <p v-if="error" class="error-msg">{{ error }}</p>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

.login-root {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f6f2;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

/* Soft background blobs */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.blob-1 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #c7d2fe 0%, transparent 70%);
  top: -80px;
  right: -80px;
  opacity: 0.55;
}
.blob-2 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, #fde68a 0%, transparent 70%);
  bottom: -60px;
  left: -60px;
  opacity: 0.4;
}

.login-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 360px;
  padding: 48px 32px 56px;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.5s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Clock mark */
.brand-mark {
  width: 56px;
  height: 56px;
  color: #4338ca;
  margin-bottom: 20px;
}
.brand-mark svg {
  width: 100%;
  height: 100%;
}

/* Typography */
.wordmark {
  font-family: 'DM Serif Display', serif;
  font-size: 42px;
  font-weight: 400;
  letter-spacing: -1px;
  color: #1a1a2e;
  margin: 0 0 10px;
  line-height: 1;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
}

.divider {
  width: 32px;
  height: 2px;
  background: #e0dfd8;
  border-radius: 1px;
  margin: 32px 0;
}

/* Google button */
.google-btn {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
  outline: none;
}
.google-btn:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.07);
  border-color: #d1d5db;
  transform: translateY(-1px);
}
.google-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.google-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.google-btn__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}
.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.spinner {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-msg {
  margin-top: 14px;
  font-size: 13px;
  color: #dc2626;
  text-align: center;
}
</style>
