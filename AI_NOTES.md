# AI Notes

## What AI Was Used For

This project uses AI in two ways:

1. **Development Assistance** — I used Claude (Anthropic) to help me
   understand concepts, evaluate options, and generate code. I did not
   blindly copy-paste — I asked questions, learned why certain approaches
   work better, and made decisions myself before implementing.

2. **Brief Generation at Runtime** — Groq's LLaMA 3 model is what
   actually powers the app. When a user submits URLs, the extracted
   content is sent to Groq and the model returns a structured research
   brief. This is the core feature of the product.

## LLM Details

| Property | Value |
|---|---|
| Provider | Groq |
| Model | llama-3.3-70b-versatile |
| API | Groq Chat Completions (`/v1/chat/completions`) |
| SDK | `groq-sdk` npm package |

## Why Groq?

- **Free tier** — no credit card needed, easy to get started
- **Fast** — noticeably faster inference than OpenAI for similar models
- **Open source model** — uses Meta's LLaMA 3 which is well documented
- **Simple SDK** — the API is clean and easy to work with

## What I Figured Out Myself

- Switched from better-sqlite3 to sql.js after debugging a Windows
  build error — understood the root cause and picked the right fix
- Chose 1500 char snippet limit per source after realising too much
  text was hitting Groq's free tier token limits
- Added retry logic after seeing intermittent 429 rate limit errors
  during testing
- Added JSON sanitization after catching a control character parse
  error in the backend logs
- Tested the app with real URLs across different topics to verify
  extraction, brief generation, citations, and history all worked

## Notes for Reviewers

- The prompt in `services/llm.js` defines the exact JSON schema the
  model must follow — this keeps parsing reliable
- Temperature is set to 0.3 for more factual, consistent output
- The app retries automatically up to 3 times on rate limit errors
- LLM calls typically take 5–15 seconds depending on source count