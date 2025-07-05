export interface OllamaConfigStatus {
  isRunning: boolean;
  corsEnabled: boolean;
  hostConfigured: boolean;
  canAutoConfig: boolean;
  processId?: number;
}

export interface OllamaSetupResult {
  success: boolean;
  message: string;
  processId?: number;
}

export class OllamaConfigService {
  private static instance: OllamaConfigService;
  private setupProcess: any = null;

  static getInstance(): OllamaConfigService {
    if (!OllamaConfigService.instance) {
      OllamaConfigService.instance = new OllamaConfigService();
    }
    return OllamaConfigService.instance;
  }

  async checkOllamaStatus(): Promise<OllamaConfigStatus> {
    const status: OllamaConfigStatus = {
      isRunning: false,
      corsEnabled: false,
      hostConfigured: false,
      canAutoConfig: this.canAutoConfig()
    };

    try {
      // Test si Ollama est accessible
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        status.isRunning = true;
        
        // Test CORS
        const corsResponse = await fetch('http://localhost:11434/api/tags', {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET'
          }
        });
        
        const corsHeaders = corsResponse.headers.get('Access-Control-Allow-Origin');
        status.corsEnabled = corsHeaders === '*' || corsHeaders === window.location.origin;
        
        // Test host configuration (assumé si accessible depuis localhost)
        status.hostConfigured = true;
      }
    } catch (error) {
      console.log('Ollama status check failed:', error);
    }

    return status;
  }

  private canAutoConfig(): boolean {
    // Vérifier si nous sommes dans un environnement qui permet l'auto-config
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:');
  }

  async autoConfigureOllama(): Promise<OllamaSetupResult> {
    if (!this.canAutoConfig()) {
      return {
        success: false,
        message: 'La configuration automatique n\'est disponible qu\'en environnement de développement local.'
      };
    }

    try {
      // Pour une vraie implémentation, nous aurions besoin d'un backend
      // Pour l'instant, nous donnons des instructions à l'utilisateur
      const instructions = this.generateSetupInstructions();
      
      return {
        success: true,
        message: `Configuration automatique disponible. ${instructions}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la configuration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  private generateSetupInstructions(): string {
    const platform = this.detectPlatform();
    
    switch (platform) {
      case 'windows':
        return `
Ouvrez PowerShell en tant qu'administrateur et exécutez:
$env:OLLAMA_ORIGINS="*"; $env:OLLAMA_HOST="0.0.0.0:11434"; ollama serve

Ou utilisez le script fourni:
npm run setup-ollama
        `.trim();
      
      case 'mac':
      case 'linux':
        return `
Ouvrez un terminal et exécutez:
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve

Ou utilisez le script fourni:
npm run setup-ollama
        `.trim();
      
      default:
        return 'Veuillez configurer les variables OLLAMA_ORIGINS="*" et OLLAMA_HOST="0.0.0.0:11434" avant de démarrer Ollama.';
    }
  }

  private detectPlatform(): string {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('linux')) return 'linux';
    
    return 'unknown';
  }

  generateStartupScript(): string {
    const platform = this.detectPlatform();
    
    const scripts = {
      windows: `
@echo off
echo Configuration Ollama CORS...
set OLLAMA_ORIGINS=*
set OLLAMA_HOST=0.0.0.0:11434
echo Variables configurées:
echo   OLLAMA_ORIGINS=%OLLAMA_ORIGINS%
echo   OLLAMA_HOST=%OLLAMA_HOST%
echo.
echo Démarrage d'Ollama...
ollama serve
      `.trim(),
      
      unix: `
#!/bin/bash
echo "Configuration Ollama CORS..."
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"
echo "Variables configurées:"
echo "  OLLAMA_ORIGINS=$OLLAMA_ORIGINS"
echo "  OLLAMA_HOST=$OLLAMA_HOST"
echo ""
echo "Démarrage d'Ollama..."
ollama serve
      `.trim()
    };

    return platform === 'windows' ? scripts.windows : scripts.unix;
  }

  async testConnection(url: string = 'http://localhost:11434'): Promise<{success: boolean; corsEnabled: boolean; error?: string}> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        return {
          success: false,
          corsEnabled: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      // Test CORS
      try {
        const corsResponse = await fetch(`${url}/api/tags`, {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET'
          }
        });
        
        const corsHeaders = corsResponse.headers.get('Access-Control-Allow-Origin');
        const corsEnabled = corsHeaders === '*' || corsHeaders === window.location.origin;
        
        return {
          success: true,
          corsEnabled
        };
      } catch (corsError) {
        return {
          success: true,
          corsEnabled: false,
          error: 'CORS non configuré - utilisez la configuration automatique'
        };
      }
    } catch (error) {
      return {
        success: false,
        corsEnabled: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
    }
  }

  getConfigurationCommands(): {[platform: string]: string[]} {
    return {
      windows_powershell: [
        '$env:OLLAMA_ORIGINS="*"',
        '$env:OLLAMA_HOST="0.0.0.0:11434"',
        'ollama serve'
      ],
      windows_cmd: [
        'set OLLAMA_ORIGINS=*',
        'set OLLAMA_HOST=0.0.0.0:11434',
        'ollama serve'
      ],
      mac_linux: [
        'export OLLAMA_ORIGINS="*"',
        'export OLLAMA_HOST="0.0.0.0:11434"',
        'ollama serve'
      ],
      npm_script: [
        'npm run setup-ollama'
      ]
    };
  }
}