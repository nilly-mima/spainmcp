import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const ADJECTIVES = [
  'amber', 'bold', 'calm', 'clever', 'curious',
  'daring', 'eager', 'fierce', 'gentle', 'happy',
  'jolly', 'keen', 'lively', 'lucky', 'mighty',
  'noble', 'proud', 'quiet', 'rapid', 'swift',
]

const ANIMALS = [
  'badger', 'bear', 'crane', 'crow', 'deer',
  'eagle', 'falcon', 'fox', 'hawk', 'heron',
  'jaguar', 'lynx', 'moose', 'otter', 'owl',
  'panda', 'raven', 'robin', 'tiger', 'wolf',
]

function generateName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num = Math.floor(Math.random() * 90) + 10
  return `${adj}-${animal}-${num}`
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  let name: string
  let attempts = 0

  while (attempts < 5) {
    name = generateName()
    const { data, error } = await supabase
      .from('namespaces')
      .insert({ name, owner_id: auth.userId })
      .select('name, created_at')
      .single()

    if (!error && data) {
      return NextResponse.json(
        { name: data.name, createdAt: data.created_at },
        { status: 201 }
      )
    }

    if (error?.code !== '23505') {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create namespace' }, { status: 500 })
    }

    attempts++
  }

  return NextResponse.json(
    { error: 'Could not generate a unique name, please try again' },
    { status: 409 }
  )
}
