FROM node:21-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy built application
COPY dist ./dist

EXPOSE 80

CMD [ "node", "dist/main.js" ]