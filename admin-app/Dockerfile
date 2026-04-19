# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build for web using expo export
RUN npx expo export --platform web

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config if needed, or use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
