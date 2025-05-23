FROM python:3

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

CMD [ "sh","-c","python raspa.py & python aninhamento_de_raspagem.py && wait"]