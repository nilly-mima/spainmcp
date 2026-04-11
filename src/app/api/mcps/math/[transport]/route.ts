import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

// Math-MCP self-hosted — basado en EthanHenrickson/math-mcp (MIT)
// 22 tools de operaciones matemáticas puras, cero datos, cero auth.
// Hosteado en SpainMCP para evitar la dependencia legal/técnica de Smithery.

const handler = createMcpHandler(
  (server) => {
    // ── Aritmética básica ─────────────────────────────────────
    server.registerTool(
      "add",
      {
        title: "Add",
        description: "Adds two numbers together",
        inputSchema: {
          firstNumber: z.number().describe("The first addend"),
          secondNumber: z.number().describe("The second addend"),
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ firstNumber, secondNumber }) => ({
        content: [{ type: "text" as const, text: String(firstNumber + secondNumber) }],
      })
    )

    server.registerTool(
      "subtract",
      {
        title: "Subtract",
        description: "Subtracts the second number from the first number",
        inputSchema: {
          minuend: z.number().describe("The number to subtract from (minuend)"),
          subtrahend: z.number().describe("The number being subtracted (subtrahend)"),
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ minuend, subtrahend }) => ({
        content: [{ type: "text" as const, text: String(minuend - subtrahend) }],
      })
    )

    server.registerTool(
      "multiply",
      {
        title: "Multiply",
        description: "Multiplies two numbers together",
        inputSchema: {
          firstNumber: z.number().describe("The first number"),
          SecondNumber: z.number().describe("The second number"),
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ firstNumber, SecondNumber }) => ({
        content: [{ type: "text" as const, text: String(firstNumber * SecondNumber) }],
      })
    )

    server.registerTool(
      "division",
      {
        title: "Division",
        description: "Divides the first number by the second number",
        inputSchema: {
          numerator: z.number().describe("The number being divided (numerator)"),
          denominator: z.number().describe("The number doing the dividing (denominator)"),
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numerator, denominator }) => {
        if (denominator === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot divide by zero" }] }
        }
        return { content: [{ type: "text" as const, text: String(numerator / denominator) }] }
      }
    )

    server.registerTool(
      "modulo",
      {
        title: "Modulo",
        description: "Divides two numbers and returns the remainder",
        inputSchema: {
          numerator: z.number().describe("The number being divided"),
          denominator: z.number().describe("The divisor"),
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numerator, denominator }) => {
        if (denominator === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot modulo by zero" }] }
        }
        return { content: [{ type: "text" as const, text: String(numerator % denominator) }] }
      }
    )

    // ── Agregaciones sobre arrays ─────────────────────────────
    server.registerTool(
      "sum",
      {
        title: "Sum",
        description: "Adds any number of numbers together",
        inputSchema: { numbers: z.array(z.number()).describe("List of numbers to sum") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numbers }) => ({
        content: [{ type: "text" as const, text: String(numbers.reduce((a, b) => a + b, 0)) }],
      })
    )

    server.registerTool(
      "mean",
      {
        title: "Mean",
        description: "Calculates the arithmetic mean of a list of numbers",
        inputSchema: { numbers: z.array(z.number()).describe("List of numbers") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numbers }) => {
        if (numbers.length === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot compute mean of empty list" }] }
        }
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
        return { content: [{ type: "text" as const, text: String(mean) }] }
      }
    )

    server.registerTool(
      "median",
      {
        title: "Median",
        description: "Calculates the median of a list of numbers",
        inputSchema: { numbers: z.array(z.number()).describe("List of numbers") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numbers }) => {
        if (numbers.length === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot compute median of empty list" }] }
        }
        const sorted = [...numbers].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
        return { content: [{ type: "text" as const, text: String(median) }] }
      }
    )

    server.registerTool(
      "mode",
      {
        title: "Mode",
        description: "Finds the most common number in a list of numbers",
        inputSchema: { numbers: z.array(z.number()).describe("List of numbers") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numbers }) => {
        if (numbers.length === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot compute mode of empty list" }] }
        }
        const counts = new Map<number, number>()
        for (const n of numbers) counts.set(n, (counts.get(n) ?? 0) + 1)
        let maxCount = 0
        let mode = numbers[0]
        for (const [num, count] of counts) {
          if (count > maxCount) {
            maxCount = count
            mode = num
          }
        }
        return { content: [{ type: "text" as const, text: String(mode) }] }
      }
    )

    server.registerTool(
      "min",
      {
        title: "Min",
        description: "Finds the minimum value from a list of numbers",
        inputSchema: { numbers: z.array(z.number()).describe("List of numbers") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numbers }) => {
        if (numbers.length === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot find min of empty list" }] }
        }
        return { content: [{ type: "text" as const, text: String(Math.min(...numbers)) }] }
      }
    )

    server.registerTool(
      "max",
      {
        title: "Max",
        description: "Finds the maximum value from a list of numbers",
        inputSchema: { numbers: z.array(z.number()).describe("List of numbers") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ numbers }) => {
        if (numbers.length === 0) {
          return { isError: true, content: [{ type: "text" as const, text: "Cannot find max of empty list" }] }
        }
        return { content: [{ type: "text" as const, text: String(Math.max(...numbers)) }] }
      }
    )

    // ── Redondeo ──────────────────────────────────────────────
    server.registerTool(
      "floor",
      {
        title: "Floor",
        description: "Rounds a number down to the nearest integer",
        inputSchema: { number: z.number().describe("Number to round down") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.floor(number)) }] })
    )

    server.registerTool(
      "ceiling",
      {
        title: "Ceiling",
        description: "Rounds a number up to the nearest integer",
        inputSchema: { number: z.number().describe("Number to round up") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.ceil(number)) }] })
    )

    server.registerTool(
      "round",
      {
        title: "Round",
        description: "Rounds a number to the nearest integer",
        inputSchema: { number: z.number().describe("Number to round") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.round(number)) }] })
    )

    // ── Trigonometría ─────────────────────────────────────────
    server.registerTool(
      "sin",
      {
        title: "Sine",
        description: "Calculates the sine of a number in radians",
        inputSchema: { number: z.number().describe("Angle in radians") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.sin(number)) }] })
    )

    server.registerTool(
      "arcsin",
      {
        title: "Arcsine",
        description: "Calculates the arcsine of a number in radians",
        inputSchema: { number: z.number().describe("Value between -1 and 1") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.asin(number)) }] })
    )

    server.registerTool(
      "cos",
      {
        title: "Cosine",
        description: "Calculates the cosine of a number in radians",
        inputSchema: { number: z.number().describe("Angle in radians") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.cos(number)) }] })
    )

    server.registerTool(
      "arccos",
      {
        title: "Arccosine",
        description: "Calculates the arccosine of a number in radians",
        inputSchema: { number: z.number().describe("Value between -1 and 1") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.acos(number)) }] })
    )

    server.registerTool(
      "tan",
      {
        title: "Tangent",
        description: "Calculates the tangent of a number in radians",
        inputSchema: { number: z.number().describe("Angle in radians") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.tan(number)) }] })
    )

    server.registerTool(
      "arctan",
      {
        title: "Arctangent",
        description: "Calculates the arctangent of a number in radians",
        inputSchema: { number: z.number().describe("Value") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({ content: [{ type: "text" as const, text: String(Math.atan(number)) }] })
    )

    // ── Conversión angular ────────────────────────────────────
    server.registerTool(
      "radiansToDegrees",
      {
        title: "Radians to Degrees",
        description: "Converts a radian value to its equivalent in degrees",
        inputSchema: { number: z.number().describe("Angle in radians") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({
        content: [{ type: "text" as const, text: String((number * 180) / Math.PI) }],
      })
    )

    server.registerTool(
      "degreesToRadians",
      {
        title: "Degrees to Radians",
        description: "Converts a degree value to its equivalent in radians",
        inputSchema: { number: z.number().describe("Angle in degrees") },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async ({ number }) => ({
        content: [{ type: "text" as const, text: String((number * Math.PI) / 180) }],
      })
    )
  },
  {},
  { basePath: "/api/mcps/math", maxDuration: 60 }
)

// Sin auth — es matemática pura, sin datos sensibles.
export { handler as GET, handler as POST }
export const maxDuration = 60
