# n8n Chrome AI Nodes Reference

Complete documentation for all 7 Chrome AI nodes.

## Common Features

All nodes share these characteristics:
- **Local Processing**: AI runs on-device (Gemini Nano)
- **Privacy**: No data leaves your machine
- **No API Keys**: Free, no rate limits
- **Credentials**: All require "Chrome AI API" credentials
- **Input Support**: Use `{{$json.field}}` to reference previous node data
- **Error Handling**: Optional "Continue on Fail" for resilient workflows

---

## 1. Chrome Prompt AI

**Purpose**: Full-featured LLM for general AI tasks

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| System Prompt | string | No | "" | Instructions that guide AI behavior |
| User Prompt | string | Yes | - | The actual prompt/question |
| Temperature | number | No | 0.8 | Creativity (0=focused, 2=creative) |

### Use Cases
- Content generation
- Question answering
- Text analysis
- Creative writing
- Code generation
- Brainstorming

### Example

**Prompt**: "Write a professional email declining a meeting"

**Output**: "Dear [Name], Thank you for the invitation to meet on..."

### Tips
- Use system prompt to define persona: "You are a professional copywriter..."
- Lower temperature (0.3) for factual content
- Higher temperature (1.5) for creative content
- Reference input: "Analyze this: {{$json.article}}"

---

## 2. Chrome Writer

**Purpose**: Generate text with specific tone and length

### Parameters

| Parameter | Type | Required | Options | Description |
|-----------|------|----------|---------|-------------|
| Prompt | string | Yes | - | What to write about |
| Tone | select | No | formal, neutral, casual | Writing style |
| Format | select | No | plain-text, markdown | Output format |
| Length | select | No | short, medium, long | Output length |

### Use Cases
- Email drafting
- Social media posts
- Product descriptions
- Ad copy
- Blog intros

### Example

**Input**:
- Prompt: "New product launch for eco-friendly water bottle"
- Tone: "professional"
- Length: "medium"

**Output**: "Introducing our revolutionary eco-friendly water bottle, designed for the modern..."

### Tips
- Formal tone for business communications
- Casual tone for social media
- Markdown format for rich text platforms

---

## 3. Chrome Summarizer

**Purpose**: Condense long text into concise summaries

### Parameters

| Parameter | Type | Required | Options | Description |
|-----------|------|----------|---------|-------------|
| Text | string | Yes | - | Text to summarize |
| Type | select | No | tl;dr, key-points, teaser, headline | Summary style |
| Format | select | No | plain-text, markdown | Output format |
| Length | select | No | short, medium, long | Summary length |

### Use Cases
- Article condensation
- Meeting notes
- Research papers
- Long emails
- Documentation

### Example

**Input**:
- Text: "Very long article about climate change..." (2000 words)
- Type: "key-points"
- Length: "short"

**Output**:
```
• Global temperatures rising
• Renewable energy adoption increasing
• Policy changes needed urgently
```

### Tips
- Use "tl;dr" for quick summaries
- Use "key-points" for bullet lists
- Use "teaser" for marketing previews
- Use "headline" for article titles

---

## 4. Chrome Translator

**Purpose**: Translate text between languages on-device

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Text | string | Yes | Text to translate |
| Source Language | string | No | Language code (e.g., "en"). Auto-detect if empty |
| Target Language | string | Yes | Target language code (e.g., "es") |

### Supported Languages

Common codes:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- `zh` - Chinese
- `ar` - Arabic
- `pt` - Portuguese
- `ru` - Russian
- `it` - Italian

### Use Cases
- Multilingual content
- International communication
- Content localization
- Customer support

### Example

**Input**:
- Text: "Hello, how are you?"
- Source: "en"
- Target: "es"

**Output**: "Hola, ¿cómo estás?"

### Tips
- Leave source empty for auto-detection
- Use with Language Detector for smart routing
- Combine with Rewriter for localized tone

---

## 5. Chrome Rewriter

**Purpose**: Rephrase text with different tone or length

### Parameters

