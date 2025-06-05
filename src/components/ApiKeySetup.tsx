
import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ApiKeySetup = () => {
  const [orsKey, setOrsKey] = useState('');
  const [tollGuruKey, setTollGuruKey] = useState('');

  const hasOrsKey = !!import.meta.env.VITE_ORS_API_KEY;
  const hasTollGuruKey = !!import.meta.env.VITE_TOLLGURU_API_KEY;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuração de API Keys</h1>
          <p className="text-gray-600">Configure as chaves de API para usar todas as funcionalidades</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* OpenRouteService */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                OpenRouteService
                {hasOrsKey && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Usado para calcular rotas e buscar cidades com autocomplete.
                </p>
                
                <Alert>
                  <AlertDescription>
                    <strong>Como obter:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Acesse <a href="https://openrouteservice.org/dev/#/signup" target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">openrouteservice.org <ExternalLink className="h-3 w-3" /></a></li>
                      <li>Crie uma conta gratuita</li>
                      <li>Vá para Dashboard → API Keys</li>
                      <li>Copie sua API key</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 mt-4">
                  <Label>Variável de ambiente:</Label>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    VITE_ORS_API_KEY=sua_chave_aqui
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TollGuru */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-600" />
                TollGuru
                {hasTollGuruKey && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Usado para calcular valores de pedágios na rota.
                </p>
                
                <Alert>
                  <AlertDescription>
                    <strong>Como obter:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Acesse <a href="https://tollguru.com/developers" target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">tollguru.com/developers <ExternalLink className="h-3 w-3" /></a></li>
                      <li>Crie uma conta gratuita</li>
                      <li>Vá para Dashboard → API Keys</li>
                      <li>Copie sua API key</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 mt-4">
                  <Label>Variável de ambiente:</Label>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    VITE_TOLLGURU_API_KEY=sua_chave_aqui
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções de configuração */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle>Configuração no Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Para desenvolvimento local:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Crie um arquivo <code>.env</code> na raiz do projeto</li>
                  <li>Adicione as variáveis de ambiente:</li>
                </ol>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
{`VITE_ORS_API_KEY=sua_chave_openrouteservice
VITE_TOLLGURU_API_KEY=sua_chave_tollguru`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Para produção (Lovable):</h4>
                <p className="text-sm text-gray-600">
                  Configure as variáveis de ambiente nas configurações do projeto Lovable.
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Nota:</strong> O aplicativo funcionará parcialmente sem as API keys, 
                  mas algumas funcionalidades estarão limitadas. Os pedágios serão simulados 
                  se a API do TollGuru não estiver configurada.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Voltar ao Planejador
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;
