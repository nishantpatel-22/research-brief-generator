# Prompts Used During Development

This document records the prompts I used when leveraging AI assistance
during the development of this project.

---

## 1. Architecture Design

Before writing any code, I wanted to understand what tech choices made
sense for this project. I asked AI to help me think through the options:
```
I want to build a Research Brief Generator where users paste URLs,
the app fetches and cleans the content, and an LLM generates a
structured brief with citations.

What would be the best stack for this? I'm thinking React frontend,
Node.js backend, some kind of database, and Groq for the LLM.
What database would you recommend and why? What folder structure
would keep this simple and easy to explain?
```

AI suggested SQLite for simplicity since there's no need for a separate
database server. I learned about the difference between better-sqlite3
and sql.js — better-sqlite3 is faster but needs C++ build tools on
Windows. Since I'm on Windows, I went with sql.js which is pure
JavaScript and works out of the box. I made that call myself after
understanding the tradeoff.

---

## 2. Content Extraction

I knew I needed to pull readable text from URLs and strip out ads,
navigation, and other junk. I asked AI what the best approach was:
```
What is the best way to extract clean readable text from a webpage
in Node.js? I want to remove ads, navigation, footers etc and just
get the article content. What libraries should I use?
```

I learned about node-html-parser as a lightweight option. I then asked
AI to help me structure the extraction logic, and I reviewed and tested
it against real URLs to make sure it worked properly.

I also decided myself to limit each source to 1500 characters — I
figured out that sending too much text from 5-10 sources would exceed
Groq's free tier limits.

---

## 3. LLM Prompt Engineering

I knew I needed the LLM to return structured data I could display in
the UI, so I asked AI about the best way to do that:
```
I want the LLM to return a structured research brief as JSON with
these fields: title, summary, keyPoints (with source citations),
conflictingClaims, toVerify checklist, and tags.

What is the best way to prompt an LLM to reliably return JSON?
What temperature setting works best for factual research tasks?
```

I learned that explicitly defining the JSON schema inside the prompt
and asking for no markdown gives the most reliable results. I also
learned that a lower temperature (0.3) makes the output more factual
and consistent, which makes sense for a research tool. I implemented
both of these myself after understanding why they matter.

---

## 4. Handling LLM Failures

During testing I noticed the app would sometimes fail silently. I
debugged this myself by adding console logs and saw two issues —
rate limit errors from Groq, and JSON parse errors from bad characters
in the LLM response. I then asked AI how to handle both cleanly:
```
My Groq API calls sometimes fail with 429 rate limit errors and
sometimes the JSON response has control characters that break
JSON.parse(). What is the best way to handle both of these issues?
```

I learned about retry logic with exponential backoff for rate limits,
and character sanitization before parsing JSON. I understood both
concepts before implementing them so I could explain how they work.

---

## 5. Database Choice on Windows

I ran into a native compilation error when installing better-sqlite3
on Windows. I debugged the error myself, understood it was a missing
C++ build tools issue, then asked AI for the best alternative:
```
better-sqlite3 fails to install on Windows because it needs Visual
Studio build tools. What is the best pure JavaScript alternative
for SQLite that works without any compilation?
```

I learned about sql.js and switched to it. I also had to rewrite the
database helper functions since sql.js has a different API — I did
that myself after reading the sql.js documentation.