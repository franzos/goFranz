---
title: "Develop your own LLM like ChatGPT with Tensorflow and Keras"
layout: post
source:
date: 2023-04-05 0:00:00 +0000
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

It's never been easier to start experimenting with your own (large) language model, even without powerful hardware or specialized operating system. In this post, I'll show you how to get started with Tensorflow and Keras, and how to train your own LLM.

## Prepare

At minimum you'll need:

1. A computer with a relatively powerful CPU (~last 5 years)
2. A set of data which you'd like to train on
3. A lot of time, depending on the amount of data and training parameters

### Get data

How much data you need, largely depends on your use-case and the quality of responses that you expect. There's naturally a significant difference between a narrow use-case (where the expected in-, and out-put is more predictable), versus a general use-case (where the model needs to be able to handle a large variety of prompts).

- You can find large data sets on the internet, but they are hard to experiment with
- You could export your own chat history, and use that as a starting point
- Another idea would be to scrape your email, a blog you run, or a book you've written; I'm sure you'll think of something better ;)

Below we will explore a use-case, where two friends have a short conversation about a limited number of topics. The goal here is not accuracy or novelty, but much rather the most simplistic, effective example that you can easily take apart, or change - and more importantly, run on your modest PC.

## Setup

Below instructions are for Guix / PantherX OS but given the python-base, you should be able to replicate this easily on any OS.

Create a virtual environment and activate it (guix & python):

```bash
python3 -m venv venv
guix environment --pure --ad-hoc gcc-toolchain make coreutils grep python zlib bash
source venv/bin/activate
```

Install Tensorflow:

```bash
pip3 install tensorflow tensorrt
```

You might have to additionally export the path to `libz.so.1` library (path will vary):

```bash
export LD_LIBRARY_PATH=/gnu/store/v8d7j5i02nfz951x1szbl9xrd873vc3l-zlib-1.2.12/lib:$LD_LIBRARY_PATH
```

## Code

You'll just need to create two python files; for ex.:

- `process.py`: will contain the runtime logic
- `data.py`: our source data; this is really just an example

Please don't store your own data in python files; This is just for demonstration.

### Runtime logic

You can pretty much copy-paste this. I've commented important parts of the code, so you can easily follow what's going on, and start playing with the parameters.

```python
# process.py

import numpy as np
import tensorflow as tf

Tokenizer = tf.keras.preprocessing.text.Tokenizer
pad_sequences = tf.keras.preprocessing.sequence.pad_sequences
Sequential = tf.keras.models.Sequential
Embedding = tf.keras.layers.Embedding
SimpleRNN = tf.keras.layers.SimpleRNN
Dense = tf.keras.layers.Dense
LSTM = tf.keras.layers.LSTM
Dropout = tf.keras.layers.Dropout

# Load your text data
# Here I'm simply loading a relative file which contains the array of data (data.py)
from data import text_data_arr

# Tokenize the text
tokenizer = Tokenizer(char_level=True, lower=True)
tokenizer.fit_on_texts(text_data_arr)

# Convert text to sequences
sequences = tokenizer.texts_to_sequences(text_data_arr)[0]

# Prepare input and target sequences
input_sequences = []
output_sequences = []

sequence_length = 100
for i in range(len(sequences) - sequence_length):
    input_sequences.append(sequences[i:i + sequence_length])
    output_sequences.append(sequences[i + sequence_length])

input_sequences = np.array(input_sequences)
output_sequences = np.array(output_sequences)

vocab_size = len(tokenizer.word_index) + 1

# Define the model architecture:
model = Sequential([
    Embedding(vocab_size, 32, input_length=sequence_length),
    LSTM(128, return_sequences=True, dropout=0.2, recurrent_dropout=0.2),
    LSTM(128, dropout=0.2, recurrent_dropout=0.2),
    Dense(vocab_size, activation="softmax"),
])

model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
model.summary()

# Train the model
epochs = 100  # Increase the number of epochs to give the model more time to learn
batch_size = 32
model.fit(input_sequences, output_sequences, epochs=epochs, batch_size=batch_size)

# Evaluate the model and generate text:
def generate_text(seed_text, model, tokenizer, sequence_length, num_chars_to_generate):
    generated_text = seed_text

    for _ in range(num_chars_to_generate):
        token_list = tokenizer.texts_to_sequences([generated_text])
        token_list = pad_sequences(token_list, maxlen=sequence_length, padding="pre")
        predicted_probs = model.predict(token_list, verbose=0)
        predicted_token = np.argmax(predicted_probs, axis=-1)[0]  # Get the index of the predicted token

        output_word = ""
        for word, index in tokenizer.word_index.items():
            if index == predicted_token:
                output_word = word
                break

        generated_text += output_word

    return generated_text

seed_text = "John: How are you, Mike?"

generated_text = generate_text(seed_text, model, tokenizer, sequence_length, num_chars_to_generate=800)
print(generated_text)
```

### Data

The data looks like this; I basically had ChatGPT generate a few very similar conversations to improve the effectivity of this demonstration:

