import type { TaskPriority } from '../types/task'

export interface QuickAddParsedInput {
  projectName: string
  title: string
  tags: string[]
  dueDate: string | null
  priority: TaskPriority
}

function isValidIsoDate(value: string) {
  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  )
}

export function parseQuickAddInput(input: string): QuickAddParsedInput {
  const raw = input.trim()
  const slashIndex = raw.indexOf('/')

  if (slashIndex <= 0 || slashIndex === raw.length - 1) {
    throw new Error('형식: "프로젝트명 / 제목 #태그 due:YYYY-MM-DD p:high"')
  }

  const projectName = raw.slice(0, slashIndex).trim()
  let right = raw.slice(slashIndex + 1).trim()

  if (!projectName) {
    throw new Error('프로젝트명을 입력하세요.')
  }

  const tags = Array.from(right.matchAll(/(?:^|\s)#([^\s#]+)/g)).map((match) => match[1])
  right = right.replace(/(?:^|\s)#[^\s#]+/g, ' ').trim()

  const dueMatch = right.match(/(?:^|\s)due:(\d{4}-\d{2}-\d{2})(?=\s|$)/i)
  const dueDate = dueMatch ? dueMatch[1] : null
  if (dueDate && !isValidIsoDate(dueDate)) {
    throw new Error('마감일 형식이 올바르지 않습니다. 예: due:2026-03-01')
  }
  right = right.replace(/(?:^|\s)due:\d{4}-\d{2}-\d{2}(?=\s|$)/gi, ' ').trim()

  const priorityMatch = right.match(/(?:^|\s)p:(low|medium|high)(?=\s|$)/i)
  const priority = priorityMatch ? priorityMatch[1].toUpperCase() : 'MEDIUM'
  right = right.replace(/(?:^|\s)p:(low|medium|high)(?=\s|$)/gi, ' ').trim()

  const title = right.trim()
  if (!title) {
    throw new Error('태스크 제목이 필요합니다.')
  }

  return {
    projectName,
    title,
    tags,
    dueDate,
    priority: priority as TaskPriority,
  }
}
