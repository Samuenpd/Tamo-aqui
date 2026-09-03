import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin, Search, Navigation, RefreshCw, X, Hash } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SP_CENTER: [number, number] = [-23.5505, -46.6333];

export interface LocationValue {
  address: string;
  number?: string; // <-- Novo campo para o número
  lat: number;
  lng: number;
}

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  house_number?: string; // <-- Novo campo da API do Nominatim
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

const BRAZIL_REGIONS: Record<string, string> = {
  "Acre": "Norte", "Amapá": "Norte", "Amazonas": "Norte", "Pará": "Norte",
  "Rondônia": "Norte", "Roraima": "Norte", "Tocantins": "Norte",
  "Alagoas": "Nordeste", "Bahia": "Nordeste", "Ceará": "Nordeste", "Maranhão": "Nordeste",
  "Paraíba": "Nordeste", "Pernambuco": "Nordeste", "Piauí": "Nordeste",
  "Rio Grande do Norte": "Nordeste", "Sergipe": "Nordeste",
  "Distrito Federal": "Centro-Oeste", "Goiás": "Centro-Oeste",
  "Mato Grosso": "Centro-Oeste", "Mato Grosso do Sul": "Centro-Oeste",
  "Espírito Santo": "Sudeste", "Minas Gerais": "Sudeste",
  "Rio de Janeiro": "Sudeste", "São Paulo": "Sudeste",
  "Paraná": "Sul", "Rio Grande do Sul": "Sul", "Santa Catarina": "Sul",
};

function formatShortAddress(address?: NominatimAddress, fallback?: string): string {
  if (!address) return fallback ?? "";

  const street = address.road || address.pedestrian || "";
  const neighborhood =
    address.suburb || address.neighbourhood || address.quarter || address.city_district || "";
  const city = address.city || address.town || address.village || address.municipality || "";
  const region = address.state ? BRAZIL_REGIONS[address.state] ?? "" : "";

  const parts = [street, neighborhood, city, region].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback ?? "";
}

async function searchAddress(query: string): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "pt-BR" },
  });
  if (!res.ok) return [];
  return res.json();
}

// Alterado para retornar tanto o endereço formatado quanto o número
async function reverseGeocode(lat: number, lng: number): Promise<{ addressStr: string; houseNumber: string }> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "pt-BR" },
  });
  if (!res.ok) return { addressStr: "", houseNumber: "" };
  const data = await res.json();
  
  return {
    addressStr: formatShortAddress(data.address, data.display_name),
    houseNumber: data.address?.house_number || ""
  };
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue | null;
  onChange: (loc: LocationValue) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<L.Map | null>(null);
  const markerObj = useRef<L.Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(value?.address ?? "");
  const [number, setNumber] = useState(value?.number ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    const center: [number, number] = value ? [value.lat, value.lng] : SP_CENTER;

    mapObj.current = L.map(mapRef.current, {
      center,
      zoom: value ? 17 : 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapObj.current);

    markerObj.current = L.marker(center, { draggable: true }).addTo(mapObj.current);

    const applyPosition = async (lat: number, lng: number) => {
      markerObj.current?.setLatLng([lat, lng]);
      mapObj.current?.panTo([lat, lng]);
      const { addressStr, houseNumber } = await reverseGeocode(lat, lng);
      setQuery(addressStr);
      setNumber(houseNumber);
      onChange({ address: addressStr, number: houseNumber, lat, lng });
    };

    markerObj.current.on("dragend", () => {
      const pos = markerObj.current?.getLatLng();
      if (pos) applyPosition(pos.lat, pos.lng);
    });

    mapObj.current.on("click", (e: L.LeafletMouseEvent) => {
      applyPosition(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      mapObj.current?.remove();
      mapObj.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const found = await searchAddress(val);
      setResults(found);
      setSearching(false);
    }, 600);
  };

  const pickResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const shortAddress = formatShortAddress(r.address, r.display_name);
    const houseNumber = r.address?.house_number || "";
    
    setQuery(shortAddress);
    setNumber(houseNumber);
    setResults([]);
    setShowResults(false);
    
    markerObj.current?.setLatLng([lat, lng]);
    mapObj.current?.setView([lat, lng], 17);
    onChange({ address: shortAddress, number: houseNumber, lat, lng });
  };

  const handleNumberChange = (newNumber: string) => {
    setNumber(newNumber);
    if (value) {
      onChange({ ...value, number: newNumber });
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        markerObj.current?.setLatLng([latitude, longitude]);
        mapObj.current?.setView([latitude, longitude], 17);
        
        const { addressStr, houseNumber } = await reverseGeocode(latitude, longitude);
        setQuery(addressStr);
        setNumber(houseNumber);
        setLocating(false);
        onChange({ address: addressStr, number: houseNumber, lat: latitude, lng: longitude });
      },
      () => setLocating(false)
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-input-background h-full">
            <Search size={15} className="text-primary shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Buscar endereço..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setResults([]); }} className="text-muted-foreground shrink-0">
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="text-muted-foreground hover:text-primary shrink-0"
              aria-label="Usar minha localização"
            >
              {locating ? <RefreshCw size={15} className="animate-spin" /> : <Navigation size={15} />}
            </button>
          </div>

          {showResults && (searching || results.length > 0) && (
            <div className="absolute z-[1000] w-full mt-1 bg-popover border border-border rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
              {searching && (
                <div className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" />Buscando...
                </div>
              )}
              {!searching && results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickResult(r)}
                  className="w-full flex items-start gap-2 px-4 py-2.5 hover:bg-muted text-left text-xs text-foreground"
                >
                  <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{formatShortAddress(r.address, r.display_name)} {r.address?.house_number && `, ${r.address.house_number}`}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input de Número */}
        <div className="w-24 shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-xl border border-border bg-input-background">
          <Hash size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="Nº"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-48 rounded-xl overflow-hidden border border-border bg-muted"
        style={{ zIndex: 0 }}
      />

      {value && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 px-1">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">
            {value.address}{value.number ? `, ${value.number}` : ""}
          </span>
        </p>
      )}
    </div>
  );
}