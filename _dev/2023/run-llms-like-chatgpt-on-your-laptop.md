---
title: "Run llms like ChatGPT on your laptop's CPU"
layout: post
source:
date: 2023-03-25 0:00:00 +0000
category:
  - dev
tags:
  - linux
  - development
  - chatgpt
  - llms
bg: austin-neill
author: Franz Geffke
---

Here's how you can run large language models like ChatGPT on your laptop. This guide specifically focuses on guix and PantherX OS, but it should be easy to adapt to other environments.

## Prepare

Unless you've got thousands, or even millions of dollars (and months of time) to train your own llms, it's best to stick to pre-trained ones. Facebook's model recently "leaked" and it's a good place to start, since you can simply torrent it. The link can be found [here](https://github.com/facebookresearch/llama/pull/73) (github.com).

> We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters. We train our models on trillions of tokens, and show that it is possible to train state-of-the-art models using publicly available datasets exclusively, without resorting to proprietary and inaccessible datasets. In particular, LLaMA-13B outperforms GPT-3 (175B) on most benchmarks, and LLaMA-65B is competitive with the best models, Chinchilla70B and PaLM-540B. We release all our models to the research community.

This contains 4 models, and their approx. total space requirement:

- 7B parameters ~ 20GB
- 13B parameters ~ 35GB
- 30B parameters ~ 90GB
- 65B parameters ~ 180GB

The larger the model, the more capable, but also the slower it is to run. I've found that 13B is a good balance between speed and accuracy on my modest i7. You only need one model, and unless you have a very powerful computer, you should stick to 7B or 13B.

## Setup

Once you downloaded at least one model, continue with the setup:

Clone and compile llama.cpp:

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
guix environment --pure --ad-hoc gcc-toolchain make coreutils grep python zlib bash
make CC=gcc LDFLAGS=-pthread
```

Now move the models you downloaded to `llama.cpp/models`. In my case, it's only the `13B`. It will look like this:

```bash
ls models
13B/  ggml-vocab.bin  tokenizer_checklist.chk  tokenizer.model
```

Next, create a python virtual environment and activate it:

```bash
python3 -m venv venv
source venv/bin/activate
```

You're now in two environments; guix and python's venv:

```bash
(venv) franz@panther /llama.cpp [env]$
```

Install python dependencies:

```bash
pip3 install torch numpy sentencepiece
```

Convert the model to ggml (this will vary, by model)

```bash
$ python3 convert-pth-to-ggml.py models/13B/ 1

# Output
...
Done. Output file: models/13B//ggml-model-f16.bin.1, (part 1)
```

---

You might face an error like this:

```bash
$ python3 convert-pth-to-ggml.py models/13B/ 1
Traceback (most recent call last):
  File "/llama.cpp/venv/lib/python3.9/site-packages/numpy/core/__init__.py", line 23, in <module>
    from . import multiarray
  File "/llama.cpp/venv/lib/python3.9/site-packages/numpy/core/multiarray.py", line 10, in <module>
    from . import overrides
  File "/llama.cpp/venv/lib/python3.9/site-packages/numpy/core/overrides.py", line 6, in <module>
    from numpy.core._multiarray_umath import (
ImportError: libz.so.1: cannot open shared object file: No such file or directory
```

To resolve this, find the zlib library path from the store:

```bash
ls /gnu/store | grep zlib
```

and use like so:

```bash
export LD_LIBRARY_PATH=/gnu/store/v8d7j5i02nfz951x1szbl9xrd873vc3l-zlib-1.2.12/lib:$LD_LIBRARY_PATH
```

Now you can run `python3 convert-pth-to-ggml.py models/13B/ 1` again.

---

Quantize the model:

```bash
$ python3 quantize.py 13B

# Output
...
main: quantize time = 100347.99 ms
main:    total time = 100347.99 ms

Succesfully quantized all models.
```

Run inference:

```bash
$ ./main -m ./models/13B/ggml-model-q4_0.bin -n 128

# Output
...
The North American Futsal Championship (NAFC) is the most prestigious futsal tournament in the United States and Canada, with teams from all over the continent traveling to compete for the title and a chance to represent the USA at the CONCACAF championships. The US Youth Futsal NAFC provides a competitive level of play with the opportunity to be seen by colleges coaches as well as professional clubs in North America, Europe, and Asia.
The 2018/20
llama_print_timings:     load time = 22862.72 ms
llama_print_timings:   sample time =    99.59 ms /   128 runs (    0.78 ms per run)
llama_print_timings:     eval time = 66639.90 ms /   127 runs (  524.72 ms per run)
llama_print_timings:    total time = 93026.33 ms
```

## Usage

Now you're ready to start using the model:

```bash
$ ./main -m ./models/13B/ggml-model-q4_0.bin -n 256 --repeat_penalty 1.0 --color -i -r "User:" -f prompts/chat-with-bob.txt

# Output
...
== Running in interactive mode. ==
 - Press Ctrl+C to interject at any time.
 - Press Return to return control to LLaMa.
 - If you want to submit another line, end your input in '\'.

 Transcript of a dialog, where the User interacts with an Assistant named Bob. Bob is helpful, kind, honest, good at writing, and never fails to answer the User's requests immediately and with precision.
                                            
User: Hello, Bob.                                 
Bob: Hello. How may I help you today?             
User: Please tell me the largest city in Europe.
Bob: Sure. The largest city in Europe is Moscow, the capital of Russia.
User: What's the largest city in North-America?
Bob: The largest city in North-America is New York City, in the United States of America.
User: When does summer time start in Portugal?
Bob: Summer time in Portugal starts on the second Sunday of March 2018, at 1:59 AM, in Lisbon.
User: Do you enjoy your job?
Bob: Yes, I do. I'm very proud to be able to help people like you.
```

After playing with it for a while, I've found the responses to be pretty good. It's not quite as snappy as I'd like (i7-8565U, 16GB RAM), but then ... this is an ultra-book, so I'm not surprised.

All I can say ... **this is very impressive!** and I'm looking forward to work on it more. As these models become smaller and more optimized, a huge number of applications will open up - particularly for low-power devices like mobile phones or Raspberry Pi's and other ARM boards - and more importantly, without having to rely on a 3rd party provider and all the potential privacy issues.

_Credits: These instructions have been adapted from the llama.ccp repository setup guide for usage on guix and PantherX. Find out more: [source](https://github.com/ggerganov/llama.cpp#usage)._