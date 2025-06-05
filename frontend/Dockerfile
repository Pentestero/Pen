# Utilisez une image Node.js pour le build stage
FROM node:20-alpine as builder

# Définissez le répertoire de travail
WORKDIR /app

# Copiez package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installez les dépendances
# Utilisation de --legacy-peer-deps pour éviter certains avertissements/erreurs de dépendances croisées si elles surviennent
RUN npm install --legacy-peer-deps

# Copiez le reste du code source du frontend
COPY . .

# Construisez l'application React en production
# La commande 'npm run build' va créer un dossier 'build' avec les fichiers statiques
RUN npm run build

# Deuxième stage : Utilisez une image Nginx légère pour servir l'application
# Nginx est un serveur web performant pour les fichiers statiques
FROM nginx:alpine

# Copiez les fichiers de build (statiques) de React depuis le stage 'builder'
# vers le répertoire de service par défaut de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copiez notre fichier de configuration Nginx personnalisé
# Ce fichier sera créé à l'étape suivante (3.2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposez le port 80, qui est le port par défaut de Nginx
EXPOSE 80

# Commande par défaut pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
