# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if you have it) to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application's source code to the container
COPY . .

# Define the command to run your Node.js application
CMD ["node", "index.js"]
