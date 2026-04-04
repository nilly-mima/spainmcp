"""
sync_awesome.py — Importa MCPs desde awesome-mcp-servers

Descarga el README.md del repo punkpeye/awesome-mcp-servers,
parsea todas las entradas y genera src/data/imported.json.

Uso: py scripts/sync_awesome.py
"""

import re
import json
import urllib.request
from pathlib import Path

README_URL = "https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md"
OUTPUT = Path(__file__).parent.parent / "src" / "data" / "imported.json"

# Mapeo de secciones del README → categorías nuestras
SECTION_TO_CATEGORY = {
    "aggregators": "agregadores",
    "art & culture": "arte",
    "browser automation": "automatizacion",
    "cloud platforms": "cloud",
    "code execution": "desarrollo",
    "command line": "desarrollo",
    "communication": "comunicacion",
    "customer data": "datos",
    "databases": "bases-de-datos",
    "data platforms": "datos",
    "data science": "datos",
    "developer tools": "desarrollo",
    "document processing": "documentacion",
    "education": "educacion",
    "entertainment": "entretenimiento",
    "file systems": "archivos",
    "finance": "finanzas",
    "gaming": "gaming",
    "geospatial": "datos",
    "health": "salud",
    "home automation": "automatizacion",
    "image and video": "multimedia",
    "infrastructure": "infraestructura",
    "knowledge & memory": "productividad",
    "language": "lenguaje",
    "legal": "legal",
    "location": "datos",
    "marketing": "marketing",
    "monitoring": "desarrollo",
    "news": "noticias",
    "note taking": "productividad",
    "os automation": "automatizacion",
    "productivity": "productividad",
    "research": "investigacion",
    "search": "busqueda",
    "security": "seguridad",
    "social media": "redes-sociales",
    "storage": "archivos",
    "time & scheduling": "productividad",
    "travel": "viajes",
    "version control": "desarrollo",
    "web scraping": "scraping",
    "other": "otros",
}

EMOJI_LANG = {"🐍": "python", "📇": "typescript", "🏎️": "go", "🦀": "rust",
              "#️⃣": "csharp", "☕": "java", "🌊": "cpp", "💎": "ruby"}
EMOJI_SCOPE = {"☁️": "cloud", "🏠": "local", "📟": "embedded"}


def descargar_readme() -> str:
    print(f"Descargando {README_URL}...")
    with urllib.request.urlopen(README_URL, timeout=30) as r:
        return r.read().decode("utf-8")


def parsear_seccion(linea: str) -> str | None:
    """Extrae nombre de sección de un header markdown."""
    m = re.match(r'^#{2,4}\s+(.+)', linea)
    if m:
        return m.group(1).strip()
    return None


def parsear_entrada(linea: str, seccion: str) -> dict | None:
    """
    Parsea una línea de entrada MCP:
    - [nombre](url) emojis - descripción
    """
    m = re.match(r'^\s*-\s+\[([^\]]+)\]\(([^)]+)\)\s*(.*)', linea)
    if not m:
        return None

    nombre_raw = m.group(1).strip()
    url = m.group(2).strip()
    resto = m.group(3).strip()

    # Limpiar badges de glama ([![...](...)](url))
    resto = re.sub(r'\[!\[.*?\]\(.*?\)\]\(.*?\)', '', resto).strip()

    # Extraer emojis
    lenguaje = next((v for k, v in EMOJI_LANG.items() if k in resto), None)
    scope = next((v for k, v in EMOJI_SCOPE.items() if k in resto), "cloud")

    # Limpiar emojis de la descripción
    all_emojis = list(EMOJI_LANG.keys()) + list(EMOJI_SCOPE.keys()) + ["🎖️", "🍎", "🪟", "🐧"]
    descripcion = resto
    for e in all_emojis:
        descripcion = descripcion.replace(e, "")
    descripcion = re.sub(r'\s*-\s*', '', descripcion, count=1).strip()
    descripcion = re.sub(r'\s+', ' ', descripcion)

    if not descripcion or len(descripcion) < 5:
        return None

    # Categoría basada en sección
    seccion_lower = seccion.lower().strip()
    categoria = next(
        (v for k, v in SECTION_TO_CATEGORY.items() if k in seccion_lower),
        "otros"
    )

    # Generar ID limpio
    id_ = re.sub(r'[^a-z0-9-]', '-', nombre_raw.lower())
    id_ = re.sub(r'-+', '-', id_).strip('-')

    return {
        "id": id_,
        "nombre": nombre_raw,
        "github_url": url,
        "descripcion_en": descripcion,
        "categoria": categoria,
        "seccion": seccion,
        "lenguaje": lenguaje,
        "scope": scope,
        "fuente": "awesome-mcp-servers",
    }


def parsear_readme(contenido: str) -> list[dict]:
    mcps = []
    seccion_actual = "Other"
    en_server_section = False

    for linea in contenido.split("\n"):
        # Detectar inicio de la sección principal de servidores
        if "## Server Implementations" in linea:
            en_server_section = True
            continue
        if "## Frameworks" in linea or "## Tips" in linea:
            en_server_section = False

        # Actualizar sección actual
        nueva_seccion = parsear_seccion(linea)
        if nueva_seccion and en_server_section:
            seccion_actual = nueva_seccion
            continue

        # Parsear entradas solo dentro de la sección de servidores
        if en_server_section and linea.strip().startswith("- ["):
            entrada = parsear_entrada(linea, seccion_actual)
            if entrada:
                mcps.append(entrada)

    return mcps


def deduplicar(mcps: list[dict]) -> list[dict]:
    """Elimina duplicados por URL."""
    vistos = set()
    resultado = []
    for m in mcps:
        if m["github_url"] not in vistos:
            vistos.add(m["github_url"])
            resultado.append(m)
    return resultado


def main():
    contenido = descargar_readme()
    mcps = parsear_readme(contenido)
    mcps = deduplicar(mcps)

    print(f"MCPs encontrados: {len(mcps)}")

    # Estadísticas por categoría
    from collections import Counter
    cats = Counter(m["categoria"] for m in mcps)
    print("\nPor categoría:")
    for cat, n in cats.most_common(15):
        print(f"  {cat}: {n}")

    # Guardar
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump({"total": len(mcps), "mcps": mcps}, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Guardado en {OUTPUT}")


if __name__ == "__main__":
    main()
