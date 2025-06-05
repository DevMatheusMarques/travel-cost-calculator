
import React, { useState } from 'react';
import { MapPin, Car, Bike, Calculator, Route, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import InteractiveMap from './InteractiveMap';
import ResultsPanel from './ResultsPanel';

interface TripData {
  distance: number;
  duration: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
  route: any;
  tolls: any[];
}

const TripPlanner = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [fuelEfficiency, setFuelEfficiency] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  // API Keys das variáveis de ambiente
  const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
  const TOLLGURU_API_KEY = import.meta.env.VITE_TOLLGURU_API_KEY;

  const searchCities = async (query: string, isOrigin: boolean) => {
    if (query.length < 3) {
      if (isOrigin) setOriginSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}&boundary.country=BR&size=5`
      );
      
      if (!response.ok) throw new Error('Erro ao buscar cidades');
      
      const data = await response.json();
      const suggestions = data.features.map((feature: any) => ({
        label: feature.properties.label,
        coordinates: feature.geometry.coordinates
      }));
      
      if (isOrigin) setOriginSuggestions(suggestions);
      else setDestinationSuggestions(suggestions);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const calculateTrip = async () => {
    if (!origin || !destination || !fuelEfficiency || !fuelPrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos necessários.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando cálculo da viagem...');
      
      // Buscar coordenadas das cidades
      const [originData, destinationData] = await Promise.all([
        fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(origin)}&boundary.country=BR&size=1`),
        fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(destination)}&boundary.country=BR&size=1`)
      ]);

      const originResult = await originData.json();
      const destinationResult = await destinationData.json();

      if (!originResult.features?.length || !destinationResult.features?.length) {
        throw new Error('Cidades não encontradas');
      }

      const originCoords = originResult.features[0]?.geometry?.coordinates;
      const destinationCoords = destinationResult.features[0]?.geometry?.coordinates;

      if (!originCoords || !destinationCoords || 
          !Array.isArray(originCoords) || !Array.isArray(destinationCoords) ||
          originCoords.length < 2 || destinationCoords.length < 2) {
        throw new Error('Coordenadas inválidas encontradas');
      }

      console.log('Coordenadas encontradas:', { origin: originCoords, destination: destinationCoords });

      // Calcular rota usando o formato geojson
      const routeResponse = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': ORS_API_KEY
          },
          body: JSON.stringify({
            coordinates: [originCoords, destinationCoords]
          })
        }
      );

      if (!routeResponse.ok) {
        const errorText = await routeResponse.text();
        console.error('Erro na resposta da API:', errorText);
        throw new Error('Erro ao calcular rota');
      }
      
      const routeData = await routeResponse.json();
      console.log('Dados completos da rota:', routeData);

      if (!routeData.features || !routeData.features.length) {
        throw new Error('Nenhuma rota encontrada');
      }

      const route = routeData.features[0];
      if (!route?.properties?.summary || !route?.geometry?.coordinates) {
        throw new Error('Dados da rota incompletos');
      }

      const distance = route.properties.summary.distance / 1000; // km
      const duration = route.properties.summary.duration / 60; // minutos

      console.log('Rota calculada:', { distance, duration });
      
      // Validar coordenadas da geometria
      const coordinates = route.geometry.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error('Coordenadas da geometria inválidas');
      }

      console.log('Coordenadas da geometria:', coordinates);

      // Calcular custo do combustível
      const efficiency = parseFloat(fuelEfficiency);
      const price = parseFloat(fuelPrice);
      const fuelCost = (distance / efficiency) * price;

      // Buscar pedágios usando TollGuru API
      let tollCost = 0;
      let tolls: any[] = [];
      
      try {
        console.log('Buscando pedágios...');
        
        const tollResponse = await fetch(
          'https://dev.tollguru.com/v1/calc/route',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': TOLLGURU_API_KEY
            },
            body: JSON.stringify({
              source: {
                lat: originCoords[1],
                lng: originCoords[0]
              },
              destination: {
                lat: destinationCoords[1],
                lng: destinationCoords[0]
              },
              vehicleType: vehicleType === 'car' ? '2AxlesAuto' : 'Motorcycle',
              departure_time: new Date().toISOString()
            })
          }
        );

        console.log('Resposta TollGuru status:', tollResponse.status);

        if (tollResponse.ok) {
          const tollData = await tollResponse.json();
          console.log('Dados de pedágio:', tollData);
          
          if (tollData.route && tollData.route.costs) {
            tollCost = tollData.route.costs.tag || tollData.route.costs.cash || 0;
            tolls = tollData.route.tolls || [];
          }
        } else {
          const errorData = await tollResponse.text();
          console.log('Erro TollGuru:', errorData);
        }
      } catch (error) {
        console.error('Erro ao buscar pedágios:', error);
        // Fallback: estimativa baseada na distância para rotas longas no Brasil
        if (distance > 200) {
          tollCost = Math.round((distance / 100) * 12.5 * 100) / 100;
          tolls = [
            { name: 'Pedágio Estimado 1', cost: tollCost * 0.6 },
            { name: 'Pedágio Estimado 2', cost: tollCost * 0.4 }
          ];
          console.log('Usando estimativa de pedágios:', tollCost);
        }
      }

      const totalCost = fuelCost + tollCost;

      // Preparar dados da rota para o mapa com validação robusta
      const routeForMap = {
        coordinates: coordinates,
        origin: {
          coordinates: originCoords,
          name: origin
        },
        destination: {
          coordinates: destinationCoords,
          name: destination
        }
      };

      console.log('Dados da rota preparados para o mapa:', routeForMap);

      setTripData({
        distance,
        duration,
        fuelCost,
        tollCost,
        totalCost,
        route: routeForMap,
        tolls
      });

      toast({
        title: "Rota calculada!",
        description: "Veja os detalhes da sua viagem no painel de resultados.",
      });

    } catch (error) {
      console.error('Erro ao calcular viagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível calcular a rota. Verifique as cidades informadas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Route className="h-10 w-10 text-blue-600" />
            Planejador de Viagens
          </h1>
          <p className="text-gray-600">Calcule rotas, combustível e pedágios para sua próxima aventura</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Painel de Formulário */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Destinos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origem</Label>
                  <div className="relative">
                    <Input
                      id="origin"
                      placeholder="Digite a cidade de origem"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        searchCities(e.target.value, true);
                      }}
                      className="pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {originSuggestions.length > 0 && (
                    <div className="bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto z-50 relative">
                      {originSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setOrigin(suggestion.label);
                            setOriginSuggestions([]);
                          }}
                        >
                          {suggestion.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <div className="relative">
                    <Input
                      id="destination"
                      placeholder="Digite a cidade de destino"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        searchCities(e.target.value, false);
                      }}
                      className="pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {destinationSuggestions.length > 0 && (
                    <div className="bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto z-50 relative">
                      {destinationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setDestination(suggestion.label);
                            setDestinationSuggestions([]);
                          }}
                        >
                          {suggestion.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Configurações do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Veículo</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Carro
                        </div>
                      </SelectItem>
                      <SelectItem value="motorcycle">
                        <div className="flex items-center gap-2">
                          <Bike className="h-4 w-4" />
                          Moto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="efficiency">Autonomia (km/l)</Label>
                  <Input
                    id="efficiency"
                    type="number"
                    placeholder="Ex: 12.5"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(e.target.value)}
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço do Combustível (R$/l)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Ex: 5.50"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    step="0.01"
                  />
                </div>

                <Button 
                  onClick={calculateTrip} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Calculando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Calcular Viagem
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {tripData && <ResultsPanel tripData={tripData} />}
          </div>

          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0 h-full">
                <InteractiveMap route={tripData?.route} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
