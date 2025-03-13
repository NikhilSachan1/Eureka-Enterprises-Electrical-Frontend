# ---- Development Stage ----
    FROM node:22.14.0-alpine3.21 AS dev

    # Set working directory inside container
    WORKDIR /app
    
    # Copy package files first (better caching)
    COPY package.json package-lock.json ./
    
    # Install dependencies
    RUN npm ci
    
    # Install Angular CLI locally (avoid global installation)
    RUN npm install -g @angular/cli@19
    
    # Copy the entire project
    COPY . .
    
    # Expose port 4200 for Angular live server
    EXPOSE 4200
    
    # Start the Angular app in development mode
    CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
    