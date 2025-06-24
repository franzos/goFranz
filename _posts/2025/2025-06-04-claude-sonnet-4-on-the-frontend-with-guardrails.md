---
title: "Claude Sonnet 4 on the Frontend with Guardrails"
summary: "Using Claude 4 Sonnet to re-write a React frontend feature with guardrails."
layout: post
source:
date: 2025-6-04 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - claude
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I have previously written about how I use LLMs to accelerate non-critical work: [Using LLMs to Accelerate Non-Critical Work](/blog/using-llm-to-accelerate-non-critical-work/) like writing scripts, or learning new concepts.

In this post, I want to share my experience re-writing a feature on a React frontend using Claude 4 Sonnet. Claude is a large language model (LLM) that can assist with coding tasks, and Sonnet 4 is the latest version as of June 2025.

The goal was, to re-write a web form editor to be more user-friendly.

TL;DR: Key points:

- Adding features works well when existing code gives clear guardrails.
- Define features clearly and add them one at a time to avoid confusing the LLM.
- Claude often misunderstands component rendering, suggesting awkward or inefficient solutions.
- It may ignore suggested libraries; reminding it usually helps.

## Prompt

Here's what the initial prompt looked like:

```
I want you to help me re-design my visual form editor; There's 3 parts to it:
- Add a new field
- Edit, remove a existing field
- Re-arrange fields

I think a 3 columns layout would be ideal:
1. Select a new field; There should be a button for each field type (Single Line Text, Paragraph Text, Number, Checkbox and so on)
2. In the center, we show all existing fields in a list
3. On the side, we show field settings, for the active field. So whenever a field is selected (or a new one added), the field settings show be visible.

The Editor can be found here @/src/components/Form/SpecEditor.tsx and form fields here @/src/components/Form/SpecField.tsx 

Lastly, it should be possible to re-arrange the order of the fields.

The goal is, to make this as simple for the user as possible; This is especially important for novice / first-time users.

Before you get started:
- Carefully review how fields work currently
- Checkout the context in which the editor is placed on @/src/components/Form/FormSpecification.tsx 

If you have any questions, let me know.
```

Claude came back to me with a plan, and 3 questions:

```
- The drag-and-drop library to use?
- How to handle responsive behavior on smaller screens?
- Any specific styling or theming requirements?
```

I answered the questions, and suggested a library for drag-and-drop, and toggled the "ACT" switch to get it going.

### Implementation

It quickly implemented the changes with 3 caveats:

1. It ignored the request for the library, and used the HTML5 drag API (which didn't end up working)
2. It re-wrote the component in a way, that every field input, would re-render the component, so we'd lose focus on the input field
3. The layout looked a bit off, because it set a fixed height, which broke some parts of the layout

Once I pointed out these issues, Claude was able to fix (1), but couldn't handle the others after multiply tries, and clear explanation:

- (2): It suggested to debounce the input, which resulted in a lot of spaghetti code; I had to re-write this myself
- (3): It tried, and re-tried to fix the button alignment, but the problem was the fixed height, which it didn't understand


### Result

#### BEFORE

Previously, adding fields required opening a modal, fields couldn't be re-ordered, and the cramped layout often confused users. Additionally, the "Single Line Text" field was used for email and URL inputs, which led to further confusion.

![Before: Form Editor](/assets/images/blog/claude-sonnet-4-on-the-frontend-with-guardrails_before.png)

- Fields added via modal
- No re-ordering of fields
- "Single Line Text" field used for email and URL inputs

#### AFTER

The redesigned 3-column layout displays all options clearly and lets users easily re-arrange fields. New dedicated field types for Email and URL help prevent confusion, replacing the old "Single Line Text" field that relied on optional validation.

![After: Form Editor](/assets/images/blog/claude-sonnet-4-on-the-frontend-with-guardrails_after.png)

- 3-column layout for clarity
- Drag-and-drop re-ordering of fields
- Dedicated Email and URL field types

_This screenshot also shows some extra improvements, such as a toggle between Visual and TOML editors, and adjustable input field sizes in the "Field Settings" section._

## What worked well

Thanks to the existing code, and the popular component library, Claude had plenty of guardrails to follow, which made the feature re-write fit well.

It would have taken me longer, to handle the implementation myself, but drafting the prompt, reviewing the output, and debugging above issues, also took time - though ultimately less, than if I had done the re-write myself.

## What didn't work well

Claude frequently struggled with understanding how components render, and would suggest awkward workarounds that added complexity and reduced performance. For example, it suggested to use a library for drag-and-drop, but then proceeded to implement the feature without it. Reminding it of the library it suggested earlier usually got it back on track.

## Conclusion

LLMs are great for adding new features, especially when the existing code provides good guardrails:

- Make one change per prompt to reduce confusion.
- Keep prompts focused and concise for better results.
- For big changes, first plan and list TODOs, then implement in a new session.

Pro tip: Unsure about changes? Stage them, test, and commit only if satisfied.

---

You can see this in action, on [Formshive](https://formshive.com/).