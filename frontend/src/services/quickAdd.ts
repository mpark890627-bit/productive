import { getProjects } from '../api/projects'
import { createTag, getTags } from '../api/tags'
import { attachTagToTask, createTaskInProject } from '../api/tasks'
import { parseQuickAddInput } from '../utils/quickAddParser'

interface QuickAddResult {
  taskId: string
}

async function resolveTagId(tagName: string) {
  const normalized = tagName.trim()
  if (!normalized) {
    throw new Error('유효하지 않은 태그 이름입니다.')
  }

  const existingTags = await getTags(normalized)
  const exactMatch = existingTags.find(
    (tag) => tag.name.trim().toLowerCase() === normalized.toLowerCase(),
  )
  if (exactMatch) {
    return exactMatch.id
  }

  const created = await createTag(normalized)
  return created.id
}

export async function quickAddTask(rawInput: string): Promise<QuickAddResult> {
  const parsed = parseQuickAddInput(rawInput)
  const projectsPage = await getProjects({ page: 0, size: 200, sort: 'updatedAt,desc' })
  const project = projectsPage.content.find(
    (item) => item.name.trim().toLowerCase() === parsed.projectName.trim().toLowerCase(),
  )

  if (!project) {
    throw new Error(`프로젝트를 찾을 수 없습니다: ${parsed.projectName}`)
  }

  const task = await createTaskInProject(project.id, {
    title: parsed.title,
    description: null,
    status: 'TODO',
    priority: parsed.priority,
    dueDate: parsed.dueDate,
    assigneeUserId: null,
  })

  const uniqueTags = [...new Set(parsed.tags.map((tag) => tag.trim()).filter(Boolean))]
  for (const tagName of uniqueTags) {
    const tagId = await resolveTagId(tagName)
    await attachTagToTask(task.id, tagId)
  }

  return { taskId: task.id }
}
