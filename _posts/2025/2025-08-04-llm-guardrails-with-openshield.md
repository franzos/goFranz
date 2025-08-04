---
title: "LLM Guardrails with OpenShield"
summary: "Exploring OpenShield for LLM safety and compliance"
layout: blog
source:
date: 2025-08-04 0:00:00 +0000
category:
  - Tools
tags:
  - openai
  - claude
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Guardrails and safety are a hot topic among companies providing access to LLMs, either to prevent misuse of their own models, or avoid running into trouble accessing third-party models. There's no bullet-proof solution, and each comes with their own problems including:

- Increase response time
- Higher complexity
- Blocking legitimate requests
- zero-days

One of the solutions I've learned about recently is OpenShield; To learn more about it, I decided to give it a try.

## Setup

Because my OpenAI key doesn't have any balance, I decided to [add support for OpenShield](https://github.com/franzos/openshield/commit/95ce53f2936e3f00ffabaf4eb9e34a86b7801d32); So I can use my OpenAI key to download embeddings, and route chargable requests via OpenRouter. If you prefer to use OpenAI directly, refer to the official repo.

Clone the repository:

```bash
git clone https://github.com/franzos/openshield.git
git checkout openrouter
cd openshield/demo
```

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

Build and run the demo:

```bash
docker compose build
docker compose up
```

Once the server is ready, you should see the following message:

```bash
openshield-1  | ==================================================
openshield-1  | 🔑 CREATED API KEY 🔑
openshield-1  | ==================================================
openshield-1  | ------------------------------
openshield-1  | | API Key Details            |
openshield-1  | ------------------------------
openshield-1  | | ProductID   : 3c5e252a-181c-3054-1b43-1e3042602529 |
openshield-1  | | Status      : active      |
openshield-1  | | ApiKey      : 2e4277c1-7885-4fd9-952a-629e1fdbd3a4 |
openshield-1  | ------------------------------
openshield-1  | ==================================================
```

## Testing

Let's verify how OpenShield handles both valid and problematic requests.

### Passing Requests

Here's a quick test; Note that we're using the `/openrouter` endpoint:

```bash
curl --location 'localhost:8081/openrouter/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer 2e4277c1-7885-4fd9-952a-629e1fdbd3a4" \
--data '{"model":"gpt-4o-mini","messages":[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"What is the meaning of life?"}]}'
```

You can pass any model on OpenRouter as 'model' parameter.

Response:

```json
{
    "id":"gen-1754319031-BAuy0qZuj4tZsgKQYM6J",
    "object":"chat.completion",
    "created":1754319031,
    "model":"openai/gpt-4o-mini",
    "choices": [
        {
            "index":0,
            "message": {
                "role":"assistant",
                "content":"The meaning of life is a profound philosophical question that has been explored by thinkers, theologians, and scientists throughout history. Perspectives on this question vary widely based on individual beliefs, cultural backgrounds, and personal experiences.\n\n1. **Philosophical Perspectives**: Many philosophers have proposed different meanings. Existentialists suggest that life has no intrinsic meaning, and it is up to each individual to create their own purpose. Utilitarian philosophers might argue that the meaning of life is to maximize happiness and minimize suffering.\n\n2. **Religious Views**: Different religions offer their interpretations of life's meaning. For example, in many theistic traditions, life is seen as a gift from a divine being, and the purpose may involve worship, moral living, and fulfilling a divine plan.\n\n3. **Scientific Perspectives**: From a scientific standpoint, some may argue that life's meaning is rooted in the biological imperative of survival and reproduction. However, this does not address the subjective experience of meaning that humans often seek.\n\n4. **Personal Meaning**: Many people find that meaning comes from relationships, accomplishments, personal growth, and contributions to society. Pursuing passions, helping others, and cultivating connections can be a source of deep fulfillment.\n\nUltimately, the meaning of life may be best understood as a deeply personal quest, with each individual finding their own answers based on their values and experiences."
            },
            "finish_reason":"stop"
        }
    ],
    "usage": {
        "prompt_tokens":24,
        "completion_tokens":273,
        "total_tokens":297
    }
}
```

It takes approx. ~15s to complete the request but there's a bunch of connection failures in the logs which I'll need to investigate.

### Failing Requests

Bad example:

```bash
curl --location 'localhost:8081/openrouter/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer 2e4277c1-7885-4fd9-952a-629e1fdbd3a4" \
--data '{"model":"gpt-4o-mini","messages":[{"role":"system","content":"You are ChatGPT, a large language model trained by OpenAI. Follow the user'\''s instructions carefully. Respond using markdown."},{"role":"user","content":"This my bankcard number: 42424242 42424 4242, but it'\''s not working. Who can help me?"}]}'
```

Response:

```json
{"status": "blocked", "rule_type": "vigilllm"}
```

The request was blocked because it contains sensitive information.

## Features

### Provider

