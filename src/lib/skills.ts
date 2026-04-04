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
