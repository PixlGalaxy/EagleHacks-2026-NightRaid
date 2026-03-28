# 1: Frontend Build
FROM node:18-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# 2: Backend Base
FROM python:3.11-alpine AS build-backend
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./

# 3: Final Image Nginx and Python
FROM python:3.11-alpine
WORKDIR /app

# Install Nginx and bash for shell script
RUN apk add --no-cache nginx bash

# Copy Frontend to Nginx Dir
COPY --from=build-frontend /app/frontend/dist /usr/share/nginx/html

# Copy Nginx Config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy Backend
COPY --from=build-backend /app/backend /app/backend
WORKDIR /app/backend
RUN chmod +x app.py

# Copy Python dependencies from backend stage
COPY --from=build-backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Expose Ports
EXPOSE 5000

# Start Commands
CMD ["sh", "-c", "python /app/backend/app.py & nginx -g 'daemon off;'"]
