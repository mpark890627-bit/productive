<template>
  <section class="calendar-view">
    <v-card class="header-card" rounded="lg" elevation="1">
      <div>
        <h2>Calendar</h2>
        <p>프로젝트별 일정(태스크 마감일)을 한 눈에 확인합니다.</p>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" prepend-icon="mdi-chevron-left" @click="moveMonth(-1)">이전 달</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-chevron-right" @click="moveMonth(1)">다음 달</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadCalendar">새로고침</v-btn>
      </div>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <v-card rounded="lg" elevation="1" class="month-summary">
      <div class="summary-row">
        <div>
          <h3>{{ monthLabel }}</h3>
          <p>총 {{ events.length }}건 일정</p>
        </div>
        <div class="chips">
          <v-chip color="error" variant="tonal">연체 {{ overdueCount }}</v-chip>
          <v-chip color="warning" variant="tonal">오늘~3일 {{ dueSoonCount }}</v-chip>
        </div>
      </div>
    </v-card>

    <section class="content-grid">
      <v-card rounded="lg" elevation="1" class="date-card">
        <v-card-text>
          <v-date-picker
            v-model="selectedDate"
            :title="monthLabel"
            color="primary"
            :events="eventDates"
            event-color="primary"
            @update:model-value="onDateChanged"
          />
        </v-card-text>
      </v-card>

      <v-card rounded="lg" elevation="1" class="schedule-card">
        <v-card-title class="pt-5 px-5">선택일 일정: {{ selectedDate }}</v-card-title>
        <v-card-text class="px-5 pb-5">
          <v-skeleton-loader v-if="loading" type="list-item-three-line@4" />
          <EmptyState
            v-else-if="selectedDateEvents.length === 0"
            title="일정이 없습니다"
            description="선택한 날짜에는 마감 태스크가 없습니다."
            icon="mdi-calendar-blank-outline"
          />
          <v-list v-else lines="two">
            <v-list-item v-for="event in selectedDateEvents" :key="event.id" rounded="lg" class="event-item">
              <template #title>
                <div class="title-row">
                  <span>{{ event.title }}</span>
                  <v-chip size="small" variant="outlined">{{ event.priority }}</v-chip>
                </div>
              </template>
              <template #subtitle>
                <p class="subtitle">
                  {{ event.projectName }} · {{ event.status }}
                </p>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { extractErrorMessage } from '../../api/apiClient'
import { getProjects } from '../../api/projects'
import { getProjectTasks } from '../../api/tasks'
import EmptyState from '../../components/common/EmptyState.vue'
import type { TaskItem } from '../../types/task'

interface CalendarEvent extends TaskItem {
  projectName: string
}

const loading = ref(false)
const errorMessage = ref('')
const events = ref<CalendarEvent[]>([])

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const currentMonth = ref(new Date())
const selectedDate = ref(formatLocalDate(new Date()))

const monthStart = computed(() => {
  const d = new Date(currentMonth.value)
  d.setDate(1)
  return d
})

const monthEnd = computed(() => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1, 0)
  return d
})

const monthLabel = computed(() =>
  monthStart.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
)

const selectedDateEvents = computed(() =>
  events.value
    .filter((event) => event.dueDate === selectedDate.value)
    .sort((a, b) => a.title.localeCompare(b.title)),
)

const eventDates = computed(() => [...new Set(events.value.map((event) => event.dueDate).filter(Boolean))] as string[])

const overdueCount = computed(() => {
  const today = formatLocalDate(new Date())
  return events.value.filter((event) => event.dueDate && event.dueDate < today && event.status !== 'DONE').length
})

const dueSoonCount = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const plus3 = new Date(today)
  plus3.setDate(plus3.getDate() + 3)
  const from = formatLocalDate(today)
  const to = formatLocalDate(plus3)
  return events.value.filter((event) => event.dueDate && event.dueDate >= from && event.dueDate <= to).length
})

const onDateChanged = (value: unknown) => {
  if (typeof value === 'string') {
    selectedDate.value = value
    return
  }
  if (value instanceof Date) {
    selectedDate.value = formatLocalDate(value)
  }
}

const loadCalendar = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    events.value = []

    const projectsPage = await getProjects({ page: 0, size: 200, sort: 'name,asc' })
    const from = formatLocalDate(monthStart.value)
    const to = formatLocalDate(monthEnd.value)

    const projectTasks = await Promise.all(
      projectsPage.content.map(async (project) => {
        const page = await getProjectTasks(project.id, {
          page: 0,
          size: 300,
          sort: 'dueDate,asc',
          dueFrom: from,
          dueTo: to,
        })
        return page.content
          .filter((task) => task.dueDate)
          .map((task) => ({
            ...task,
            projectName: project.name,
          }))
      }),
    )

    events.value = projectTasks.flat()

    if (!events.value.some((event) => event.dueDate === selectedDate.value)) {
      selectedDate.value = eventDates.value[0] ?? from
    }
  } catch (error) {
    errorMessage.value = extractErrorMessage(error, '캘린더 데이터를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

const moveMonth = async (delta: number) => {
  const next = new Date(currentMonth.value)
  next.setMonth(next.getMonth() + delta, 1)
  currentMonth.value = next
  selectedDate.value = formatLocalDate(monthStart.value)
  await loadCalendar()
}

onMounted(loadCalendar)
</script>

<style scoped>
.calendar-view {
  display: grid;
  gap: 12px;
}

.header-card {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.header-card h2 {
  margin: 0;
}

.header-card p {
  margin: 2px 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.month-summary {
  padding: 14px 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.summary-row h3 {
  margin: 0;
}

.summary-row p {
  margin: 4px 0 0;
  color: #64748b;
}

.chips {
  display: flex;
  gap: 8px;
}

.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
}

.event-item {
  border: 1px solid rgba(var(--v-theme-outline), 0.18);
  border-radius: 10px;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.subtitle {
  margin: 4px 0 0;
  color: #475569;
}

@media (max-width: 1080px) {
  .header-card {
    flex-direction: column;
    align-items: stretch;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
