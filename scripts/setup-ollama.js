#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');
const path = require('path');

class OllamaSetup {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.isLinux = this.platform === 'linux';
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[Ollama Setup] ${message}${colors.reset}`);
  }

  async checkOllamaInstalled() {
    return new Promise((resolve) => {
      exec('ollama --version', (error) => {
        resolve(!error);
      });
    });
  }

  async killExistingOllama() {
    this.log('Arrêt des processus Ollama existants...', 'info');
    
    if (this.isWindows) {
      return new Promise((resolve) => {
        exec('taskkill /F /IM ollama.exe 2>nul', () => resolve());
      });
    } else {
      return new Promise((resolve) => {
        exec('pkill -f ollama', () => resolve());
      });
    }
  }

  getStartCommand() {
    if (this.isWindows) {
      return {
        command: 'cmd',
        args: ['/c', 'set OLLAMA_ORIGINS=* && set OLLAMA_HOST=0.0.0.0:11434 && ollama serve'],
        shell: true
      };
    } else {
      return {
        command: 'bash',
        args: ['-c', 'OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve'],
        shell: false
      };
    }
  }

  async startOllamaWithCORS() {
    const { command, args, shell } = this.getStartCommand();
    
    this.log('Démarrage d\'Ollama avec configuration CORS...', 'info');
    this.log(`Commande: ${command} ${args.join(' ')}`, 'info');
    
    const ollamaProcess = spawn(command, args, {
      shell,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: !this.isWindows
    });

    ollamaProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        this.log(`Ollama: ${output}`, 'info');
      }
    });

    ollamaProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('time=')) {
        this.log(`Ollama: ${output}`, 'warning');
      }
    });

    // Attendre que le serveur soit prêt
    await this.waitForServer();
    
    return ollamaProcess;
  }

  async waitForServer(maxAttempts = 30) {
    this.log('Attente du démarrage du serveur Ollama...', 'info');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          this.log('Serveur Ollama prêt!', 'success');
          return true;
        }
      } catch (error) {
        // Serveur pas encore prêt
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      process.stdout.write('.');
    }
    
    throw new Error('Timeout: Ollama n\'a pas démarré dans les temps');
  }

  async checkCORSConfiguration() {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8080',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsHeaders = response.headers.get('Access-Control-Allow-Origin');
      return corsHeaders === '*' || corsHeaders === 'http://localhost:8080';
    } catch (error) {
      return false;
    }
  }

  printInstructions() {
    this.log('\n=== Configuration Ollama CORS ===', 'success');
    this.log('Variables d\'environnement configurées:', 'info');
    this.log('  OLLAMA_ORIGINS="*"', 'success');
    this.log('  OLLAMA_HOST="0.0.0.0:11434"', 'success');
    this.log('\nTestez la connexion dans votre navigateur:', 'info');
    this.log('  - http://localhost:11434/api/tags', 'success');
    this.log('\nPour arrêter Ollama, utilisez Ctrl+C', 'warning');
    this.log('\nSi vous avez des erreurs CORS, vérifiez que les variables sont bien définies', 'info');
  }

  async run() {
    try {
      this.log('Vérification de l\'installation d\'Ollama...', 'info');
      
      const isInstalled = await this.checkOllamaInstalled();
      if (!isInstalled) {
        this.log('Ollama n\'est pas installé. Veuillez l\'installer depuis https://ollama.ai/', 'error');
        process.exit(1);
      }

      await this.killExistingOllama();
      const process = await this.startOllamaWithCORS();
      
      // Vérifier la configuration CORS
      setTimeout(async () => {
        const corsOk = await this.checkCORSConfiguration();
        if (corsOk) {
          this.log('Configuration CORS vérifiée avec succès!', 'success');
        } else {
          this.log('Attention: La configuration CORS pourrait ne pas être active', 'warning');
        }
        this.printInstructions();
      }, 3000);

      // Gestion propre de l'arrêt
      process.stdin.resume();
      process.on('SIGINT', () => {
        this.log('Arrêt d\'Ollama...', 'info');
        if (process && !process.killed) {
          process.kill('SIGTERM');
        }
        process.exit(0);
      });

    } catch (error) {
      this.log(`Erreur: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const setup = new OllamaSetup();
  setup.run();
}

module.exports = OllamaSetup;