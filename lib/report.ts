import { z } from "zod"

// Shared contract between the /analyze API route and the Report screen.
// This file imports ONLY zod (no `ai` package, no secrets), so it is safe to
// import from client code — the AI call itself lives in app/analyze+api.ts.

export const reportSchema = z.object({
  grade: z
    .enum(["excellent", "good", "fair", "poor"])
    .describe("Overall verdict on the connection based on the data provided."),
  headline: z.string().describe("A single short sentence summarizing the connection quality."),
  summary: z
    .string()
    .describe("2-3 sentences in plain language explaining what the numbers mean for everyday use."),
  findings: z
    .array(
      z.object({
        severity: z.enum(["positive", "info", "warning"]),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .describe("Specific observations grounded strictly in the provided measurements."),
  recommendations: z
    .array(z.string())
    .describe("Concrete, actionable suggestions. Empty array if nothing needs improving."),
  trend: z
    .string()
    .nullable()
    .describe("A note about how results are changing over time, or null if there is only one run."),
})

export type ConnectionReport = z.infer<typeof reportSchema>

export type Grade = ConnectionReport["grade"]
