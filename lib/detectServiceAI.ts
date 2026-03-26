import { groq, openrouter, cerebras } from './aiProviders'
import { SYSTEM_PROMPT } from './aiPrompt'

// ⚠️ control simple de uso (para no quemar free tier)
let groqCalls = 0
let openrouterCalls = 0
let cerebrasCalls = 0

const LIMIT = 100 // ajusta según uso

async function tryGroq(query: string) {
  if (groqCalls > LIMIT) return null

  try {
    groqCalls++

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    })

    console.log('Groq response:', res.choices[0].message.content?.trim())

    return res.choices[0].message.content?.trim()
  } catch {
    return null
  }
}

async function tryOpenRouter(query: string) {
  if (openrouterCalls > LIMIT) return null

  try {
    openrouterCalls++

    const res = await openrouter.chat.completions.create({
      model: 'meta-llama/llama-3-8b-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    })

    console.log('OpenRouter response:', res.choices[0].message.content?.trim())

    return res.choices[0].message.content?.trim()
  } catch {
    return null
  }
}

async function tryCerebras(query: string) {
  if (cerebrasCalls > LIMIT) return null

  try {
    cerebrasCalls++

    const res = await cerebras.chat.completions.create({
      model: 'llama3.1-8b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    })

    console.log('Cerebras response:', res.choices[0].message.content?.trim())

    return res.choices[0].message.content?.trim()
  } catch {
    return null
  }
}

// 🧠 FUNCIÓN PRINCIPAL
export async function detectServiceAI(query: string) {
  // 1️⃣ GROQ
  let result = await tryGroq(query)
  if (result) return result

  // 2️⃣ OPENROUTER
  result = await tryOpenRouter(query)
  if (result) return result

  // 3️⃣ CEREBRAS
  result = await tryCerebras(query)
  if (result) return result

  return null
}