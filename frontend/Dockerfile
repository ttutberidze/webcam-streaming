# build stage
FROM node:16-alpine as builder
# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json .
COPY package-lock.json .
# Copy app files
COPY . .
RUN npm install

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:latest as build-stage
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 3000
# Start nginx
CMD ["nginx", "-g", "daemon off;"]