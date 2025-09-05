# --- 1. Build Stage ---
# On utilise une image Node.js 18 pour la phase de construction
FROM node:18-slim AS builder

# On définit le répertoire de travail
WORKDIR /app

# On installe pnpm
RUN npm install -g pnpm

# On copie les fichiers de dépendances et on les installe
# On copie uniquement ce qui est nécessaire pour l'installation pour profiter du cache Docker
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# On copie le reste des fichiers du projet
COPY . .

# On construit l'application TypeScript en JavaScript
RUN pnpm run build


# --- 2. Production Stage ---
# On repart d'une image Node.js 18 propre pour la production
FROM node:18-slim AS production

# On définit le répertoire de travail
WORKDIR /app

# On installe pnpm
RUN npm install -g pnpm

# On copie les fichiers de dépendances et on installe uniquement les dépendances de production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# On copie les fichiers compilés depuis la phase de build
COPY --from=builder /app/dist ./dist

# Variables d'environnement par défaut
# Cloud Run injecte une variable d'environnement PORT, qui sera utilisée par l'application.
ENV PORT=8080
ENV OUTPUT_FORMAT=json
ENV NODE_ENV=production

# Exposition du port
EXPOSE 8080

# La commande pour démarrer le serveur
# On utilise le script "start:http" qui est plus sémantique
CMD [ "node", "dist/cli.js" ]
