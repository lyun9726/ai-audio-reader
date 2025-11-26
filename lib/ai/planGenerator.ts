/**
 * Study Plan Generator
 * Creates day-by-day reading plans with goals and checkpoints
 */

import type { ReaderBlock } from '@/lib/types'

/**
 * Study day structure
 */
export interface StudyDay {
  day: number
  date: string
  title: string
  goals: string[]
  blocks: number[] // Block indices to read
  estimatedMinutes: number
  checkpoints: string[]
  completed?: boolean
  completedAt?: number
}

/**
 * Study plan structure
 */
export interface StudyPlan {
  id: string
  bookId: string
  totalDays: number
  startDate: string
  endDate: string
  days: StudyDay[]
  totalBlocks: number
  totalMinutes: number
  createdAt: number
}

/**
 * Generate study plan from blocks
 */
export async function generateStudyPlan(
  bookId: string,
  blocks: ReaderBlock[],
  days: number = 7,
  useLLM: boolean = false
): Promise<StudyPlan> {
  if (useLLM) {
    // TODO: Integrate with actual LLM when API key is available
    return generateMockStudyPlan(bookId, blocks, days)
  }

  return generateMockStudyPlan(bookId, blocks, days)
}

/**
 * Generate deterministic mock study plan
 */
function generateMockStudyPlan(
  bookId: string,
  blocks: ReaderBlock[],
  days: number
): StudyPlan {
  const textBlocks = blocks.filter(b => b.type === 'paragraph' && b.text)
  const blocksPerDay = Math.ceil(textBlocks.length / days)

  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + days - 1)

  const studyDays: StudyDay[] = []
  let totalMinutes = 0

  for (let i = 0; i < days; i++) {
    const dayDate = new Date(startDate)
    dayDate.setDate(dayDate.getDate() + i)

    const startBlock = i * blocksPerDay
    const endBlock = Math.min((i + 1) * blocksPerDay, textBlocks.length)
    const dayBlocks = Array.from(
      { length: endBlock - startBlock },
      (_, idx) => startBlock + idx
    )

    // Calculate estimated reading time (200 words per minute)
    const wordsInDay = dayBlocks.reduce((sum, blockIdx) => {
      const block = textBlocks[blockIdx]
      const words = block.text?.split(/\s+/).length || 0
      return sum + words
    }, 0)

    const estimatedMinutes = Math.ceil(wordsInDay / 200)
    totalMinutes += estimatedMinutes

    const day: StudyDay = {
      day: i + 1,
      date: dayDate.toISOString().split('T')[0],
      title: `Day ${i + 1}: DEMO Reading Session`,
      goals: [
        `Read ${dayBlocks.length} sections`,
        `Complete ${estimatedMinutes} minutes of reading`,
        `Review key concepts`,
      ],
      blocks: dayBlocks,
      estimatedMinutes,
      checkpoints: [
        `Understand main concepts from sections ${startBlock + 1}-${endBlock}`,
        `Take notes on key points`,
        `Complete quiz questions`,
      ],
      completed: false,
    }

    studyDays.push(day)
  }

  return {
    id: `plan-${bookId}-${Date.now()}`,
    bookId,
    totalDays: days,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days: studyDays,
    totalBlocks: textBlocks.length,
    totalMinutes,
    createdAt: Date.now(),
  }
}

/**
 * Mark day as completed
 */
export function markDayCompleted(plan: StudyPlan, dayNumber: number): StudyPlan {
  const updatedDays = plan.days.map(day => {
    if (day.day === dayNumber) {
      return {
        ...day,
        completed: true,
        completedAt: Date.now(),
      }
    }
    return day
  })

  return {
    ...plan,
    days: updatedDays,
  }
}

/**
 * Get plan progress
 */
export function getPlanProgress(plan: StudyPlan): {
  completedDays: number
  totalDays: number
  percentage: number
  daysRemaining: number
  onTrack: boolean
} {
  const completedDays = plan.days.filter(d => d.completed).length
  const percentage = Math.round((completedDays / plan.totalDays) * 100)

  const today = new Date().toISOString().split('T')[0]
  const startDate = new Date(plan.startDate)
  const currentDate = new Date(today)

  const daysSinceStart = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  )

  const expectedDays = Math.min(daysSinceStart + 1, plan.totalDays)
  const onTrack = completedDays >= expectedDays

  return {
    completedDays,
    totalDays: plan.totalDays,
    percentage,
    daysRemaining: plan.totalDays - completedDays,
    onTrack,
  }
}

/**
 * Get current day to read
 */
export function getCurrentDay(plan: StudyPlan): StudyDay | null {
  const today = new Date().toISOString().split('T')[0]

  // Find first incomplete day
  const incompleteDay = plan.days.find(d => !d.completed)
  if (incompleteDay) {
    return incompleteDay
  }

  // If all completed, return null
  return null
}

/**
 * Export plan to JSON
 */
export function exportPlanToJSON(plan: StudyPlan): string {
  return JSON.stringify(plan, null, 2)
}

/**
 * Import plan from JSON
 */
export function importPlanFromJSON(json: string): StudyPlan {
  return JSON.parse(json)
}

/**
 * Export plan to CSV
 */
export function exportPlanToCSV(plan: StudyPlan): string {
  const headers = ['Day', 'Date', 'Title', 'Goals', 'Blocks', 'Minutes', 'Completed']
  const rows = plan.days.map(day => [
    day.day.toString(),
    day.date,
    `"${day.title}"`,
    `"${day.goals.join('; ')}"`,
    day.blocks.length.toString(),
    day.estimatedMinutes.toString(),
    day.completed ? 'Yes' : 'No',
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}
