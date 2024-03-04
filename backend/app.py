from flask import Flask, request
from openai import OpenAI

import os
import time

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Waits for the run to complete
def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id,
        )
        time.sleep(0.5)
    return run

@app.route("/api/audio", methods=["POST"])
def hello_world():
    # Get audio data from client
    audio_data = request.get_data(cache=False) 

    # Write audio data to file
    file_name = 'output_file.webm'

    with open(file_name, 'wb') as webm_file:
        webm_file.write(audio_data)

    app.logger.info(f'{file_name} successfully written.')

    # Transcribe audio file
    audio_file= open(file_name, "rb")
    transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)

    transcript_text = transcript.text

    app.logger.info("Transcribed text")

    # Get assistant and create a new thread
    assistant = client.beta.assistants.retrieve(assistant_id="asst_JBoaod4vTwUk0eTuEQcjhaTt")

    thread = client.beta.threads.create()

    # Create a new message in the thread with the transcribed text
    client.beta.threads.messages.create(
      thread_id=thread.id,
      role="user",
      content=transcript_text
    )

    app.logger.info("Starting run")

    # Run the assistant to parse the users request
    run = client.beta.threads.runs.create(
      thread_id=thread.id,
      assistant_id=assistant.id,
    )

    run = wait_on_run(run, thread)

    # Get the assistant's response, which is the instruction
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    instruction = messages.data[0].content[0].text.value

    # Return the instruction to the client
    return instruction
