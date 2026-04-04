import Link from 'next/link'

type Item = { nombre: string; descripcion_en: string; scope: string }

const COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
]

function Card({ item }: { item: Item }) {
  const initials = item.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = COLORS[item.nombre.charCodeAt(0) % COLORS.length]

  return (
    <div
      className="w-[256px] bg-white rounded-xl p-4 flex flex-col gap-2.5 shrink-0"
      style={{ border: '1px solid #E8E2D9' }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800 truncate">{item.nombre}</p>
          <span className="text-xs text-stone-400">
            {item.scope === 'remote' ? '☁ Remote' : '⬡ Local'}
          </span>
        </div>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{item.descripcion_en}</p>
    </div>
  )
}

export default function HeroCards({
  row1, row2, row3, total,
}: {
  row1: Item[]
  row2: Item[]
  row3: Item[]
  total: number
}) {
  return (
    <div className="relative overflow-hidden">
      {/* Background decorative lines */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full pointer-events-none"
        viewBox="0 0 1200 380"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <path d="M600,380 Q520,260 80,180 Q0,140 0,60"    stroke="#EA580C" strokeOpacity="0.11" strokeWidth="1.5"/>
        <path d="M600,380 Q545,240 200,140 Q90,80 20,0"   stroke="#EA580C" strokeOpacity="0.09" strokeWidth="1.5"/>
        <path d="M600,380 Q568,220 360,110 Q290,55 310,0" stroke="#EA580C" strokeOpacity="0.12" strokeWidth="1.5"/>
        <path d="M600,380 Q592,190 510,90 Q488,40 490,0"  stroke="#EA580C" strokeOpacity="0.10" strokeWidth="1.5"/>
        <path d="M600,380 Q600,180 600,80 Q600,30 600,0"  stroke="#EA580C" strokeOpacity="0.14" strokeWidth="2"/>
        <path d="M600,380 Q608,190 690,90 Q712,40 710,0"  stroke="#EA580C" strokeOpacity="0.10" strokeWidth="1.5"/>
        <path d="M600,380 Q632,220 840,110 Q910,55 890,0" stroke="#EA580C" strokeOpacity="0.12" strokeWidth="1.5"/>
        <path d="M600,380 Q655,240 1000,140 Q1110,80 1180,0" stroke="#EA580C" strokeOpacity="0.09" strokeWidth="1.5"/>
        <path d="M600,380 Q680,260 1120,180 Q1200,140 1200,60" stroke="#EA580C" strokeOpacity="0.11" strokeWidth="1.5"/>
      </svg>

      {/* 3 filas de cards con fade lateral */}
      <div
        className="relative flex flex-col gap-3"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        }}
      >
        <div className="flex gap-3">
          {row1.map((item, i) => <Card key={i} item={item} />)}
        </div>
        <div className="flex gap-3 -ml-[148px]">
          {row2.map((item, i) => <Card key={i} item={item} />)}
        </div>
        <div className="flex gap-3 -ml-[74px]">
          {row3.map((item, i) => <Card key={i} item={item} />)}
        </div>
      </div>

      {/* Botones CTA */}
      <div className="relative flex justify-center gap-3 mt-8">
        <Link
          href="/mcps"
          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors shadow-sm"
        >
          Ver {total}+ MCPs
        </Link>
        <Link
          href="/submit"
          className="border border-stone-300 bg-white text-stone-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          Publicar MCP
        </Link>
      </div>
    </div>
  )
}
