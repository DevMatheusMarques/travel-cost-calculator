
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  route?: any;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ route }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([-14.235, -51.925], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Initialize route layer
    routeLayer.current = L.layerGroup().addTo(map.current);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !routeLayer.current || !route) {
      console.log('Mapa, camada ou rota não disponível:', { map: !!map.current, layer: !!routeLayer.current, route: !!route });
      return;
    }

    // Clear previous route
    routeLayer.current.clearLayers();

    try {
      console.log('Processando dados da rota:', route);
      
      // Validar se as coordenadas existem e são válidas
      if (!route.coordinates || !Array.isArray(route.coordinates)) {
        console.error('Coordenadas da rota não encontradas ou inválidas:', route.coordinates);
        return;
      }
      
      const coordinates = route.coordinates;
      console.log('Coordenadas da rota:', coordinates);
      
      if (coordinates.length === 0) {
        console.error('Array de coordenadas vazio');
        return;
      }
      
      // Converter coordenadas para formato Leaflet [lat, lng] com validação robusta
      const latlngs: [number, number][] = coordinates
        .filter((coord: any) => {
          if (!Array.isArray(coord)) {
            console.warn('Coordenada não é array:', coord);
            return false;
          }
          if (coord.length < 2) {
            console.warn('Coordenada com menos de 2 elementos:', coord);
            return false;
          }
          if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
            console.warn('Coordenada com valores não numéricos:', coord);
            return false;
          }
          return true;
        })
        .map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
      
      console.log('LatLngs processados para o mapa:', latlngs.length, 'pontos');
      console.log('Primeiras coordenadas:', latlngs.slice(0, 3));
      
      if (latlngs.length === 0) {
        console.error('Nenhuma coordenada válida após processamento');
        return;
      }
      
      // Adicionar linha da rota
      const routeLine = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8
      });
      
      routeLayer.current.addLayer(routeLine);
      console.log('Linha da rota adicionada ao mapa');

      // Adicionar marcadores para origem e destino
      if (route.origin?.coordinates && route.destination?.coordinates) {
        console.log('Adicionando marcadores de origem e destino');
        
        // Validar coordenadas de origem
        if (Array.isArray(route.origin.coordinates) && 
            route.origin.coordinates.length >= 2 &&
            typeof route.origin.coordinates[0] === 'number' &&
            typeof route.origin.coordinates[1] === 'number') {
          
          const startIcon = L.divIcon({
            html: `<div style="background: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          
          L.marker([route.origin.coordinates[1], route.origin.coordinates[0]], { icon: startIcon })
            .bindPopup(`Origem: ${route.origin.name || 'Desconhecido'}`)
            .addTo(routeLayer.current);
        }

        // Validar coordenadas de destino
        if (Array.isArray(route.destination.coordinates) && 
            route.destination.coordinates.length >= 2 &&
            typeof route.destination.coordinates[0] === 'number' &&
            typeof route.destination.coordinates[1] === 'number') {
          
          const endIcon = L.divIcon({
            html: `<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          
          L.marker([route.destination.coordinates[1], route.destination.coordinates[0]], { icon: endIcon })
            .bindPopup(`Destino: ${route.destination.name || 'Desconhecido'}`)
            .addTo(routeLayer.current);
        }
      } else {
        console.log('Usando primeira e última coordenada da rota como marcadores');
        
        // Fallback: usar primeira e última coordenada da rota
        const startIcon = L.divIcon({
          html: `<div style="background: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        
        L.marker(latlngs[0], { icon: startIcon })
          .bindPopup('Origem')
          .addTo(routeLayer.current);

        const endIcon = L.divIcon({
          html: `<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        
        L.marker(latlngs[latlngs.length - 1], { icon: endIcon })
          .bindPopup('Destino')
          .addTo(routeLayer.current);
      }

      // Ajustar visualização do mapa para mostrar toda a rota
      map.current.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      
      console.log('Rota desenhada com sucesso no mapa');
    } catch (error) {
      console.error('Erro ao renderizar rota no mapa:', error);
    }
  }, [route]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            <span>Origem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
            <span>Destino</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-600 rounded"></div>
            <span>Rota</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
