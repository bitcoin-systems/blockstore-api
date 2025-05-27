FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Compile the main app
RUN deno cache main.ts

# API_KEY env setting
ARG API_KEY
ENV API_KEY=${API_KEY}

# Run the app
CMD ["deno", "run", "--allow-net", "--unstable-kv", "--allow-env", "main.ts"]
