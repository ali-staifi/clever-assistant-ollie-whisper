# Scripts NPM Recommandés pour Ollama

Ajoutez ces scripts à votre `package.json` pour une configuration automatique d'Ollama:

## Scripts à Ajouter

```json
{
  "scripts": {
    "setup-ollama": "node scripts/setup-ollama.js",
    "dev:full": "concurrently \"npm run setup-ollama\" \"npm run dev\"",
    "ollama:start": "node scripts/setup-ollama.js",
    "ollama:stop": "node -e \"require('child_process').exec(process.platform === 'win32' ? 'taskkill /F /IM ollama.exe' : 'pkill -f ollama', ()=>{})\""
  }
}
```

## Installation des Dépendances

Si vous souhaitez utiliser le script `dev:full`, installez concurrently:

```bash
npm install --save-dev concurrently
```

## Usage

### Démarrer Ollama avec CORS
```bash
npm run setup-ollama
```

### Démarrer Ollama + Application
```bash
npm run dev:full
```

### Arrêter Ollama
```bash
npm run ollama:stop
```

## Scripts Alternatifs par Plateforme

### Windows PowerShell
```json
{
  "scripts": {
    "ollama:win": "$env:OLLAMA_ORIGINS='*'; $env:OLLAMA_HOST='0.0.0.0:11434'; ollama serve"
  }
}
```

### Unix (macOS/Linux)
```json
{
  "scripts": {
    "ollama:unix": "OLLAMA_ORIGINS='*' OLLAMA_HOST='0.0.0.0:11434' ollama serve"
  }
}
```

## Intégration avec le Développement

Pour une expérience de développement optimale, vous pouvez créer un script qui:
1. Configure et démarre Ollama
2. Attend que le serveur soit prêt
3. Démarre votre application de développement

Ceci est déjà implémenté dans le script `setup-ollama.js`.