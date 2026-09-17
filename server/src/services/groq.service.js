import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { diagnosisResponseSchema } from "../validators/aiResponse.validator.js";

const SYSTEM_INSTRUCTION = `You are an expert business advisor. Analyze the specific business and exact problem. Do not provide generic advice. Do not assume the business has a website, customers, employees, inventory, social media, delivery, appointments, online orders, or physical footfall unless the user has provided that information. Use only relevant business concepts and metrics. Clearly separate evidence from assumptions. Identify possible causes as hypotheses, not confirmed facts. Ask targeted follow-up questions where data is missing. Create recommendations and a seven-day action plan specifically for this business and problem. Keep all actions realistic for the provided budget. Do not promise guaranteed results. You always respond with valid JSON only.`;

const RESPONSE_SHAPE_INSTRUCTIONS = `Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "summary": "Business-specific diagnosis, 2-4 sentences",
  "confidence": "Low" | "Medium" | "High",
  "possibleCauses": [
    { "cause": "string", "reason": "string", "evidenceNeeded": "string" }
  ],
  "recommendations": [
    { "title": "string", "description": "string", "whyItFits": "string", "estimatedCost": number, "priority": "Low" | "Medium" | "High" }
  ],
  "followUpQuestions": [
    { "question": "string", "reason": "string" }
  ],
  "dataLimitations": ["string"],
  "assumptions": ["string"],
  "risks": ["string"],
  "actionPlan": [
    { "id": "task-1", "day": 1, "title": "string", "description": "string", "priority": "Low" | "Medium" | "High", "estimatedCost": number, "expectedOutput": "string", "completed": false }
  ]
}
The "actionPlan" array must contain EXACTLY 7 tasks, one for each day (day: 1 through 7), ordered logically.
Every estimatedCost must be a plain number in Indian Rupees (INR, no currency symbols or commas) and must not exceed what is realistic for the stated monthly budget.
If a piece of information relevant to the diagnosis was not provided, do not invent it - list it in "dataLimitations" or ask about it in "followUpQuestions" instead.`;

function formatValue(label, value) {
  if (value === undefined || value === null || value === "") return null;
  return `${label}: ${value}`;
}

/**
 * Builds the user-message content that includes ONLY the business/problem
 * data actually provided. Fields the user left blank are simply omitted,
 * rather than being passed as "N/A" - which keeps the model from anchoring
 * on placeholders. The system instruction is sent separately as a system
 * message (see callGroqApi).
 */
