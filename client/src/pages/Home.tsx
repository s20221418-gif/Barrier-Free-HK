import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { 
  Navigation, 
  MapPin, 
  Accessibility, 
  Volume2, 
  Search,
  Loader2,
  Menu,
  X,
  Mic,
  MicOff,
  Clock,
  Hospital,
  Building2,
  Train
} from "lucide-react";
import { toast } from "sonner";

// Route history interface
interface RouteHistory {
  from: string;
  to: string;
  timestamp: number;
}

// Quick location shortcuts
const QUICK_LOCATIONS = [
  { name: "Queen Mary Hospital", address: "102 Pok Fu Lam Road", icon: Hospital, lat: 22.2701, lng: 114.1316 },
  { name: "Central Government Offices", address: "2 Tim Mei Avenue", icon: Building2, lat: 22.2819, lng: 114.1652 },
  { name: "Hong Kong Station", address: "Central, Hong Kong", icon: Train, lat: 22.2848, lng: 114.1586 },
  { name: "Kowloon Station", address: "Kowloon, Hong Kong", icon: Train, lat: 22.3048, lng: 114.1615 },
  { name: "Tuen Mun Hospital", address: "23 Tsing Chung Koon Road", icon: Hospital, lat: 22.4106, lng: 113.9769 },
  { name: "Admiralty Station", address: "Admiralty, Hong Kong", icon: Train, lat: 22.2795, lng: 114.1652 },
];

