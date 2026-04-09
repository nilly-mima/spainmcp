"use client"

import { useState } from "react"

type Mode = "github" | "upload"
type State = "idle" | "loading" | "success" | "error"

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

export default function PublishSkillPage() {
  const [mode, setMode] = useState<Mode>("github")
  const [ns, setNs] = useState("")
  const [slug, setSlug] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const splitLayout = "grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-56px)] -mt-2 -mb-8"
  const leftPanel = "flex flex-col px-8 py-12 lg:px-16 border-r border-stone-200 dark:border-stone-800"

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setState("loading")
    setErrorMsg("")

    try {
      const body: Record<string, string> = { namespace: ns, slug }
      if (mode === "github") {
        body.githubUrl = githubUrl
      }

      const res = await fetch("/api/catalog/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al publicar")
      }

      setState("success")
    } catch (err: unknown) {
      setState("error")
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Skill publicada</h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Tu skill <strong>@{ns}/{slug}</strong> ya esta disponible en el directorio de SpainMCP.
          </p>
          <a href="/guias" className="text-sm text-blue-600 hover:underline">← Ver directorio de Skills</a>
        </div>
      </div>
    )
  }

  return (
    <div className={splitLayout}>
      {/* IZQUIERDA — Formulario */}
      <div className={leftPanel}>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">Publicar Skill</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">
          Importa una skill desde GitHub o sube un bundle para publicarla en SpainMCP.
        </p>

        <form onSubmit={handlePublish}>
          <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-6 bg-white dark:bg-stone-900 flex flex-col gap-5">
            {/* Namespace / Slug */}
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Namespace <span className="text-red-500">*</span>
                <span className="mx-2 text-stone-400">/</span>
                Slug <span className="text-red-500">*</span>
              </p>
              <div className="flex items-stretch gap-0">
                <input type="text" required value={ns}
                  onChange={e => setNs(e.target.value.replace(/[^a-z0-9_-]/g, "").toLowerCase())}
                  placeholder="mi-namespace" className={inputClass + " rounded-r-none border-r-0"} />
                <span className="flex items-center px-2 border-y border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-400 text-sm">/</span>
                <input type="text" required value={slug}
                  onChange={e => setSlug(e.target.value.replace(/[^a-z0-9_-]/g, "").toLowerCase())}
                  placeholder="slug" className={inputClass + " rounded-l-none border-l-0 pr-8"} />
                {ns && slug && (
                  <span className="flex items-center -ml-7 text-green-500 z-10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1.5">Los namespaces y slugs cortos son mas faciles de recordar.</p>
            </div>

            {/* Selector de modo */}
            <div className="flex gap-2">
              <button type="button" onClick={() => setMode("github")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "github" ? "bg-blue-500 text-white" : "border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                URL de GitHub
              </button>
              <button type="button" onClick={() => setMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "upload" ? "bg-blue-500 text-white" : "border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Subir archivo
              </button>
            </div>

            {/* Input URL de GitHub */}
            {mode === "github" && (
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  URL de GitHub <span className="text-red-500">*</span>
                </p>
                <input type="url" required value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/.../ruta/a/skill"
                  className={inputClass} />
                <p className="text-xs text-stone-400 mt-1.5">Enlace a la carpeta que contiene tu archivo SKILL.md</p>
              </div>
            )}

            {/* Input subir archivo */}
            {mode === "upload" && (
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Bundle de la skill <span className="text-red-500">*</span>
                </p>
                <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400 mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span className="text-sm text-stone-400">Arrastra tu .zip aqui o haz clic para buscar</span>
                  <input type="file" accept=".zip" className="hidden" />
                </label>
                <p className="text-xs text-stone-400 mt-1.5">Archivo ZIP con SKILL.md y directorios opcionales</p>
              </div>
            )}

            {state === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}

            <button type="submit" disabled={state === "loading"}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors self-end">
              {state === "loading" ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>

      {/* DERECHA — Referencia SKILL.md */}
      <div className="hidden lg:flex flex-col px-12 py-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200">SKILL.md</h2>
          </div>
          <span className="text-xs text-stone-400 border border-stone-200 dark:border-stone-700 rounded px-2 py-1">Vista previa</span>
        </div>

        <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 bg-white/50 dark:bg-stone-900/50 font-mono text-sm leading-relaxed text-stone-500 dark:text-stone-400 whitespace-pre-wrap">
          <p className="text-stone-400 dark:text-stone-500 mb-2">YAML Frontmatter (obligatorio)</p>
          <div className="mb-4">
            <span className="text-stone-400">---</span>{"\n"}
            <span className="text-blue-600 font-semibold">name</span>: foo-bar  <span className="text-stone-400">← minusculas, solo guiones, max 64 chars</span>{"\n"}
            <span className="text-blue-600 font-semibold">description</span>: Hace foo y bar para el usuario.  <span className="text-stone-400">← max 1024 chars</span>{"\n"}
            {"\n"}
            <span className="text-stone-400"># Campos opcionales</span>{"\n"}
            license: MIT{"\n"}
            metadata:{"\n"}
            {"  "}author: tu-org{"\n"}
            <span className="text-stone-400">---</span>
          </div>

          <p className="text-stone-400 dark:text-stone-500 mb-2">Cuerpo Markdown (instrucciones de la skill)</p>
          <div className="mb-4">
            Eres un experto en foo. Ayuda a los usuarios con tareas de bar.{"\n"}
            {"\n"}
            <span className="font-semibold text-stone-600 dark:text-stone-300">## Cuando activarse</span>{"\n"}
            {"- "}El usuario pregunta sobre foo o bar{"\n"}
            {"- "}El usuario necesita ayuda con baz{"\n"}
            {"\n"}
            <span className="font-semibold text-stone-600 dark:text-stone-300">## Instrucciones</span>{"\n"}
            1. Primero, hacer foo{"\n"}
            2. Luego aplicar bar{"\n"}
            3. Devolver baz como resultado
          </div>

          <hr className="border-stone-200 dark:border-stone-700 my-4" />

          <p className="text-blue-600 dark:text-blue-500 mb-2">Directorios opcionales:</p>
          <div>
            <span className="font-semibold">scripts/</span> — codigo ejecutable que los agentes pueden usar{"\n"}
            <span className="font-semibold">references/</span> — documentacion adicional cargada bajo demanda{"\n"}
            <span className="font-semibold">assets/</span> — plantillas, imagenes, archivos de datos
          </div>
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400 mt-4">
          <strong>Tu archivo SKILL.md se previsualizara aqui.</strong> El archivo debe seguir la{" "}
          <a href="https://agentskills.io/specification" target="_blank" className="text-blue-600 hover:underline">
            especificacion de Agent Skills ↗
          </a>
        </p>
      </div>
    </div>
  )
}
