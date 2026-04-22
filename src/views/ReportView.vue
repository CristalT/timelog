<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '../stores/entries'
import EntryCard from '../components/EntryCard.vue'

const entriesStore = useEntriesStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
}

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value - 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })
)

const entries = computed(() => entriesStore.entriesByMonth(currentYear.value, currentMonth.value))
const summary = computed(() => entriesStore.summaryForMonth(currentYear.value, currentMonth.value))

function fmtHours(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, '0')}m`
}

function fmtMoney(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const copied = ref(false)

function drawCell(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  align: 'left' | 'right',
  padding: number,
) {
  ctx.textBaseline = 'middle'
  if (align === 'right') {
    ctx.textAlign = 'right'
    ctx.fillText(text, x + w - padding, y + h / 2)
  } else {
    ctx.textAlign = 'left'
    ctx.fillText(text, x + padding, y + h / 2)
  }
  ctx.textAlign = 'left'
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function buildReportImage(): Promise<Blob> {
  return new Promise((resolve) => {
    const label = new Date(currentYear.value, currentMonth.value - 1)
      .toLocaleString('es-AR', { month: 'long', year: 'numeric' })

    const rows = entries.value.map((e) => {
      const date = new Date(e.checkIn).toLocaleString('es-AR', { day: '2-digit', month: '2-digit' })
      const timeIn = new Date(e.checkIn).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })
      const timeOut = new Date(e.checkOut).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })
      const rate = fmtMoney(e.amount / e.hoursWorked)
      return [date, `${timeIn} → ${timeOut}`, fmtHours(e.hoursWorked), `${rate}/h`, fmtMoney(e.amount)]
    })

    const { totalHours, totalAmount } = summary.value
    const headers = ['Fecha', 'Horario', 'Horas', 'Tarifa', 'Total']

    const scale = Math.max(window.devicePixelRatio || 1, 2)
    const PAD = 24
    const ROW_H = 36
    const HEADER_H = 40
    const TITLE_H = 52
    const TOTAL_H = 44
    const colWidths = [64, 148, 80, 110, 110]
    const tableW = colWidths.reduce((a, b) => a + b, 0)
    const canvasW = tableW + PAD * 2
    const canvasH = TITLE_H + HEADER_H + rows.length * ROW_H + TOTAL_H + PAD * 2

    const canvas = document.createElement('canvas')
    canvas.width = canvasW * scale
    canvas.height = canvasH * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, canvasW, canvasH)

    ctx.fillStyle = '#ffffff'
    roundRect(ctx, PAD - 4, PAD - 4, tableW + 8, canvasH - PAD * 2 + 8, 12)
    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0

    const font = `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    const titleY = PAD + TITLE_H / 2 - 4
    ctx.font = `bold 15px ${font}`
    ctx.fillStyle = '#1e293b'
    ctx.textBaseline = 'middle'
    ctx.fillText('Reporte de horas', PAD + 8, titleY)
    ctx.font = `13px ${font}`
    ctx.fillStyle = '#64748b'
    ctx.fillText(label.charAt(0).toUpperCase() + label.slice(1), PAD + 8, titleY + 20)

    const headerY = PAD + TITLE_H
    ctx.fillStyle = '#eef2ff'
    ctx.fillRect(PAD, headerY, tableW, HEADER_H)

    ctx.font = `bold 11px ${font}`
    ctx.fillStyle = '#4338ca'
    let cx = PAD
    headers.forEach((h, i) => {
      drawCell(ctx, h, cx, headerY, colWidths[i], HEADER_H, i >= 2 ? 'right' : 'left', 8)
      cx += colWidths[i]
    })

    rows.forEach((row, ri) => {
      const ry = headerY + HEADER_H + ri * ROW_H
      ctx.fillStyle = ri % 2 === 0 ? '#ffffff' : '#f8fafc'
      ctx.fillRect(PAD, ry, tableW, ROW_H)
      ctx.font = `12px ${font}`
      ctx.fillStyle = '#334155'
      cx = PAD
      row.forEach((cell, ci) => {
        drawCell(ctx, cell, cx, ry, colWidths[ci], ROW_H, ci >= 2 ? 'right' : 'left', 8)
        cx += colWidths[ci]
      })
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(PAD, ry + ROW_H)
      ctx.lineTo(PAD + tableW, ry + ROW_H)
      ctx.stroke()
    })

    const totalY = headerY + HEADER_H + rows.length * ROW_H
    ctx.fillStyle = '#1e1b4b'
    ctx.fillRect(PAD, totalY, tableW, TOTAL_H)

    ctx.font = `bold 12px ${font}`
    ctx.fillStyle = '#ffffff'
    drawCell(ctx, 'Total', PAD, totalY, colWidths[0] + colWidths[1] + colWidths[2], TOTAL_H, 'left', 8)
    drawCell(ctx, fmtMoney(totalAmount), PAD + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], totalY, colWidths[4], TOTAL_H, 'right', 8)
    ctx.font = `12px ${font}`
    ctx.fillStyle = '#a5b4fc'
    drawCell(ctx, fmtHours(totalHours), PAD + colWidths[0] + colWidths[1] + colWidths[2], totalY, colWidths[3], TOTAL_H, 'right', 8)

    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}

async function shareReport() {
  const blob = await buildReportImage()
  const file = new File([blob], 'reporte.png', { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte.png'
    a.click()
    URL.revokeObjectURL(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <main class="p-4 w-full mx-auto">
    <div class="flex items-center justify-between mb-4 mt-2">
      <h1 class="text-xl font-bold text-gray-900">Reporte mensual</h1>
      <button
        v-if="entries.length > 0"
        class="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        @click="shareReport"
      >
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span :class="copied ? 'text-green-500' : ''">{{ copied ? 'Descargado' : 'Compartir' }}</span>
      </button>
    </div>

    <div class="flex items-center justify-between mb-4">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        @click="prevMonth"
      >&#8249;</button>
      <span class="text-sm font-semibold text-gray-800 capitalize">{{ monthLabel }}</span>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        @click="nextMonth"
      >&#8250;</button>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-5">
      <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
        <p class="text-xs text-gray-400">Horas</p>
        <p class="text-xl font-bold text-indigo-600">{{ fmtHours(summary.totalHours) }}</p>
      </div>
      <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
        <p class="text-xs text-gray-400">Total</p>
        <p class="text-xl font-bold text-green-600">{{ fmtMoney(summary.totalAmount) }}</p>
      </div>
    </div>

    <div v-if="entries.length === 0" class="text-center text-sm text-gray-400 py-12">
      Sin entradas en este mes
    </div>

    <div v-else class="space-y-3">
      <EntryCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        @delete="entriesStore.deleteEntry($event)"
      />
    </div>
  </main>
</template>
