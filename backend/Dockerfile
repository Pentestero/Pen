# Ligne 1: Stage de construction (utilise une image avec Maven et JDK)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

# Ligne 3: Définissez le répertoire de travail dans le conteneur pour le build stage
WORKDIR /app

# Ligne 5: Copiez le fichier pom.xml et téléchargez les dépendances Maven
# Cela permet à Docker de mettre en cache cette étape si le pom.xml ne change pas
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Ligne 9: Copiez le reste du code source de l'application
COPY src ./src

# Ligne 11: Copiez le dossier .mvn pour s'assurer que le wrapper Maven est disponible si nécessaire
COPY .mvn .mvn

# Ligne 13: Construisez l'application Spring Boot en tant que JAR exécutable
# -DskipTests: pour sauter l'exécution des tests unitaires pendant le build Docker
RUN mvn clean install -DskipTests

# Ligne 16: Deuxième stage : Image JRE plus légère pour l'exécution finale
FROM eclipse-temurin:17-jre-alpine

# Ligne 18: Définissez le répertoire de travail dans le conteneur pour l'exécution
WORKDIR /app

# Ligne 20: Copiez le JAR exécutable depuis le stage de construction ('builder')
COPY --from=builder /app/target/*.jar app.jar

# Ligne 22: Exposez le port sur lequel l'application Spring Boot écoutera
EXPOSE 8080

# Ligne 24: Commande pour démarrer l'application.
# Elle attend que le service 'db' (base de données) soit disponible sur le port 5432
# avant de lancer l'application Java.
CMD ["sh", "-c", "until nc -z db 5432; do echo 'Waiting for database...'; sleep 2; done; java -jar app.jar"]
