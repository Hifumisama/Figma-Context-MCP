# 🚀 Guide de déploiement

Guide complet pour déployer le serveur Figma MCP Backend en production.

---

## Table des matières

- [Déploiement automatique (Cloud Run)](#déploiement-automatique-google-cloud-run)
- [Configuration Docker](#configuration-docker)
- [Déploiement manuel](#déploiement-manuel)
- [Variables d'environnement de production](#variables-denvironnement-de-production)
- [Monitoring et logs](#monitoring-et-logs)
- [Rollback et maintenance](#rollback-et-maintenance)

---

## 🤖 Déploiement automatique (Google Cloud Run)

Le projet est configuré pour un **déploiement automatique** via Google Cloud Build.

### Déclencheur automatique

**Événement** : Push vers la branche `main`

**Actions automatiques** :
1. 🏗️ Build de l'image Docker
2. 📦 Push vers Artifact Registry
3. 🚀 Déploiement sur Cloud Run
4. ✅ Vérification de santé

### Configuration Cloud Build

Le fichier `cloudbuild.yaml` définit le pipeline :

```yaml
steps:
  # Build de l'image Docker
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'image-url', '.']

  # Push vers Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'image-url']

  # Déploiement sur Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    args: ['gcloud', 'run', 'deploy', '...']
```

### Variables Cloud Build

Les variables suivantes sont configurées :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `_SERVICE_NAME` | `figma-mcp-server` | Nom du service Cloud Run |
| `_REPO_NAME` | `figma-mcp-repo` | Nom du dépôt Artifact Registry |
| `_REGION` | `europe-west9` | Région de déploiement |

### Secrets configurés

Les secrets suivants sont injectés depuis Secret Manager :

- `figma-api-key:latest` → `FIGMA_API_KEY`
- `llm-service-account-email:latest` → Service account (metadata)
- `llm-service-account-key:latest` → Service account key (metadata)

> [!IMPORTANT]
> En production, ADC utilise automatiquement le compte de service du service Cloud Run. Aucune configuration supplémentaire n'est nécessaire.

---

## 🐳 Configuration Docker

### Dockerfile multi-stage

Le projet utilise un Dockerfile optimisé pour la production :

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 8080
CMD ["node", "dist/cli.js"]
```

**Avantages** :
- ✅ Image légère (Alpine Linux)
- ✅ Build optimisé en deux étapes
- ✅ Pas de code source dans l'image finale
- ✅ Sécurité renforcée

### Build local de l'image

```bash
# Build de l'image
docker build -t figma-mcp-backend .

# Test en local
docker run -p 8080:8080 \
  -e FIGMA_API_KEY=your_key \
  -e GOOGLE_CLOUD_PROJECT=your_project \
  figma-mcp-backend
```

---

## 🛠️ Déploiement manuel

### Quand utiliser le déploiement manuel ?

> [!WARNING]
> Le déploiement manuel n'est normalement **pas nécessaire** grâce au déclencheur automatique.

Utilisez-le uniquement pour :
- 🧪 Tester un déploiement avant de merger sur `main`
- 🔧 Déployer une version spécifique (hotfix)
- 🐛 Déboguer un problème de déploiement

### Commande de déploiement manuel

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=COMMIT_SHA='latest' \
  --region=europe-west9 .
```

### Déploiement direct sur Cloud Run (sans Cloud Build)

```bash
# 1. Build de l'image
docker build -t gcr.io/YOUR_PROJECT/figma-mcp-backend .

# 2. Push vers Container Registry
docker push gcr.io/YOUR_PROJECT/figma-mcp-backend

# 3. Déploiement sur Cloud Run
gcloud run deploy figma-mcp-server \
  --image gcr.io/YOUR_PROJECT/figma-mcp-backend \
  --platform managed \
  --region europe-west9 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT \
  --set-secrets FIGMA_API_KEY=figma-api-key:latest
```

---

## ⚙️ Variables d'environnement de production

### Configuration minimale

```bash
# Variables obligatoires
FIGMA_API_KEY=<from_secret_manager>
GOOGLE_CLOUD_PROJECT=your_project_id

# Variables optionnelles (avec valeurs par défaut)
PORT=8080
GOOGLE_CLOUD_LOCATION=us-central1
OUTPUT_FORMAT=json
ENABLE_AI_RULES=false
```

### Configuration via Secret Manager

**Créer un secret** :

```bash
echo -n "your_figma_api_key" | gcloud secrets create figma-api-key \
  --data-file=- \
  --replication-policy=automatic
```

**Donner accès au service Cloud Run** :

```bash
gcloud secrets add-iam-policy-binding figma-api-key \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### Configuration via Cloud Run

**Via la console** :
1. Aller sur Cloud Run → Votre service
2. Onglet "Variables et secrets"
3. Ajouter les variables et secrets

**Via gcloud** :

```bash
gcloud run services update figma-mcp-server \
  --update-env-vars GOOGLE_CLOUD_PROJECT=your_project \
  --update-secrets FIGMA_API_KEY=figma-api-key:latest \
  --region europe-west9
```

---

## 📊 Monitoring et logs

### Logs Cloud Run

**Voir les logs en temps réel** :

```bash
gcloud run services logs read figma-mcp-server \
  --region=europe-west9 \
  --follow
```

**Filtrer les logs par erreur** :

```bash
gcloud run services logs read figma-mcp-server \
  --region=europe-west9 \
  --filter="severity>=ERROR"
```

### Métriques Cloud Monitoring

Les métriques suivantes sont automatiquement collectées :

- **Requêtes** : Nombre de requêtes par seconde
- **Latence** : Temps de réponse moyen
- **Erreurs** : Taux d'erreur 4xx/5xx
- **Instances** : Nombre d'instances actives
- **CPU/Mémoire** : Utilisation des ressources

**Créer une alerte** :

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=60s
```

### Health check

Le serveur expose un endpoint de santé :

```bash
curl https://your-service-url.run.app/health
```

Réponse attendue : `{"status":"ok"}`

---

## 🔄 Rollback et maintenance

### Rollback vers une version précédente

**Lister les révisions** :

```bash
gcloud run revisions list \
  --service=figma-mcp-server \
  --region=europe-west9
```

**Rollback vers une révision** :

```bash
gcloud run services update-traffic figma-mcp-server \
  --to-revisions=figma-mcp-server-00042-xyz=100 \
  --region=europe-west9
```

### Canary deployment (déploiement progressif)

```bash
# Déployer une nouvelle version avec 10% du trafic
gcloud run services update-traffic figma-mcp-server \
  --to-revisions=figma-mcp-server-00043-new=10,figma-mcp-server-00042-old=90 \
  --region=europe-west9

# Si tout va bien, basculer 100% du trafic
gcloud run services update-traffic figma-mcp-server \
  --to-latest \
  --region=europe-west9
```

### Maintenance programmée

**Mode maintenance** (rediriger vers une page de maintenance) :

```bash
# Option 1: Réduire à 0 instance (économie maximale)
gcloud run services update figma-mcp-server \
  --min-instances=0 \
  --max-instances=0 \
  --region=europe-west9

# Option 2: Afficher un message de maintenance
# (nécessite d'implémenter un mode maintenance dans le code)
gcloud run services update figma-mcp-server \
  --update-env-vars MAINTENANCE_MODE=true \
  --region=europe-west9
```

---

## 🏗️ Environnement de production

### Configuration recommandée

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Port** | 8080 | Port standard Cloud Run |
| **Région** | europe-west9 | Europe (Paris) |
| **Min instances** | 0 | Scale to zero (économie) |
| **Max instances** | 10 | Limite de scaling |
| **CPU** | 1 | 1 vCPU |
| **Mémoire** | 512Mi | 512 MB RAM |
| **Timeout** | 300s | 5 minutes |
| **Concurrency** | 80 | Requêtes par instance |

### Optimisations de performance

**Activer le HTTP/2** :

```bash
gcloud run services update figma-mcp-server \
  --use-http2 \
  --region=europe-west9
```

**Activer le CDN (si API publique)** :

```bash
gcloud compute backend-services update BACKEND_SERVICE \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC
```

**Configurer le scaling** :

```bash
gcloud run services update figma-mcp-server \
  --min-instances=1 \        # Garder 1 instance chaude
  --max-instances=20 \       # Scaling jusqu'à 20 instances
  --concurrency=100 \        # 100 requêtes par instance
  --region=europe-west9
```

---

## 🔒 Sécurité en production

### Bonnes pratiques

1. **Utiliser Secret Manager** pour toutes les clés sensibles
2. **Activer l'authentification** si l'API n'est pas publique
3. **Configurer CORS** correctement
4. **Activer les logs d'audit** Cloud Logging
5. **Configurer des alertes** de monitoring
6. **Limiter le rate limiting** pour éviter les abus

### Authentifier les requêtes (optionnel)

```bash
# Activer l'authentification IAM
gcloud run services update figma-mcp-server \
  --no-allow-unauthenticated \
  --region=europe-west9
```

Puis pour appeler l'API :

```bash
# Obtenir un token
TOKEN=$(gcloud auth print-identity-token)

# Faire une requête authentifiée
curl -H "Authorization: Bearer $TOKEN" \
  https://your-service-url.run.app/api/audit-figma
```

---

## 📚 Ressources complémentaires

- [Documentation Cloud Run](https://cloud.google.com/run/docs)
- [Best practices Cloud Run](https://cloud.google.com/run/docs/tips)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Build](https://cloud.google.com/build/docs)

**Retour** : [📖 README principal](../README.md)