function buildUserPrompt({ business, diagnosisInput, previousDiagnosis, followUpAnswers }) {
  const businessLines = [
    formatValue("Business name", business.name),
    formatValue("Category", business.category),
    formatValue("Location", business.location),
    formatValue("Description", business.description),
    formatValue("Products or services", business.productsOrServices),
    formatValue("Target customers", business.targetCustomers),
    formatValue("Monthly budget available for fixing this problem (in Indian Rupees, INR)", `₹${business.monthlyBudget}`),
    formatValue("Primary business goal", business.goal),
    formatValue("Monthly revenue", business.monthlyRevenue),
    formatValue("Current customer count", business.customerCount),
    formatValue("Average order value", business.averageOrderValue),
    formatValue("Website URL", business.websiteUrl),
    formatValue("Social media presence", business.socialMediaPresence),
    formatValue("Number of employees", business.employeeCount),
  ].filter(Boolean);

  const problemLines = [
    formatValue("Exact problem", diagnosisInput.problem),
    formatValue("When the problem started", diagnosisInput.problemDuration),
    formatValue("Severity as reported by the owner", diagnosisInput.severity),
    formatValue("What changed recently", diagnosisInput.recentChanges),
    formatValue("What the owner already tried", diagnosisInput.previousAttempts),
    formatValue("Desired outcome", diagnosisInput.desiredOutcome),
    formatValue("Additional context", diagnosisInput.additionalContext),
    formatValue("Current metrics provided by the owner", diagnosisInput.currentMetrics),
  ].filter(Boolean);

  const sections = [
    `Current date: ${new Date().toISOString().slice(0, 10)}`,
    `--- BUSINESS CONTEXT ---\n${businessLines.join("\n")}`,
    `--- PROBLEM REPORTED BY OWNER ---\n${problemLines.join("\n")}`,
  ];

  if (previousDiagnosis) {
    sections.push(
      `--- PREVIOUS DIAGNOSIS (for context, you are refining this) ---\nPrevious summary: ${previousDiagnosis.summary}\nPreviously identified causes: ${previousDiagnosis.possibleCauses
        .map((c) => c.cause)
        .join("; ")}`
    );
  }

  if (followUpAnswers && followUpAnswers.length > 0) {
    const answerLines = followUpAnswers
      .map((a) => `Q: ${a.question}\nA: ${a.answer || "(skipped)"}`)
      .join("\n\n");
    sections.push(`--- OWNER'S ANSWERS TO FOLLOW-UP QUESTIONS ---\n${answerLines}`);
    sections.push(
      "Use these answers to sharpen the diagnosis. If a question was skipped, keep the underlying uncertainty in dataLimitations or assumptions rather than guessing."
    );
  }

  sections.push(RESPONSE_SHAPE_INSTRUCTIONS);

  return sections.join("\n\n");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([429, 503]);
const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroqApi(userPrompt) {
  if (!env.groqApiKey || !env.groqModel) {
    throw ApiError.internal(
      "AI diagnosis is not configured on the server. Set GROQ_API_KEY and GROQ_MODEL.",
      "AI_NOT_CONFIGURED"
    );
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response;
    try {
      response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.groqApiKey}`,
        },
        body: JSON.stringify({
          model: env.groqModel,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
      });
    } catch (networkErr) {
      console.error(`[groq] Network error calling Groq API (attempt ${attempt}/${MAX_ATTEMPTS}):`, networkErr);
      if (attempt === MAX_ATTEMPTS) {
        throw ApiError.badGateway("Could not reach the AI service. Please try again in a moment.", "AI_NETWORK_ERROR");
      }
      await sleep(500 * 2 ** (attempt - 1));
      continue;
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(`[groq] Groq API returned ${response.status} (attempt ${attempt}/${MAX_ATTEMPTS}):`, errorBody);

      const isRetryable = RETRYABLE_STATUSES.has(response.status);
      if (isRetryable && attempt < MAX_ATTEMPTS) {
        await sleep(700 * 2 ** (attempt - 1)); // 700ms, 1.4s, ...
        continue;
      }

      const message =
        response.status === 429
          ? "The AI service is temporarily rate-limited. Please try again in a moment."
          : "The AI service could not process this request right now. Please try again.";
      throw ApiError.badGateway(message, "AI_UPSTREAM_ERROR");
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";

    if (!text) {
      console.error("[groq] Empty response from Groq:", JSON.stringify(data));
      throw ApiError.badGateway("The AI service returned an empty response. Please try again.", "AI_EMPTY_RESPONSE");
    }

    return text;
  }

  // Unreachable in practice - the loop always returns or throws - but keeps the function's return type honest.
  throw ApiError.badGateway("The AI service could not process this request right now. Please try again.", "AI_UPSTREAM_ERROR");
}

function parseAndValidate(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("[groq] Failed to parse AI response as JSON:", err.message, "\nRaw:", rawText.slice(0, 2000));
    throw ApiError.badGateway(
      "The AI returned a response we couldn't understand. Please try again.",
      "AI_INVALID_JSON"
    );
  }

  const result = diagnosisResponseSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[groq] AI response failed schema validation:", result.error.flatten());
    throw ApiError.badGateway(
      "The AI's response didn't match the expected format. Please try again.",
      "AI_SCHEMA_INVALID"
    );
  }

  return result.data;
}

/**
 * Generates (or refines) a business-specific diagnosis using Groq's
 * OpenAI-compatible chat completions API.
 * Never returns fixed/demo data - a failure at any step throws a real error.
 */
export async function generateDiagnosis({ business, diagnosisInput, previousDiagnosis, followUpAnswers }) {
  const userPrompt = buildUserPrompt({ business, diagnosisInput, previousDiagnosis, followUpAnswers });
  const rawText = await callGroqApi(userPrompt);
  return parseAndValidate(rawText);
}
