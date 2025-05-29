# Stage 1: Build the applicationFROM node:18-alpine AS builder# Set working directoryWORKDIR /app# Copy package filesCOPY package*.json ./# Install all dependencies (including devDependencies needed for build)RUN npm ci# Copy all project filesCOPY . .# Set build-time environment variablesARG NEXT_PUBLIC_FIREBASE_API_KEYARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAINARG NEXT_PUBLIC_FIREBASE_PROJECT_IDARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKETARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_IDARG NEXT_PUBLIC_FIREBASE_APP_IDENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEYENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAINENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_IDENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKETENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_IDENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID# Build the Next.js applicationRUN npm run build# Stage 2: Serve with NginxFROM nginx:alpine# Copy built files from builderCOPY --from=builder /app/out /usr/share/nginx/html# Copy nginx config for SPACOPY nginx.conf /etc/nginx/conf.d/default.conf# Expose port 80EXPOSE 80# Start NginxCMD ["nginx", "-g", "daemon off;"]# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage - serve static files
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]