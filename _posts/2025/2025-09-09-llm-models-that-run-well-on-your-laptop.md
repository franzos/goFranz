---
title: "LLM models that run well on your laptop"
summary: "A quick overview of some interesting LLM models that run well on modest hardware"
layout: blog
source:
date: 2025-09-09 0:00:00 +0000
category:
  - Tools
tags:
  - llm
  - 
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I've recently trialed several LLM models that run reasonably well on modest hardware. My goal was to see how they perform and whether they produce useful results. As a rule of thumb: the larger the model, the more embedded "knowledge." Tiny models have limited context, so I don't expect them to answer complex questions or sustain an engaging conversation, but they can still be useful for simple, constrained tasks.

Specs:
- AMD Ryzen 5 7640U
- 64GB RAM

## Setup

On guix, it's easy to get started with `llama-cli`:

```bash
guix shell llama-cli
```

For other systems, checkout the [llama.cpp repository](https://github.com/ggml-org/llama.cpp).

## Models

### LiquidAI/LFM2-VL-1.6B

The `LiquidAI/LFM2-VL-1.6B` is quite capable and can keep up a conversation for a while; For some interactions, you'll be hard-pressed to tell the difference between it's output, and that of a much larger model.

- Conversational
- Good quality
- Fast

#### Test

```bash
$ llama-cli -hf LiquidAI/LFM2-VL-1.6B-GGUF:Q4_0
Tell me about the first time, man landed on the moon. When was it, who was involved, and what technology was used?
```

---

The first time a man landed on the moon was on July 20, 1969. The mission involved the Apollo 11 spacecraft, which was piloted by astronaut Neil Armstrong. The mission was part of the United States' Apollo program and was aimed at landing humans on the moon and returning them safely to Earth.

The Apollo program was initiated by NASA in response to the Soviet Union's launch of Sputnik 1, the first artificial satellite, in 1957. The United States government responded by launching the first manned spaceflight in 1958, known as Project Mercury ...

### Nikity/lille-130m

The `Nikity/lille-130m` is a very small model that runs incredibly fast, but will quickly deteriorate into nonsense; It doesn't contain much information, so don't expect it to provide accurate answers.

- One-shot responses
- Inaccurate
- Very fast

#### Test

```bash
$ llama-cli -hf Nikity/lille-130m-instruct:F16
Tell me about the first time, man landed on the moon. When was it, who was involved, and what technology was used?
```

---

The first man-man on the moon was the Apollo 11 mission, which was launched on July 2021. The Apollo 11 mission was an extraordinary mission to land humans on the moon, where they would travel to the moon's surface and conduct experiments. The mission was designed by Apollo 14, an American space program that was designed to return humans to the moon's surface during that mission.

### prithivMLmods/Qwen3-Medical

The `prithivMLmods/Qwen3-Medical` is a larger, more specialized model; It will take a short input, generate some questions, and then answer them in detail; It runs quite fast too - but does sometimes go off-topic at times.

- Medical questions
- Detailed answers
- Fast

#### Test

```bash
$ llama-cli -hf prithivMLmods/Qwen3-Medical-GRPO-GGUF:Q8_0 -no-cnv \
-p "I have been having a headache for a week. What can I do about it?"
```

---

I have been having a headache for a week. What can I do about it? How long can a tension headache last, and what are some other symptoms of a headache? How can I treat a headache, and what are some common causes of headaches? Can stress cause headaches?

Headaches can be caused by various factors, and it's important to identify the underlying cause to manage them effectively. If your headache has persisted for a week, it might be a tension headache, which typically lasts between 30 minutes and several days. Other symptoms of a headache can include dizziness, nausea, sensitivity to light or sound, and neck pain. To treat a headache, you can try resting in a dark, quiet room, applying a cold or warm compress to your forehead, neck, or scalp, and taking over-the-counter pain relievers like ibuprofen or acetaminophen. Additionally, staying hydrated and practicing relaxation techniques can help alleviate symptoms. Common causes of headaches include stress, dehydration, lack of sleep, eye strain, sinus infections, and certain foods or beverages. Stress is indeed a significant contributor to headaches, particularly tension headaches. When you're stressed, your body releases chemicals that can lead to muscle tension, especially in the neck and shoulders, which can trigger a headache. Managing stress through activities like exercise, meditation, or talking to a therapist can help reduce the frequency and intensity of stress-related headaches. [end of text]

### Qwen/Qwen2.5-Coder-7B

The `Qwen/Qwen2.5-Coder-7B` is a model specialized for coding tasks; It can generate code snippets, explain code, and even help debug.

- Coding tasks
- Detailed answers
- Fast

#### Test

```bash
$ llama-cli -hf Qwen/Qwen2.5-Coder-7B-Instruct-GGUF:Q8_0
Given an array of integers, write a javascript function, that moves all 0's to the end of the array. For example, given the input array [0, 1, 0, 3, 12], after calling your function, the array should be [1, 3, 12, 0, 0].
```

---

You can achieve this by using the built-in JavaScript function `filter()` to create a new array with all non-zero elements. Then, you can use the `concat()` function to append the array of zeros to the end of the new array. Here's an example implementation:

```javascript
function moveZerosToEnd(arr) {
  // Create a new array with all non-zero elements
  const nonZeroElements = arr.filter(el => el !== 0);
  
  // Create an array of zeros with the same length as the original array
  const zeros = new Array(arr.length - nonZeroElements.length).fill(0);
  
  // Concatenate the two arrays and return the result
  return nonZeroElements.concat(zeros);
}
```

Here's how you can use this function:

```javascript
let arr = [0, 1, 0, 3, 12];
moveZerosToEnd(arr);
// The array is now [1, 3, 12, 0, 0]
```

Note that this implementation creates a new array and does not modify the original array in place. If you want to modify the original array in place, you can use a different approach, such as using a `for` loop to iterate through the array and swap non-zero elements with the elements at the end of the array. Here's an example implementation:

```javascript
function moveZerosToEnd(arr) {
  // Iterate through the array and swap non-zero elements with the elements at the end
  let i = 0;
  for (let j = 0; j < arr.length; j++) {
    if (arr[j] !== 0) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      i++;
    }
  }
}
```

Here's how you can use this function:

```javascript
let arr = [0, 1, 0, 3, 12];
moveZerosToEnd(arr);
// The array is now [1, 3, 12, 0, 0]
```

---

### yasserrmd/Coder-GRPO-3B

The `yasserrmd/Coder-GRPO-3B` is another, smaller coding model; It will run faster but is likely to produce less accurate results, and does not have the same depth of knowledge.

- Coding tasks
- Detailed answers
- Very fast

#### Test

```bash
llama-cli -hf yasserrmd/Coder-GRPO-3B:Q8_0
Given an array of integers, write a javascript function, that moves all 0's to the end of the array. For example, given the input array [0, 1, 0, 3, 12], after calling your function, the array should be [1, 3, 12, 0, 0].
```

---

Certainly! You can achieve this by iterating through the array and moving non-zero elements to the front of the array while placing zeros at the end. Here's a JavaScript function that does that:

```javascript
function moveZerosToEnd(array) {
    let writeIndex = 0; // Index to write non-zero elements

    // Iterate through the array
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== 0) {
            // Move non-zero elements to the front
            array[writeIndex++] = array[i];
        }
    }

    // Fill the rest of the array with zeros
    for (let i = writeIndex; i < array.length; i++) {
        array[i] = 0;
    }
}

// Example usage:
const arr = [0, 1, 0, 3, 12];
moveZerosToEnd(arr);
console.log(arr); // Output: [1, 3, 12, 0, 0]
```

Explanation:

1. **Initialization**: We initialize `writeIndex` to 0. This index keeps track of the position where the next non-zero element should be placed.

2. **Move non-zero elements to the front**: The first loop iterates through the array. If the current element is non-zero, it moves it to the position specified by `writeIndex`, incrementing `writeIndex`.

3. **Fill the rest with zeros**: After all non-zero elements are moved to the front, the remaining positions (from `writeIndex` to the end of the array) are filled with zeros.

This function modifies the array in place and ensures that all zeros are moved to the end of the array while maintaining the order of non-zero elements.

### DavidAU/OpenAi-GPT-oss-20b

The `DavidAU/OpenAi-GPT-oss-20b` is a large model that can generate high-quality text; It does require a little more power than previous models, but still runs well on a modern laptop to be useful; I chose the "uncensored" variant mostly out of curiosity.

- Conversational
- Detailed answers
- Slower

#### Test

```bash
$ llama-cli -hf DavidAU/OpenAi-GPT-oss-20b-abliterated-uncensored-NEO-Imatrix-gguf:Q8_0
Tell me about the first time, man landed on the moon. When was it, who was involved, and what technology was used?
```

---

```
<|channel|>analysis<|message|>We need to answer: first time a man landed on the moon: date, who was involved, and what technology used. Provide concise but thorough answer. Likely referencing Apollo 11 mission. Provide date: July 20, 1969. People: Neil Armstrong, Buzz Aldrin (pilot and lunar module commander), Michael Collins (command module pilot). Technology: NASA's Apollo program, Saturn V rocket, Lunar Module LM-2 etc. Provide details: Saturn V launch on 20 July 1969 at 12:51:40 UTC from Cape Kennedy. Provide info about rocket, modules, etc. Use simple language. Provide some context: mission was part of Apollo program, built by NASA, etc. Provide answer in a paragraph or bullet points. Let's craft.

Need to incorporate "first time" phrase. Provide answer.<|start|>assistant<|channel|>final<|message|>
```

**First manned moon landing – Apollo 11 (July 20, 1969)**  

- **Date & time:** 20 July 1969, 12:51:40 UTC (launch from Cape Kennedy, Florida).  
- **Crew:**  
  - *Neil Armstrong* – Lunar Module commander and first man to walk on the moon.  
  - *Buzz Aldrin* – Lunar Module pilot, second man to walk on the moon.  
  - *Michael Collins* – Command Module pilot, stayed in orbit while Armstrong and Aldrin explored the surface.  
- **Technology used:**  
  - **Saturn V** launch vehicle (the most powerful rocket ever built, lifting the Apollo 11 spacecraft into space).  
  - **Command Module (CM) “Columbia”** – the spacecraft that carried the crew from Earth to the moon and back.  
  - **Lunar Module (LM) “Eagle”** – the lander that touched down on the moon and carried Armstrong and Aldrin to the surface.  

The mission was part of the U.S. NASA Apollo program. Armstrong and Aldrin walked on the moon for 2 hours 15 minutes, collecting samples, taking photographs, and leaving the first human-made object on the lunar surface. The mission achieved all of its objectives and marked the first time a human had landed on the moon.

### openai/whisper-large-v3-turbo

The `openai/whisper-large-v3-turbo` is a speech-to-text model that can transcribe audio files into text. It is quite accurate and can handle various accents and languages. 

- Speech-to-text
- Accurate
- Fast

Unfortunately this won't work with `llama-cli`, but you can easily set it up using python and pip:

```bash
guix shell python ffmpeg
mkdir /tmp/whisper
cd /tmp/whisper
python3 -m venv venv
source venv/bin/activate
pip3 install openai-whisper
```

#### Test

I downloaded a sample audio file from voiceover-samples.com (not an endorsement; just some random site), and ran it trough the model:

```bash
whisper ~/Downloads/ENG_UK_F_AlexiaK.mp3 --model turbo
```

---

```
[00:00.000 --> 00:07.000]  Topshop was founded in 1964 and since those humble beginnings in the basement of a department store,
[00:07.000 --> 00:12.000]  we've grown up and now have over 300 stores in the UK alone.
[00:12.000 --> 00:17.000]  We ship to more than 100 countries and our eclectic British style is known all over the world.
```

## Using llama.cpp models via API

Models like `Qwen/Qwen2.5-Coder-7B` work well in VScode and other IDEs and interfaces that support OpenAI-compatible APIs. You can use `llama-server` to expose a local API endpoint that these tools can connect to:

```bash
llama-server -hf Qwen/Qwen2.5-Coder-7B-Instruct-GGUF:Q8_0
``` 

### Built-in Web Interface

llama.cpp comes with a simple web interface that you can access at [http://127.0.0.1:8080/](http://127.0.0.1:8080/). It's a nice way to try out different parameters.

### Setup in VScode

Install an extention like [rjmacarthy.twinny](https://github.com/twinnydotdev/twinny) and add a new provider:

1. Manage twinny providers
2. Add a new provider
3. Select "Localhost OpenAI Compatible Server"
4. Set port to `8080`

### Usage with Curl

```bash
curl -X POST http://127.0.0.1:8080/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
  "model": "DavidAU/OpenAi-GPT-oss-20b-abliterated-uncensored-NEO-Imatrix-gguf:Q8_0",
  "messages": [
    {
      "role": "user",
      "content": "How far is the earth from the moon?"
    }
  ],
  "max_tokens": 4000
}'
```

---

```json
{
  "choices": [
  {
    "finish_reason":"stop",
    "index":0,
    "message": {
      "role":"assistant",
      "content":"<|channel|>analysis<|message|>We need to answer \"How far is the earth from the moon?\" Probably distance Earth to Moon. Typical average distance ~384,400 km. Provide approximate distance. Might mention variations: average distance ~384,400 km. Also mention elliptical orbit. Provide approximate distance.\n\nAlso possibly ask for the distance? Provide approximate distance, maybe in miles as well.\n\nThus answer: average distance between Earth and Moon is about 384,400 km (238,855 miles). Variation due to elliptical orbit from 356,500 km at perigee to 406,700 km at apogee. Provide context. Let's answer concisely.\n\n<|start|>assistant<|channel|>final<|message|>The average distance between the Earth and the Moon is about **384 400 km** (≈ 238 855 mi).  \nBecause the Moon’s orbit is elliptical, the distance varies: it ranges from roughly 356 500 km at perigee to 406 700 km at apogee."
    }
  }
],
"created":1757432201,
"model":"DavidAU/OpenAi-GPT-oss-20b-abliterated-uncensored-NEO-Imatrix-gguf:Q8_0",
"system_fingerprint":"b0-unknown",
"object":"chat.completion",
"usage":{
  "completion_tokens":204,
  "prompt_tokens":15,
  "total_tokens":219
},
"id":"chatcmpl-rgK1hpggqd2CkAY4tU48fDaqcQ3fpGFq",
"timings":{
  "prompt_n":15,
  "prompt_ms":945.132,
  "prompt_per_token_ms":63.008799999999994,
  "prompt_per_second":15.870798999504833,
  "predicted_n":204,
  "predicted_ms":33363.992,
  "predicted_per_token_ms":163.54898039215686,
  "predicted_per_second":6.114376241308295
  }
}
```

## Conclusion

There are many interesting models that run well on a recent laptop or desktop. Reasons vary: you may want to keep data private, work offline, or save a bit of money on third-party APIs. Standalone models also suit application development because they are predictable and unlikely to vanish overnight. That said, they are not a full replacement for more powerful options—especially for complex tasks.

For heavier workloads (and if you're not a power user), it's usually better to rent cloud GPUs. New hardware appears yearly, so investing in a local rig may not be worth it, particularly where electricity costs are high.

If you want to dive a little deeper, here are some useful resources:

- [List of compatible models on huggingface.co](https://huggingface.co/models?library=gguf&sort=trending)
- [llama.cpp Repository](https://github.com/ggml-org/llama.cpp)
- [llama.cpp guide](https://blog.steelph0enix.dev/posts/llama-cpp-guide/)