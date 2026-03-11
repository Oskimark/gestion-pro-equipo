"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, X, Check } from "lucide-react";

// Fix for default marker icons in Leaflet + Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapPickerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapPicker({ onSelect, onClose }: MapPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [address, setAddress] = useState("");
    const [searching, setSearching] = useState(false);

    // Initial center (Montevideo, Uruguay)
    const initialCenter: [number, number] = [-34.9011, -56.1645];

    const handleConfirm = () => {
        if (position) {
            const url = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
            onSelect(url);
            onClose();
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;

        try {
            setSearching(true);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Uruguay")}`);
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = new L.LatLng(parseFloat(lat), parseFloat(lon));
                setPosition(newPos);
                // We'll need to move the map center too, handled by a child component
            } else {
                alert("No se encontró la ubicación");
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl border border-border/40 w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-border/10 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-accent" />
                            Seleccionar Ubicación
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Haz clic en el mapa para marcar el punto del encuentro</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="h-6 w-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-white border-b border-border/10">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Buscar dirección o lugar (ej: Estadio Centenario)..."
                            className="w-full bg-slate-50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                        />
                        <button
                            type="submit"
                            disabled={searching}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-accent/90 transition-all disabled:opacity-50"
                        >
                            {searching ? "Buscando..." : "Buscar"}
                        </button>
                    </form>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative z-0">
                    <MapContainer center={initialCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                        <MapController position={position} />
                    </MapContainer>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-border/10 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coordenadas</span>
                        <span className="text-sm font-mono text-foreground font-bold italic">
                            {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : "Selecciona un punto..."}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-muted-foreground hover:bg-slate-200 transition-all">
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!position}
                            className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                        >
                            <Check className="h-5 w-5" />
                            Confirmar Ubicación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component to pan map to search results
function MapController({ position }: { position: L.LatLng | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);
    return null;
}
