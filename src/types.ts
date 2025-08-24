export type Bindings = { DB: D1Database }

export type Category =
  | 'BloodBank'
  | 'Chemistry'
  | 'Hematology'
  | 'Microbiology'
  | 'Urinalysis'
  | 'Immunology'
  | 'LabOps'

export type Question = {
  id: number
  category: Category
  difficulty: number // 1-5
  stem: string
  options: string[] // 4 choices
  correct_index: number // 0-3
  explanation?: string | null
}

export type Session = {
  id: string
  started_at: string
  status: 'active' | 'completed'
  current_difficulty: number
  item_index: number // 0..99
  blueprint: Category[] // length 100
}
