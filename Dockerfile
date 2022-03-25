#------------------------------------------------------------------
FROM node:16.14.0 as builder

# Create and change to the 'project' directory.
WORKDIR /project

# Install project dependencies.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source code.
COPY . .

# Build browser bundles.
RUN npm run build

#-------------------------------------------------------------------
FROM nginx:1.21.6-alpine

# Copy the files to the production image from the builder stage.
COPY --from=builder /project/dist /project/dist
# NGINX configuration to serve the SPA.
COPY --from=builder /project/nginx/default.conf /etc/nginx/conf.d/default.conf

#-------------------------------------------------------------------