```python
# data.py

text_data_arr = [
    '''Mike: Hi Sarah, long time no see. How are you?
    Sarah: Hi Mike, I'm great. You?
    Mike: It's a beautiful day; couldn't be better.
    Sarah: Yeah, the weather is really nice today. Have you been up to anything interesting lately?
    Mike: Actually, I went on a hiking trip last weekend. It was amazing. I highly recommend it.
    Sarah: That sounds like a lot of fun. Where did you go?
    Mike: We went to the mountains up north. The scenery was breathtaking.
    Sarah: I'll have to plan a trip up there sometime. Thanks for the recommendation!
    Mike: No problem. So, how about you? What have you been up to?
    Sarah: Not too much, just been busy with work. But I'm hoping to take a vacation soon.
    Mike: That sounds like a good idea. Any ideas on where you want to go?
    Sarah: I'm thinking about going to the beach. I could use some time in the sun and sand.
    Mike: Sounds like a great plan. I hope you have a good time.
    Sarah: Thanks, Mike. It was good seeing you.
    Mike: Same here, Sarah. Take care!
    ''',
        '''Jack: Hey Emily! How's it going?
    Emily: Hey Jack! It's going pretty well. How about you?
    Jack: Not bad, thanks for asking. So, what have you been up to lately?
    Emily: Well, I recently started taking a painting class, which has been really fun. What about you?
    Jack: That's cool. I've been trying to get into running. It's been tough, but I'm starting to enjoy it.
    ...
    '''
]
```

You can download the whole file, to copy-paste [here](/assets/data/develop-your-own-llm-like-chatgpt-on-tensorflow.txt).

## Run

Now it's time to run the code; A couple of notes before we start:

- As noted, this will run on your CPU. My Laptop does not support CUDA.
- On an i7-8565U with 16GB RAM this takes approx. ~ 5 minutes

```bash
$ python3 process.py 
2023-04-05 15:44:26.050176: I tensorflow/tsl/cuda/cudart_stub.cc:28] Could not find cuda drivers on your machine, GPU will not be used.
2023-04-05 15:44:26.098251: I tensorflow/tsl/cuda/cudart_stub.cc:28] Could not find cuda drivers on your machine, GPU will not be used.
2023-04-05 15:44:26.098656: I tensorflow/core/platform/cpu_feature_guard.cc:182] This TensorFlow binary is optimized to use available CPU instructions in performance-critical operations.
To enable the following instructions: AVX2 FMA, in other operations, rebuild TensorFlow with the appropriate compiler flags.
2023-04-05 15:44:26.761284: W tensorflow/compiler/tf2tensorrt/utils/py_utils.cc:38] TF-TRT Warning: Could not find TensorRT
Model: "sequential"
_________________________________________________________________
 Layer (type)                Output Shape              Param #   
=================================================================
 embedding (Embedding)       (None, 100, 32)           1312      
                                                                 
 lstm (LSTM)                 (None, 100, 128)          82432     
                                                                 
 lstm_1 (LSTM)               (None, 128)               131584    
                                                                 
 dense (Dense)               (None, 41)                5289      
                                                                 
=================================================================
Total params: 220,617
Trainable params: 220,617
Non-trainable params: 0
_________________________________________________________________
Epoch 1/100
30/30 [==============================] - 9s 167ms/step - loss: 3.2718 - accuracy: 0.2094
Epoch 2/100
30/30 [==============================] - 4s 121ms/step - loss: 2.9960 - accuracy: 0.2190
Epoch 3/100
30/30 [==============================] - 5s 181ms/step - loss: 2.9637 - accuracy: 0.2190

...

30/30 [==============================] - 4s 139ms/step - loss: 0.1062 - accuracy: 0.9915
Epoch 99/100
30/30 [==============================] - 4s 146ms/step - loss: 0.1100 - accuracy: 0.9925
Epoch 100/100
30/30 [==============================] - 4s 149ms/step - loss: 0.1056 - accuracy: 0.9904

John: How are you, Mike? iny ideas on where you want to go?
    sarah: i'm thinking about going to the beach. i could use some time in the sun and sand.
    mike: sounds like a great plan. i hope you have a good time.
    sarah: thanks, mike. it was good seeing you.
    mike: same here, sarah. take care!
    mike: we went to the mountains up north. the scenery was breathtaking.
    sarah: i'll have to plan a trip up there sometime. thanks for the recommendation!
    mike: no problem. so, how about you? what have you been up to?
    sarah: not too much, just been busy with work. but i'm hoping to take a vacation soon.
    mike: that sounds like a good idea. any ideas on where you want to go?
    sarah: i'm thinking about going to the beach. i could use some time in the sun and sand.
    mike: sounds like a great p
```

You can already see, it's hardly perfect or even good.

_Everything after `John: How are you, Mike?` is generated by the model_

1. It did not manage to pick the correct pattern (John talking to Mike)
2. There's problems with capitalization and punctuation
3. It's not very coherent

Most of these problems can be attributed to my limited data set - less than 350 lines of text; but it's just enough to start experimenting with it, and quick enough to train.

### Next steps

From here, the most obvious options are:

1. Provide a larger, or different data set for training
2. Adjust the seed text and provide more context `seed_text = "John: ...`
3. Increase, or decrease the amount of training `epochs = 100`
4. Play with the model params or change the architecture
5. Learn, learn, learn

```python
model = Sequential([
    # Embedding layer that maps each word in the input sequence to a dense vector
    Embedding(vocab_size, 32, input_length=sequence_length),
    # First LSTM layer with 128 units, returning a sequence of outputs for each time step
    LSTM(128, return_sequences=True, dropout=0.2, recurrent_dropout=0.2),
    # Second LSTM layer with 128 units, returning only the final output for the whole sequence
    LSTM(128, dropout=0.2, recurrent_dropout=0.2),
    # Dense layer with a softmax activation, outputting a probability distribution over the vocabulary
    Dense(vocab_size, activation="softmax"),
])
```

If you're new to ML, most of this will probably be incomprehensible, but I think it's a surprisingly good starting point. Additionally, you might want to checkout Keras extensive documentation [https://keras.io/guides/](https://keras.io/guides/) and other fantastic examples all around machine learnling: [https://keras.io/examples/](https://keras.io/examples/).

Good luck, fellow earthling.