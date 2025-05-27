FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Compile the main app
RUN deno cache main.ts

# API_KEY env setting

# Run the app
CMD ["deno", "run", "--allow-net", "--unstable-kv", "--allow-env", "main.ts"]
