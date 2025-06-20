import sys
import os
import whisper
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from gtts import gTTS

audio_path = sys.argv[1]
target_lang = sys.argv[2]
output_path = sys.argv[3]

# Load models (ensure this runs fast by loading once)
whisper_model = whisper.load_model("base")
tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indictrans2-en-indic-1B", trust_remote_code=True, use_fast=False)
translator = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-en-indic-1B", trust_remote_code=True)

# Transcribe audio
result = whisper_model.transcribe(audio_path)
english_text = result["text"]

# Translate to target language
input_text = f"__indic__{target_lang} {english_text}"
inputs = tokenizer(input_text, return_tensors="pt")
translated = translator.generate(**inputs)
translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)

# Text to speech
tts = gTTS(translated_text, lang=target_lang)
tts.save(output_path)
