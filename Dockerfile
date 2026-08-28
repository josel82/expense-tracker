# Stage 1: Build the React app
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the custom build from the first stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# --- ADDITIONS FOR RUNTIME ENV INJECTION ---
# Copy your entrypoint script into the container
COPY docker-entrypoint /docker-entrypoint
RUN chmod +x /docker-entrypoint

# Expose port 80
EXPOSE 80

# Use the entrypoint script to write the config file, then start Nginx
ENTRYPOINT ["/docker-entrypoint"]
CMD ["nginx", "-g", "daemon off;"]
