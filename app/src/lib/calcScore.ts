type QuizRow = {
  sleep_schedule?: string | null
  cleanliness?: number | null
  social_level?: number | null
  smoker?: boolean | null
  pet_friendly?: boolean | null
  parties?: boolean | null
}

export function calcScore(a: QuizRow, b: QuizRow): number {
  let pts = 0, max = 0, w: number

  if (a.sleep_schedule && b.sleep_schedule) {
    w = 20; max += w
    if (a.sleep_schedule === b.sleep_schedule) pts += w
    else if (a.sleep_schedule === 'flexible' || b.sleep_schedule === 'flexible') pts += w * 0.75
    else pts += w * 0.40
  }
  if (a.cleanliness != null && b.cleanliness != null) {
    w = 20; max += w
    pts += Math.max(0, w - Math.abs(a.cleanliness - b.cleanliness) * (w / 4))
  }
  if (a.social_level != null && b.social_level != null) {
    w = 15; max += w
    pts += Math.max(0, w - Math.abs(a.social_level - b.social_level) * (w / 4))
  }
  if (a.smoker != null && b.smoker != null) {
    w = 20; max += w
    pts += a.smoker === b.smoker ? w : w * 0.30
  }
  if (a.pet_friendly != null && b.pet_friendly != null) {
    w = 15; max += w
    pts += a.pet_friendly === b.pet_friendly ? w : w * 0.60
  }
  if (a.parties != null && b.parties != null) {
    w = 10; max += w
    pts += a.parties === b.parties ? w : w * 0.30
  }

  if (max === 0) return 70
  return Math.min(100, Math.max(0, Math.round((pts / max) * 100)))
}
