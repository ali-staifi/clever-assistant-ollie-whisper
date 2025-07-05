# Configuration Automatique Ollama CORS

Ce projet inclut une configuration automatique pour Ollama permettant d'éviter les erreurs CORS lors de l'utilisation de l'API depuis une application web.

## 🚀 Configuration Rapide

### Option 1: Via l'Interface Utilisateur
1. Ouvrez l'application et allez dans les **Paramètres**
2. Dans la section **Configuration Automatique Ollama**, cliquez sur **Auto-Config**
3. Suivez les instructions affichées selon votre système d'exploitation

### Option 2: Via Scripts NPM (Recommandé)

Ajoutez ces scripts à votre `package.json`:

```json
{
  "scripts": {
    "setup-ollama": "node scripts/setup-ollama.js",
    "dev:full": "npm run setup-ollama & npm run dev",
    "ollama:start": "node scripts/setup-ollama.js",
    "ollama:stop": "pkill -f ollama || taskkill /F /IM ollama.exe"
  }
}
```

Puis exécutez:
```bash
npm run setup-ollama
```

### Option 3: Configuration Manuelle

#### Windows (PowerShell)
```powershell
$env:OLLAMA_ORIGINS="*"
$env:OLLAMA_HOST="0.0.0.0:11434"
ollama serve
```

#### Windows (CMD)
```cmd
set OLLAMA_ORIGINS=*
set OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

#### macOS/Linux
```bash
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"
ollama serve
```

## 🔧 Variables d'Environnement

| Variable | Valeur | Description |
|----------|--------|-------------|
| `OLLAMA_ORIGINS` | `"*"` | Autorise toutes les origines CORS |
| `OLLAMA_HOST` | `"0.0.0.0:11434"` | Écoute sur toutes les interfaces réseau |

## 📋 Vérification de la Configuration

L'interface utilisateur affiche en temps réel:
- ✅ **Serveur**: État du serveur Ollama
- ✅ **CORS**: Configuration CORS active
- ✅ **Host**: Configuration d'écoute réseau

## 🐛 Dépannage

### Erreur "Connection refused"
```bash
# Vérifier si Ollama est installé
ollama --version

# Installer Ollama si nécessaire
# Windows: Télécharger depuis https://ollama.ai/
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh
```

### Erreur CORS
```bash
# Vérifier les variables d'environnement
echo $OLLAMA_ORIGINS  # doit afficher "*"
echo $OLLAMA_HOST     # doit afficher "0.0.0.0:11434"
```

### Port déjà utilisé
```bash
# Arrêter les processus Ollama existants
# Windows
taskkill /F /IM ollama.exe

# macOS/Linux
pkill -f ollama
```

## 📁 Structure des Fichiers

```
scripts/
├── setup-ollama.js           # Script de configuration automatique
src/
├── services/ollama/
│   └── OllamaConfigService.ts # Service de configuration
└── components/settings/
    └── OllamaAutoConfig.tsx   # Interface de configuration
```

## 🔍 Test de la Configuration

Vous pouvez tester manuellement la configuration:

```bash
# Test de base
curl http://localhost:11434/api/tags

# Test CORS
curl -H "Origin: http://localhost:8080" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:11434/api/tags
```

## 📚 Ressources

- [Documentation officielle Ollama](https://github.com/ollama/ollama)
- [Guide des variables d'environnement](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server)
- [LocalSite-ai - Inspiration pour cette implémentation](https://github.com/weise25/LocalSite-ai)

## 🤝 Contribution

Cette implémentation s'inspire du projet [LocalSite-ai](https://github.com/weise25/LocalSite-ai.git) pour la configuration automatique CORS d'Ollama.