// AccessGuide.hk locations (sample data)
const ACCESSIBLE_LOCATIONS = [
  { name: "Golden Bauhinia Square", lat: 22.2793, lng: 114.1738, category: "attraction" },
  { name: "Star Ferry Pier (Central)", lat: 22.2871, lng: 114.1574, category: "attraction" },
  { name: "Stanley Market", lat: 22.2184, lng: 114.2132, category: "shopping" },
  { name: "Temple Street Night Market", lat: 22.3089, lng: 114.1717, category: "shopping" },
  { name: "Ladies Market", lat: 22.3193, lng: 114.1714, category: "shopping" },
  { name: "Hong Kong Museum of History", lat: 22.3013, lng: 114.1739, category: "museum" },
  { name: "Hong Kong Space Museum", lat: 22.2944, lng: 114.1719, category: "museum" },
  { name: "Victoria Park", lat: 22.2810, lng: 114.1922, category: "park" },
  { name: "Kowloon Park", lat: 22.3022, lng: 114.1697, category: "park" },
  { name: "Hong Kong Park", lat: 22.2773, lng: 114.1614, category: "park" },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originMarker, setOriginMarker] = useState<google.maps.Marker | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<google.maps.Marker | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [travelMode, setTravelMode] = useState<"WALKING" | "TRANSIT">("TRANSIT");
  const [currentRoute, setCurrentRoute] = useState<google.maps.DirectionsResult | null>(null);
  const [isListeningOrigin, setIsListeningOrigin] = useState(false);
  const [isListeningDestination, setIsListeningDestination] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechLang, setSpeechLang] = useState<"en-US" | "zh-HK">("en-US");
  const [routeHistory, setRouteHistory] = useState<RouteHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickLocations, setShowQuickLocations] = useState(false);

  // Fetch accessibility data
  const { data: lifts } = trpc.accessibility.getLifts.useQuery();
  const { data: footbridges } = trpc.accessibility.getAccessibleFootbridges.useQuery();
  const { data: zebraCrossings } = trpc.accessibility.getZebraCrossingsWithOctopus.useQuery();

  // Load route history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("routeHistory");
    if (saved) {
      try {
        setRouteHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load route history", e);
      }
    }
  }, []);

  // Save route history to localStorage
  const saveRouteHistory = (from: string, to: string) => {
    const newHistory: RouteHistory = {
      from,
      to,
      timestamp: Date.now(),
    };
    const updated = [newHistory, ...routeHistory].slice(0, 10); // Keep last 10
    setRouteHistory(updated);
    localStorage.setItem("routeHistory", JSON.stringify(updated));
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = speechLang;
      setRecognition(recognitionInstance);
    }
  }, [speechLang]);

  // Initialize map services
  const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setDirectionsService(new google.maps.DirectionsService());
    const renderer = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true, // We'll create custom draggable markers
      polylineOptions: {
        strokeColor: "#2563eb",
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });
    setDirectionsRenderer(renderer);
    setGeocoder(new google.maps.Geocoder());

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          mapInstance.setCenter(pos);
          mapInstance.setZoom(15);

          // Add marker for current location
          new google.maps.Marker({
            position: pos,
            map: mapInstance,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
        },
        () => {
          // Default to Hong Kong Central if geolocation fails
          const defaultPos = { lat: 22.2817, lng: 114.1553 };
          mapInstance.setCenter(defaultPos);
          mapInstance.setZoom(13);
        }
      );
    }
  }, []);

  // Add markers for accessibility features
  useEffect(() => {
    if (!map) return;

    // Add lift markers
    lifts?.forEach((lift) => {
      if (lift.latitude && lift.longitude) {
        new google.maps.Marker({
          position: {
            lat: parseFloat(lift.latitude),
            lng: parseFloat(lift.longitude),
          },
          map,
          title: lift.location,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 9l7-7 7 7"/>
                <path d="M5 15l7 7 7-7"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
          },
        });
      }
    });

    // Add footbridge markers
    footbridges?.forEach((bridge) => {
      if (bridge.latitude && bridge.longitude) {
        new google.maps.Marker({
          position: {
            lat: parseFloat(bridge.latitude),
            lng: parseFloat(bridge.longitude),
          },
          map,
          title: bridge.name,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="2"/>
                <path d="M6 8v6"/>
                <path d="M18 8v6"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
          },
        });
      }
    });

    // Add zebra crossing markers
    zebraCrossings?.forEach((crossing) => {
      if (crossing.latitude && crossing.longitude) {
        new google.maps.Marker({
          position: {
            lat: parseFloat(crossing.latitude),
            lng: parseFloat(crossing.longitude),
          },
          map,
          title: crossing.name + " (Octopus Extension)",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
          },
        });
      }
    });

    // Add AccessGuide.hk accessible locations
    ACCESSIBLE_LOCATIONS.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: location.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(36, 36),
        },
      });

      // Make accessible locations clickable for route planning
      marker.addListener("click", () => {
        setDestination(location.name);
        toast.success(`Destination set to: ${location.name}`);
      });
    });
  }, [map, lifts, footbridges, zebraCrossings]);

  // Create draggable origin marker
  const createOriginMarker = (position: google.maps.LatLng) => {
    if (originMarker) {
      originMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position,
      map,
      draggable: true,
      title: "Origin (Drag to adjust)",
      label: "A",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
    });

    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos && geocoder) {
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setOrigin(results[0].formatted_address);
            toast.info("Origin location adjusted");
          }
        });
      }
    });

    setOriginMarker(marker);
  };

  // Create draggable destination marker
  const createDestinationMarker = (position: google.maps.LatLng) => {
    if (destinationMarker) {
      destinationMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position,
      map,
      draggable: true,
      title: "Destination (Drag to adjust)",
      label: "B",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });

    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos && geocoder) {
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setDestination(results[0].formatted_address);
            toast.info("Destination location adjusted");
          }
        });
      }
    });

    setDestinationMarker(marker);
  };

  // Calculate accessible route
  const calculateRoute = async () => {
    if (!directionsService || !directionsRenderer || !origin || !destination) {
      toast.error("Please enter both origin and destination");
      return;
    }

    setIsCalculating(true);

    try {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: travelMode === "WALKING" ? google.maps.TravelMode.WALKING : google.maps.TravelMode.TRANSIT,
        provideRouteAlternatives: true,
        transitOptions: travelMode === "TRANSIT" ? {
          modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.RAIL, google.maps.TransitMode.SUBWAY],
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS,
        } : undefined,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          setCurrentRoute(result);
          
          // Create draggable markers at origin and destination
          const route = result.routes[0];
          const leg = route.legs[0];
          if (leg.start_location) {
            createOriginMarker(leg.start_location);
          }
          if (leg.end_location) {
            createDestinationMarker(leg.end_location);
          }
          
          // Build transit info message
          let message = `Route found: ${leg.distance?.text}, ${leg.duration?.text}`;
          if (travelMode === "TRANSIT" && leg.steps) {
            const transitSteps = leg.steps.filter(step => step.travel_mode === "TRANSIT");
            if (transitSteps.length > 0) {
              message += ` via ${transitSteps.length} transit segment(s)`;
            }
          }
          
          toast.success(message);
          
          // Save to history
          saveRouteHistory(origin, destination);
          
          // Speak route information if voice navigation is enabled
          if (user?.voiceNavigation) {
            let speechText = `Route calculated. Distance: ${leg.distance?.text}. Duration: ${leg.duration?.text}.`;
            if (travelMode === "TRANSIT") {
              speechText += " Using accessible public transport.";
            }
            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        } else {
          toast.error("Could not calculate route. Please try different locations.");
        }
        setIsCalculating(false);
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Error calculating route");
      setIsCalculating(false);
    }
  };

  // Use current location as origin
  const useCurrentLocation = () => {
    if (userLocation) {
      setOrigin(`${userLocation.lat},${userLocation.lng}`);
      toast.success("Current location set as origin");
    } else {
      toast.error("Location not available. Please enable location services.");
    }
  };

  // Swap origin and destination
  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    toast.info("Origin and destination swapped");
  };

  // Clear current route
  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
    if (originMarker) {
      originMarker.setMap(null);
      setOriginMarker(null);
    }
    if (destinationMarker) {
      destinationMarker.setMap(null);
      setDestinationMarker(null);
    }
    setCurrentRoute(null);
    toast.info("Route cleared");
  };

  // Start speech recognition for origin
  const startListeningOrigin = () => {
    if (!recognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    setIsListeningOrigin(true);
    recognition.lang = speechLang;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setOrigin(transcript);
      toast.success(`Origin set to: ${transcript}`);
      
      // Speak confirmation if voice navigation is enabled
      if (user?.voiceNavigation) {
        const utterance = new SpeechSynthesisUtterance(`Starting location set to ${transcript}`);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error("Could not recognize speech. Please try again.");
      setIsListeningOrigin(false);
    };

    recognition.onend = () => {
      setIsListeningOrigin(false);
    };

    recognition.start();
    toast.info("Listening... Speak your starting location");
  };

  // Start speech recognition for destination
  const startListeningDestination = () => {
    if (!recognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    setIsListeningDestination(true);
    recognition.lang = speechLang;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDestination(transcript);
      toast.success(`Destination set to: ${transcript}`);
      
      // Speak confirmation if voice navigation is enabled
      if (user?.voiceNavigation) {
        const utterance = new SpeechSynthesisUtterance(`Destination set to ${transcript}`);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error("Could not recognize speech. Please try again.");
      setIsListeningDestination(false);
    };

    recognition.onend = () => {
      setIsListeningDestination(false);
    };

    recognition.start();
    toast.info("Listening... Speak your destination");
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListeningOrigin(false);
    setIsListeningDestination(false);
  };

  // Toggle speech language
  const toggleLanguage = () => {
    const newLang = speechLang === "en-US" ? "zh-HK" : "en-US";
    setSpeechLang(newLang);
    toast.info(`Language switched to ${newLang === "en-US" ? "English" : "中文"}`);
  };

  // Use quick location
  const useQuickLocation = (location: typeof QUICK_LOCATIONS[0]) => {
    setDestination(location.name);
    toast.success(`Destination set to: ${location.name}`);
    setShowQuickLocations(false);
  };

  // Use history item
  const useHistoryItem = (item: RouteHistory) => {
    setOrigin(item.from);
    setDestination(item.to);
    toast.success("Route loaded from history");
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content for screen readers */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility className="w-10 h-10" />
            <h1 className="text-2xl font-bold">HK Accessible Map</h1>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowMenu(!showMenu)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
            aria-label="Toggle menu"
          >
            {showMenu ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </Button>
        </div>
      </header>

      {/* Mobile menu */}
      {showMenu && (
        <div className="bg-card border-b-2 border-border p-4">
          <div className="container space-y-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full justify-start text-lg"
              onClick={() => window.location.href = '/saved-locations'}
            >
              <MapPin className="w-6 h-6 mr-3" />
              Saved Locations
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-start text-lg">
              <Navigation className="w-6 h-6 mr-3" />
              Route History
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full justify-start text-lg"
              onClick={() => window.location.href = '/settings'}
            >
              <Volume2 className="w-6 h-6 mr-3" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main id="main-content" className="flex-1 flex flex-col lg:flex-row">
        {/* Search panel */}
        <div className="lg:w-96 bg-card border-r-2 border-border p-4 space-y-4 overflow-y-auto max-h-screen">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Plan Your Route</CardTitle>
              <CardDescription className="text-base">
                Find barrier-free accessible routes in Hong Kong
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language toggle */}
              <div className="flex justify-end">
                <Button
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {speechLang === "en-US" ? "EN" : "中"}
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="origin" className="text-base font-semibold">
                  From
                </label>
                <div className="flex gap-2">
                  <Input
                    id="origin"
                    placeholder="Enter or speak starting location"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="text-base min-h-[3rem]"
                  />
                  <Button
                    onClick={useCurrentLocation}
                    variant="outline"
                    size="lg"
                    className="shrink-0"
                    aria-label="Use current location"
                  >
                    <Navigation className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={isListeningOrigin ? stopListening : startListeningOrigin}
                    variant={isListeningOrigin ? "destructive" : "outline"}
                    size="lg"
                    className="shrink-0"
                    aria-label={isListeningOrigin ? "Stop listening" : "Speak origin"}
                  >
                    {isListeningOrigin ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                  </Button>
                </div>
              </div>

              {/* Swap button */}
              <div className="flex justify-center">
                <Button
                  onClick={swapLocations}
                  variant="ghost"
                  size="lg"
                  className="w-12 h-12 rounded-full"
                  aria-label="Swap origin and destination"
                  disabled={!origin || !destination}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16V4M7 4L3 8M7 4l4 4"/>
                    <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="destination" className="text-base font-semibold">
                  To
                </label>
                <div className="flex gap-2">
                  <Input
                    id="destination"
                    placeholder="Enter or speak destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-base min-h-[3rem]"
                  />
                  <Button
                    onClick={isListeningDestination ? stopListening : startListeningDestination}
                    variant={isListeningDestination ? "destructive" : "outline"}
                    size="lg"
                    className="shrink-0"
                    aria-label={isListeningDestination ? "Stop listening" : "Speak destination"}
                  >
                    {isListeningDestination ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                  </Button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button
                  onClick={() => setShowQuickLocations(!showQuickLocations)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Quick Locations
                </Button>
              </div>

              {/* Route history */}
              {showHistory && routeHistory.length > 0 && (
                <Card className="bg-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Recent Routes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {routeHistory.slice(0, 5).map((item, idx) => (
                      <Button
                        key={idx}
                        onClick={() => useHistoryItem(item)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2"
                      >
                        <div className="text-xs">
                          <div className="font-semibold">{item.from}</div>
                          <div className="text-muted-foreground">→ {item.to}</div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick locations */}
              {showQuickLocations && (
                <Card className="bg-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Destinations</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-2">
                    {QUICK_LOCATIONS.map((loc, idx) => {
                      const Icon = loc.icon;
                      return (
                        <Button
                          key={idx}
                          onClick={() => useQuickLocation(loc)}
                          variant="outline"
                          size="lg"
                          className="justify-start h-auto py-3"
                        >
                          <Icon className="w-5 h-5 mr-3 shrink-0" />
                          <div className="text-left">
                            <div className="font-semibold text-sm">{loc.name}</div>
                            <div className="text-xs text-muted-foreground">{loc.address}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Travel mode selection */}
              <div className="space-y-2">
                <label className="text-base font-semibold">
                  Travel Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setTravelMode("TRANSIT")}
                    variant={travelMode === "TRANSIT" ? "default" : "outline"}
                    size="lg"
                    className="min-h-[3rem] text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect x="3" y="6" width="18" height="13" rx="2"/>
                      <path d="M3 10h18"/>
                      <circle cx="8" cy="16" r="1"/>
                      <circle cx="16" cy="16" r="1"/>
                    </svg>
                    Public Transport
                  </Button>
                  <Button
                    onClick={() => setTravelMode("WALKING")}
                    variant={travelMode === "WALKING" ? "default" : "outline"}
                    size="lg"
                    className="min-h-[3rem] text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="12" cy="5" r="2"/>
                      <path d="M10 22v-6l-2-2v-4l4-1 2 3h3"/>
                      <path d="M14 22v-8l2-2"/>
                    </svg>
                    Walking Only
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={calculateRoute}
                  disabled={isCalculating || !origin || !destination}
                  className="w-full min-h-[3.5rem] text-lg font-semibold"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6 mr-2" />
                      Find Accessible Route
                    </>
                  )}
                </Button>
                {currentRoute && (
                  <Button
                    onClick={clearRoute}
                    variant="outline"
                    className="w-full min-h-[3rem] text-base"
                    size="lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Clear Route
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                💡 Tip: Drag the markers on the map to fine-tune your route
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  ↕
                </div>
                <span className="text-base">Accessible Lifts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  ═
                </div>
                <span className="text-base">Accessible Footbridges</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                  ⏱
                </div>
                <span className="text-base">Extended Crossing Time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  📍
                </div>
                <span className="text-base">Accessible Locations</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            onMapReady={handleMapReady}
            initialCenter={{ lat: 22.3193, lng: 114.1694 }}
            initialZoom={13}
            className="w-full h-full min-h-[500px]"
          />
        </div>
      </main>
    </div>
  );
}