| Parameter | Type | Required | Options | Description |
|-----------|------|----------|---------|-------------|
| Text | string | Yes | - | Text to rewrite |
| Tone | select | No | more-formal, formal, neutral, casual, more-casual | Desired tone |
| Format | select | No | plain-text, markdown | Output format |
| Length | select | No | shorter, same, longer | Length relative to original |

### Use Cases
- Tone adjustment (casual → formal)
- Content variations
- A/B testing copy
- Length optimization
- Paraphrasing

### Example

**Input**:
- Text: "Hey! Check out this cool new thing we made lol"
- Tone: "more-formal"
- Length: "same"

**Output**: "We are pleased to present our new product for your consideration."

### Tips
- Use "more-formal" for professional polish
- Use "more-casual" for friendly tone
- "shorter" great for social media character limits
- "longer" adds detail and context

---

## 6. Chrome Proofreader

**Purpose**: Fix grammar, spelling, and improve clarity

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Text | string | Yes | Text to proofread |

### Use Cases
- Error correction
- Professional writing
- Quality assurance
- Pre-publish checks
- Email polish

### Example

**Input**: "Their are many reasons why automation is importent for busines today"

**Output**: "There are many reasons why automation is important for business today"

### Tips
- Use as final step in content pipelines
- Combine with Writer for draft → polish flow
- Great for user-generated content cleanup
- Run before translation for better results

---

## 7. Chrome Language Detector

**Purpose**: Identify the language of text

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Text | string | Yes | Text to analyze |

### Use Cases
- Content routing
- Pre-translation
- Multilingual support
- Analytics
- Smart workflows

### Example

**Input**: "Bonjour, comment ça va?"

**Output**: "fr" (French)

### Tips
- Use with IF node for conditional translation
- Route different languages to different processes
- Combine with Translator for smart multilingual flows
- Works with small text samples

---

## Workflow Patterns

### Pattern 1: Generate → Polish

```
Prompt AI (draft) → Proofreader → Output
```

### Pattern 2: Extract → Summarize → Translate

```
HTTP Request (article) → Summarizer → Translator → Save
```

### Pattern 3: Multilingual Processing

```
Input → Language Detector → IF
  → (EN) Process directly
  → (Other) Translator → Process → Translate back
```

### Pattern 4: Content Variations

```
Writer → [Rewriter (formal), Rewriter (casual), Rewriter (shorter)]
  → Save 3 versions
```

### Pattern 5: Quality Pipeline

```
Draft → Rewriter (formal) → Proofreader → Final
```

---

## Best Practices

### Performance
- AI nodes run sequentially (one at a time)
- Each call takes ~1-5 seconds depending on length
- Use batch processing for multiple items

### Reliability
- Always check bridge connection first
- Use "Continue on Fail" for resilient workflows
- Add error handling nodes

### Quality
- Be specific in prompts
- Use system prompts for consistent behavior
- Chain multiple AI nodes for better results

### Privacy
- All processing happens on your machine
- No logs are sent anywhere
- Bridge server is localhost only

---

## Error Messages

### "Chrome AI bridge is not responding"
**Solution**: Start bridge server (`npm start` in server/)

### "AI model not available"
**Solution**: Enable flags and download model (see Setup)

### "Chrome extension not connected"
**Solution**: Load extension in chrome://extensions/

### "Request timeout"
**Solution**: Prompt too complex or model overloaded. Simplify or retry.

---

## Advanced Usage

### Using Input Data

```javascript
// Reference previous node data
userPrompt: "Summarize: {{$json.articleContent}}"

// Multiple fields
userPrompt: "Write email to {{$json.name}} about {{$json.topic}}"

// JSON stringification
userPrompt: "Analyze: {{$json}}"
```

### Chaining AI Nodes

```
Data → Extract Text
     → Detect Language
     → Translator (if needed)
     → Summarizer
     → Rewriter (casual)
     → Proofreader
     → Save
```

### Conditional Logic

```
Input → Language Detector
      → IF node
        → language === 'en' → Process
        → language !== 'en' → Translator → Process
```

---

**Need more help?** See `TROUBLESHOOTING.md` or check [Chrome AI docs](https://developer.chrome.com/docs/ai/built-in-apis)

