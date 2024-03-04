from flask import Flask, request
from openai import OpenAI
import os

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/api/audio", methods=["POST"])
def hello_world():
    audio_data = request.get_data(cache=False)

    byte_string = audio_data 

    file_name = 'output_file.webm'

    with open(file_name, 'wb') as webm_file:
        webm_file.write(byte_string)

    app.logger.info(f'{file_name} successfully written.')

    audio_file= open(file_name, "rb")
    transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)

    '''
        Ideas:
        - Use GPT-4 custom prompt to pull out what the user wants to do from their message and then use
        some kind of messaging system in order to send that request to the client, where it would perform
        said request
    '''

    return transcript.text
