# Build aşaması
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve aşaması
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
