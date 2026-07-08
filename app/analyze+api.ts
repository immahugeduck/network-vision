import { generateText, Output } from "ai"
import { reportSchema } from "@/lib/report"

// Server-side AI analysis endpoint. Runs only on the dev server (development)
// or your deployed server (production) — never on the device — so the
// AI_GATEWAY_API_KEY stays secret. The client posts its saved run history and
// gets back a structured, schema-validated report.

const MODEL = "anthropic/claude-haiku-4.5"

type IncomingRun = {
  timestamp: number
  downloadMbps: number
  uploadMbps: number
  pingMs: number
  jitterMs: number
  connectionType: string
  isp: string | null
  countryCode: string | null
  isVpn: boolean | null
}

const SYSTEM = [
  "You are a network diagnostics analyst inside a mobile connection-testing app.",
  "You will be given REAL speed-test measurements the app collected from the user's device.",
  "Your job is to interpret this data for a non-expert in clear, friendly, practical language.",
  "STRICT RULES:",
  "- Only reason about the numbers you are given. NEVER invent measurements, servers, or values.",
  "- If there is only one run, do not claim a trend; set trend to null.",
  "- Base the grade on typical broadband expectations: download >100 Mbps is excellent, 25-100 good, 10-25 fair, <10 poor. Also weigh ping (<30ms great, >100ms poor) and jitter (<10ms great, >30ms poor).",
  "- Recommendations must be concrete and relevant to the data (e.g. router placement, switching bands, contacting ISP). If everything looks great, return an empty recommendations array.",
  "- Keep the summary to 2-3 sentences.",
].join("\n")

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { runs?: IncomingRun[] }
    const runs = Array.isArray(body.runs) ? body.runs : []

    if (runs.length === 0) {
      return Response.json({ error: "No run history to analyze. Run a speed test first." }, { status: 400 })
    }

    const latest = runs[0]
    const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
    const stats = {
      totalRuns: runs.length,
      avgDownloadMbps: Number(avg(runs.map((r) => r.downloadMbps)).toFixed(1)),
      avgUploadMbps: Number(avg(runs.map((r) => r.uploadMbps)).toFixed(1)),
      avgPingMs: Math.round(avg(runs.map((r) => r.pingMs))),
      avgJitterMs: Math.round(avg(runs.map((r) => r.jitterMs))),
      bestDownloadMbps: Number(Math.max(...runs.map((r) => r.downloadMbps)).toFixed(1)),
      worstDownloadMbps: Number(Math.min(...runs.map((r) => r.downloadMbps)).toFixed(1)),
    }

    const prompt = [
      "Here is the user's speed-test history (most recent first). Analyze it.",
      "",
      "Aggregate stats:",
      JSON.stringify(stats, null, 2),
      "",
      "Most recent run:",
      JSON.stringify(latest, null, 2),
      "",
      `Individual runs (${runs.length}):`,
      JSON.stringify(
        runs.slice(0, 20).map((r) => ({
          when: new Date(r.timestamp).toISOString(),
          downloadMbps: r.downloadMbps,
          uploadMbps: r.uploadMbps,
          pingMs: r.pingMs,
          jitterMs: r.jitterMs,
          connection: r.connectionType,
          isp: r.isp,
          vpn: r.isVpn,
        })),
        null,
        2,
      ),
    ].join("\n")

    const { output } = await generateText({
      model: MODEL,
      system: SYSTEM,
      prompt,
      output: Output.object({ schema: reportSchema }),
    })

    return Response.json({ report: output })
  } catch (err) {
    console.log("[v0] analyze route error:", (err as Error)?.message)
    return Response.json(
      { error: "Analysis failed. The AI service may be temporarily unavailable." },
      { status: 500 },
    )
  }
}
