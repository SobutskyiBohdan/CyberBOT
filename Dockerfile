# Use the official Node.js 18 image
FROM node:18-alpine

# Install ffmpeg for audio processing
RUN apk add --no-cache ffmpeg

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port (matching your HTTP server)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]