# Configuration Rapide Ollama CORS

Si l'auto-configuration ne fonctionne pas, suivez ces étapes manuelles simples :

## 🚀 Méthode Manuelle (Recommandée)

### Windows
Ouvrez un **Command Prompt (CMD)** et tapez :
```cmd
set OLLAMA_ORIGINS=* && set OLLAMA_HOST=0.0.0.0:11434 && ollama serve
```

**Ou** en PowerShell :
```powershell
$env:OLLAMA_ORIGINS="*"; $env:OLLAMA_HOST="0.0.0.0:11434"; ollama serve
```

### macOS/Linux
Ouvrez un **Terminal** et tapez :
```bash
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve
```

## ✅ Vérification

1. Ollama devrait démarrer et afficher : `Listening on 0.0.0.0:11434`
2. Testez dans votre navigateur : http://localhost:11434/api/tags
3. Vous devriez voir une liste JSON des modèles

## 🔧 Script Automatique (Alternative)

Si vous préférez utiliser le script automatique :
```bash
npm run setup-ollama
```

## ⚠️ Problèmes Courants

1. **Port déjà utilisé** : Arrêtez Ollama avec `Ctrl+C` puis relancez
2. **Ollama pas installé** : Téléchargez depuis https://ollama.ai/
3. **Permissions** : Sur Windows, utilisez "Exécuter en tant qu'administrateur"

## 📝 Note
Ces commandes sont temporaires. Pour une configuration permanente, ajoutez les variables à votre profil shell (.bashrc, .zshrc, etc.)