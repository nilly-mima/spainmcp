import fs from 'fs'
import path from 'path'

export interface Skill {
  id: string
  creator: string
  nombre: string
  descripcion: string
  categoria: string
  installs: number
  stars: number
  verified: boolean
  repo?: string
  skill_md?: string
  slug?: string
  author?: string
}

const SKILLS_FILE = path.join(process.cwd(), 'src/data/skills.json')

export function getAllSkills(): Skill[] {
  if (!fs.existsSync(SKILLS_FILE)) return []
  const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'))
  return data.skills || []
}

export function getSkillsTotal(): number {
  if (!fs.existsSync(SKILLS_FILE)) return 0
  const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'))
  return data.total || 0
}

export function getSkillById(id: string): Skill | null {
  const skills = getAllSkills()
  return skills.find(s => s.id === id) ?? null
}
