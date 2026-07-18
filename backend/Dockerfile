FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if needed (e.g. gcc for asyncpg/psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Set default port to 8080 (standard for Cloud Run / Render)
EXPOSE 8080

# Run uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
