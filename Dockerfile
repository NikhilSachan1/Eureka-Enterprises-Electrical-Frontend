# ---- Build Stage ----
    FROM node:22.14.0-alpine3.21 AS build

    # Set working directory inside container
    WORKDIR /app
    
    # Copy only package files first for better caching
    COPY package.json package-lock.json ./
    
    # Install dependencies
    RUN npm install
    
    # Install Angular CLI (Version 19) globally (Avoid if it's already in package.json)
    RUN npm install -g @angular/cli@19
    
    # Copy the entire project
    COPY . .
    
    # Expose port 4200 for Angular development server
    EXPOSE 4200
    
    # Start the Angular application in development mode
    CMD ["npm", "start", "--", "--host", "0.0.0.0"]

    