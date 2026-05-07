FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "app.js"]
