"""
SpainMCP Server — FastMCP
Conecta Claude directamente al directorio SpainMCP.
Uso: py spainmcp_server.py
"""

import json
import os
from pathlib import Path
from typing import Optional

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    raise SystemExit("Instala fastmcp: pip install fastmcp")

# --- Config ---
DATA_DIR = Path(__file__).parent / "src" / "data" / "mcps"
API_BASE = os.getenv("SPAINMCP_API", "http://localhost:3000/api")

mcp = FastMCP("SpainMCP", instructions="Directorio de servidores MCP en español para España y LATAM.")


def _load_all() -> list[dict]:
    """Carga todos los MCPs desde los JSON locales."""
    mcps = []
    for f in DATA_DIR.glob("*.json"):
        try:
            mcps.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception:
            continue
    return sorted(mcps, key=lambda m: (not m.get("destacado", False), m.get("nombre", "")))


def _format_mcp(m: dict) -> str:
    """Formatea un MCP para presentación en Claude."""
    lines = [
        f"**{m['nombre']}** (id: `{m['id']}`)",
        f"{m['descripcion_corta']}",
        f"- Categorías: {', '.join(m.get('categoria', []))}",
        f"- Tools: {m.get('num_tools', '?')} · Gratuito: {'Sí' if m.get('gratuito') else 'No'}",
        f"- Instalación: `{m.get('instalacion_claude_code', m.get('instalacion_npx', ''))}`",
    ]
    if m.get("especifico_espana"):
        lines.append("- 🇪🇸 Específico para España")
    return "\n".join(lines)


@mcp.tool()
def listar_mcps(categoria: Optional[str] = None, solo_gratuitos: bool = False) -> str:
    """
    Lista todos los servidores MCP disponibles en SpainMCP.
    Parámetros opcionales: categoria (str), solo_gratuitos (bool).
    """
    mcps = _load_all()

    if categoria:
        mcps = [m for m in mcps if categoria.lower() in [c.lower() for c in m.get("categoria", [])]]
    if solo_gratuitos:
        mcps = [m for m in mcps if m.get("gratuito")]

    if not mcps:
        return "No se encontraron MCPs con esos filtros."

    resultado = [f"**{len(mcps)} servidores MCP encontrados:**\n"]
    for m in mcps:
        resultado.append(_format_mcp(m))
        resultado.append("")

    return "\n".join(resultado)


@mcp.tool()
def buscar_mcps(query: str) -> str:
    """
    Busca servidores MCP por nombre, descripción, tag o categoría.
    Ejemplo: buscar_mcps("github") o buscar_mcps("datos españa")
    """
    q = query.lower()
    mcps = _load_all()
    resultados = [
        m for m in mcps
        if q in m.get("nombre", "").lower()
        or q in m.get("descripcion_es", "").lower()
        or any(q in t for t in m.get("tags", []))
        or any(q in c for c in m.get("categoria", []))
    ]

    if not resultados:
        return f"No se encontraron MCPs para '{query}'. Prueba con términos como: github, datos, automatizacion, españa, productividad."

    resultado = [f"**{len(resultados)} resultado(s) para '{query}':**\n"]
    for m in resultados:
        resultado.append(_format_mcp(m))
        resultado.append("")

    return "\n".join(resultado)


@mcp.tool()
def detalle_mcp(id: str) -> str:
    """
    Devuelve información completa de un MCP: instalación, casos de uso, compatibilidad.
    Ejemplo: detalle_mcp("github-mcp")
    """
    f = DATA_DIR / f"{id}.json"
    if not f.exists():
        ids_disponibles = [p.stem for p in DATA_DIR.glob("*.json")]
        return f"MCP '{id}' no encontrado. IDs disponibles: {', '.join(ids_disponibles)}"

    m = json.loads(f.read_text(encoding="utf-8"))

    lines = [
        f"# {m['nombre']}",
        f"**Descripción:** {m['descripcion_es']}",
        "",
        "## Instalación en Claude Code",
        f"```bash\n{m.get('instalacion_claude_code', '')}\n```",
        "",
        "## Instalación con npx",
        f"```bash\n{m.get('instalacion_npx', '')}\n```",
    ]

    if m.get("variables_entorno"):
        lines += ["", "## Variables de entorno necesarias"]
        for v in m["variables_entorno"]:
            lines.append(f"- `{v}`")

    lines += [
        "",
        "## Compatible con",
        ", ".join(m.get("compatible_con", [])),
        "",
        "## Casos de uso",
    ]
    for caso in m.get("casos_uso_es", []):
        lines.append(f"- {caso}")

    lines += [
        "",
        f"**Creador:** {m.get('creador', 'Desconocido')}",
        f"**GitHub:** {m.get('github_url', '-')}",
        f"**Gratuito:** {'Sí' if m.get('gratuito') else m.get('precio_info', 'No')}",
        f"**Dificultad:** {m.get('dificultad_instalacion', 'media')}",
        f"**Verificado:** {m.get('fecha_verificado', '-')}",
    ]

    if m.get("nota_es"):
        lines += ["", f"**Nota:** {m['nota_es']}"]

    return "\n".join(lines)


@mcp.tool()
def listar_categorias() -> str:
    """
    Lista todas las categorías disponibles en SpainMCP con el número de MCPs en cada una.
    """
    mcps = _load_all()
    conteo: dict[str, int] = {}
    for m in mcps:
        for cat in m.get("categoria", []):
            conteo[cat] = conteo.get(cat, 0) + 1

    labels = {
        "desarrollo": "Desarrollo", "productividad": "Productividad",
        "datos": "Datos", "automatizacion": "Automatización",
        "espana": "España", "colaboracion": "Colaboración",
        "comunicacion": "Comunicación", "busqueda": "Búsqueda",
        "contenido": "Contenido", "investigacion": "Investigación",
        "gobierno": "Gobierno", "empresas": "Empresas",
        "legal": "Legal", "bases-de-datos": "Bases de datos",
        "archivos": "Archivos", "documentacion": "Documentación",
        "scraping": "Scraping",
    }

    lines = ["**Categorías disponibles en SpainMCP:**\n"]
    for cat, n in sorted(conteo.items(), key=lambda x: -x[1]):
        nombre = labels.get(cat, cat)
        lines.append(f"- **{nombre}** (`{cat}`): {n} MCP{'s' if n > 1 else ''}")

    return "\n".join(lines)


@mcp.tool()
def mcps_destacados() -> str:
    """
    Devuelve los servidores MCP destacados y recomendados por SpainMCP.
    """
    mcps = [m for m in _load_all() if m.get("destacado")]
    resultado = [f"**{len(mcps)} MCPs destacados en SpainMCP:**\n"]
    for m in mcps:
        resultado.append(_format_mcp(m))
        resultado.append("")
    return "\n".join(resultado)


if __name__ == "__main__":
    mcp.run(transport="stdio")
