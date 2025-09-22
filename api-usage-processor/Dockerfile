FROM node:20-alpine

# Install necessary packages
RUN apk add --no-cache postgresql-client

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