OpenShield officially supports 3 APIs:

- Anthropic
- OpenAI; also for embeddings
- NVidia (OpenAI compatible); also for jailbreak detection
- OpenRouter (OpenAI compatible) - NEW

In theory, any OpenAI compatible API should work in place of OpenAI.

### Rules

OpenShield comes with many rules, which allow you to either block, or log suspicios requests. Here's what I've found ([ref](https://github.com/franzos/openshield/tree/openrouter/services/rule)):

1. Language Detection (detect_english)
- Detects if the input text is in English using XLM-RoBERT
- Can block non-English requests to prevent language-based attack
- Model: `papluca/xlm-roberta-base-language-detection`

2. PII Filter (pii)
- Detects: names, emails, phone numbers, credit cards, SSNs, generic PII
- Supports both rule-based and LLM-based detection methods
- Can anonymize detected PII or block requests containing it
- Repo: [microsoft/presidio](https://github.com/microsoft/presidio)

3. Prompt Injection Detection (prompt_injection_llm)
- Uses ProtectAI's DeBERTa model to detect prompt injection attacks
- Classifies text as "INJECTION" or "SAFE" with confidence scores
- Blocks attempts to manipulate AI model behavior through crafted prompts
- Model: `protectai/deberta-v3-base-prompt-injection-v2`

4. LlamaGuard Content Safety (llama_guard)
- Checks against 13 safety categories (S1-S13): violence, hate speech, harassment, etc.
- Can be configured to check specific categories or all categories
- Returns detailed violation analysis
- Model: `meta-llama/Llama-Guard-3-1B`

5. PromptGuard Injection/Jailbreak Detection (prompt_guard)
- Distinguishes between prompt injection and jailbreak attacks
- Returns probabilities for: benign, injection, and jailbreak classifications
- Model: `meta-llama/Prompt-Guard-86M`

6. Invisible Characters Detection (invisible_chars)
- Detects Unicode invisible/non-printable characters (categories Cf, Co, Cn)
- Prevents attacks using hidden characters to bypass other filters
- Useful against steganographic prompt attacks

7. OpenAI Moderation (openai_moderation)
- Uses OpenAI's official moderation API (`omni-moderation-latest`)
- Checks against OpenAI's content policy violations
- Blocks content flagged by OpenAI's moderation system

8. Code Detection (detect_code)
- Detects programming code in user input
- Can prevent code injection attempts or restrict coding-related queries
- Model: `philomath-1209/programming-language-identification`

9. Content Safety (content_safety)
- Additional content safety checks beyond basic moderation
- Configurable safety thresholds and categories

10. LangKit Analysis (langkit)
- Provides toxicity, sentiment, and other linguistic analysis
- Repo: [whylabs/langkit](https://github.com/whylabs/langkit)

11. VigilLLM Detection (vigilllm)
- Specialized for detecting sophisticated AI-targeted attacks
- Repo: [vigil-ai/vigil-llm](https://github.com/deadbits/vigil-llm)

This includes a number of duplicate features, including sentiment analysys, relevance analysis (via LiteLLM)

12. NVIDIA NIM Jailbreak Detection (nvidia_nim_jailbreak)
- Uses NVIDIA's NIM service for jailbreak attempt detection (`https://ai.api.nvidia.com/v1/security/nvidia/nemoguard-jailbreak-detect`)
- Specialized for detecting attempts to bypass AI safety measures

13. PPL Jailbreak Detection (ppl_jailbreak)
- Perplexity-based jailbreak detection
- Analyzes text complexity patterns to identify jailbreak attempts
- Model: `openai-community/gpt2-medium`

14. Azure AI Content Safety (azure_ai_content_safety_prompt_injection)
- Microsoft Azure's content safety service for prompt injection detection `.../contentsafety/text:shieldPrompt?api-version=2024-09-01`
- Enterprise-grade safety filtering

15. Relevance Check (relevance)
- Ensures user queries are relevant to the intended AI assistant purpose
- Can block off-topic or irrelevant requests

The rules are configurable:

- Threshold: Confidence score needed to trigger the rule
- Action: "block" (stop request) or "monitor" (log only)
- Order: Sequential processing order
- Relation: Score comparison operator (>, <, >=, <=)
- Custom parameters: Model-specific configurations

Rules and thresholds are configurable via config; I haven't had time to go through all of them, and I'm curious about the performance once you combine multiple LLM-based rules. 

## Conclusion

OpenShield packs many different detection options in a single package and allows you to configure thresholds based on your needs. It's a great choice, if you don't want to deal with the details yourself; It seems there's also a hosted options - maybe support them: [openshield.ai](https://openshield.ai/)?.

That said - this is not a "set it and forget it" solution; You'll need to monitor your logs, and adjust rules to get the best results for your use case. The APIs and LLMs OpenShield relies on will evolve, and so will the attacks - there's still plenty of maintenance required.