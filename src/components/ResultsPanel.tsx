
import React from 'react';
import { Clock, MapPin, DollarSign, Fuel, CreditCard, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TripData {
  distance: number;
  duration: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
  route: any;
  tolls: any[];
}

interface ResultsPanelProps {
  tripData: TripData;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ tripData }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-purple-600" />
          Resultados da Viagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Distância</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {tripData.distance.toFixed(1)} km
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Tempo</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {formatDuration(tripData.duration)}
            </div>
          </div>
        </div>

        <Separator />

        {/* Custos detalhados */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Custos Detalhados
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800 font-medium">Combustível</span>
              </div>
              <span className="font-bold text-orange-900">
                {formatCurrency(tripData.fuelCost)}
              </span>
            </div>

            {tripData.tollCost > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-800 font-medium">Pedágios</span>
                </div>
                <span className="font-bold text-purple-900">
                  {formatCurrency(tripData.tollCost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pedágios individuais */}
        {tripData.tolls && tripData.tolls.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Pedágios na rota:</h5>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {tripData.tolls.map((toll, index) => (
                <div key={index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                  <span className="truncate pr-2">{toll.name || `Pedágio ${index + 1}`}</span>
                  <span className="font-medium whitespace-nowrap">
                    {formatCurrency(toll.cost || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              <span className="font-medium">Custo Total da Viagem</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(tripData.totalCost)}
            </div>
          </div>
          <div className="text-sm opacity-90 mt-1">
            Valor estimado para ida {tripData.tollCost > 0 ? '(inclui pedágios)' : ''}
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-amber-800">
              <strong>Dica:</strong> Para viagem de ida e volta, multiplique os valores por 2. 
              Considere também custos de estacionamento, alimentação e possíveis desvios.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
