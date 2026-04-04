'use client'

type Item = { nombre: string; descripcion_en: string; scope: string }

const COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]

function MarqueeCard({ item }: { item: Item }) {
  const initials = item.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = COLORS[item.nombre.charCodeAt(0) % COLORS.length]

  return (
    <div
      className="w-[210px] bg-white rounded-xl p-3.5 flex flex-col gap-2 shrink-0"
      style={{ border: '1px solid #E8E2D9' }}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-800 truncate">{item.nombre}</p>
          <span className="text-[10px] text-stone-400">
            {item.scope === 'remote' ? '☁ Remote' : '⬡ Local'}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">{item.descripcion_en}</p>
    </div>
  )
}

export default function MarqueeMcps({ row1, row2 }: { row1: Item[]; row2: Item[] }) {
  const d1 = [...row1, ...row1]
  const d2 = [...row2, ...row2]

  return (
    <div
      className="flex flex-col gap-3 overflow-hidden py-1"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div className="flex gap-3 animate-marquee">
        {d1.map((item, i) => <MarqueeCard key={i} item={item} />)}
      </div>
      <div className="flex gap-3 animate-marquee-reverse">
        {d2.map((item, i) => <MarqueeCard key={i} item={item} />)}
      </div>
    </div>
  )
}
