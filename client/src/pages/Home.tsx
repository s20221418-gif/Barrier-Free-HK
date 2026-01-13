import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Train,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Camera,
  Star,
  MessageSquare,
  Play,
  Heart,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Landmark,
  TreePine,
  Palette,
  PartyPopper,
  MapPinned,
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

// Translations
const translations = {
  "en-US": {
    skipToMain: "Skip to main content",
    appTitle: "Barrier Free HK",
    toggleMenu: "Toggle menu",
    savedLocations: "Saved Locations",
    routeHistory: "Route History",
    settings: "Settings",
    planRoute: "Plan Your Route",
    findRoutes: "Find barrier-free accessible routes in Hong Kong",
    from: "From",
    to: "To",
    enterOrigin: "Enter or speak starting location",
    enterDestination: "Enter or speak destination",
    useCurrentLocation: "Use current location",
    speakOrigin: "Speak origin",
    speakDestination: "Speak destination",
    stopListening: "Stop listening",
    swapLocations: "Swap origin and destination",
    history: "History",
    quickLocations: "Quick Locations",
    recentRoutes: "Recent Routes",
    quickDestinations: "Quick Destinations",
    travelMode: "Travel Mode",
    publicTransport: "Public Transport",
    walkingOnly: "Walking Only",
    findAccessibleRoute: "Find Accessible Route",
    calculating: "Calculating...",
    clearRoute: "Clear Route",
    tip: "💡 Tip: Drag the markers on the map to fine-tune your route. Click anywhere on the map to add accessibility notes.",
    turnByTurnNav: "Turn-by-Turn Navigation",
    stepOf: "Step {current} of {total}",
    speakStep: "Speak Step",
    nextStep: "Next Step",
    mapLegend: "Map Legend",
    accessibleLifts: "Accessible Lifts",
    outOfServiceLifts: "Out of Service Lifts",
    accessibleFootbridges: "Accessible Footbridges",
    extendedCrossingTime: "Extended Crossing Time",
    accessibleLocations: "Accessible Locations",
    legend: "Legend",
    showLegend: "Show Legend",
    hideLegend: "Hide Legend",
    liftDescription: "Working lifts for wheelchair access",
    outOfServiceDescription: "Lifts currently under maintenance (pulsing)",
    footbridgeDescription: "Footbridges with accessible facilities",
    crossingDescription: "Zebra crossings with extended time for elderly",
    locationDescription: "Verified accessible destinations",
    originMarker: "Your starting point (draggable)",
    destinationMarker: "Your destination (draggable)",
    addNote: "Add Accessibility Note",
    shareExperience: "Share your experience to help the community",
    location: "Location",
    rating: "Rating",
    condition: "Condition",
    comment: "Comment",
    describeConditions: "Describe the accessibility conditions...",
    photos: "Photos (optional, max 3)",
    photosSelected: "{count} photo(s) selected",
    submitNote: "Submit Note",
    submitting: "Submitting...",
    cancel: "Cancel",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    inaccessible: "Inaccessible",
    queenMaryHospital: "Queen Mary Hospital",
    centralGovOffices: "Central Government Offices",
    hongKongStation: "Hong Kong Station",
    kowloonStation: "Kowloon Station",
    tuenMunHospital: "Tuen Mun Hospital",
    admiraltyStation: "Admiralty Station",
  },
  "zh-HK": {
    skipToMain: "跳至主要內容",
    appTitle: "無障礙香港",
    toggleMenu: "切換選單",
    savedLocations: "已儲存位置",
    routeHistory: "路線記錄",
    settings: "設定",
    planRoute: "規劃您的路線",
    findRoutes: "尋找香港無障礙通道路線",
    from: "起點",
    to: "終點",
    enterOrigin: "輸入或說出起點位置",
    enterDestination: "輸入或說出目的地",
    useCurrentLocation: "使用目前位置",
    speakOrigin: "說出起點",
    speakDestination: "說出目的地",
    stopListening: "停止聆聽",
    swapLocations: "交換起點和終點",
    history: "記錄",
    quickLocations: "快速位置",
    recentRoutes: "最近路線",
    quickDestinations: "快速目的地",
    travelMode: "交通方式",
    publicTransport: "公共交通",
    walkingOnly: "只限步行",
    findAccessibleRoute: "尋找無障礙路線",
    calculating: "計算中...",
    clearRoute: "清除路線",
    tip: "💡 提示：拖曳地圖上的標記以微調路線。點擊地圖任何位置以新增無障礙備註。",
    turnByTurnNav: "逐步導航",
    stepOf: "第 {current} 步，共 {total} 步",
    speakStep: "朗讀步驟",
    nextStep: "下一步",
    mapLegend: "地圖圖例",
    accessibleLifts: "無障礙升降機",
    outOfServiceLifts: "暫停服務升降機",
    accessibleFootbridges: "無障礙行人天橋",
    extendedCrossingTime: "延長過路時間",
    accessibleLocations: "無障礙地點",
    legend: "圖例",
    showLegend: "顯示圖例",
    hideLegend: "隱藏圖例",
    liftDescription: "輪椅可用的升降機",
    outOfServiceDescription: "正在維修的升降機（閃爍）",
    footbridgeDescription: "設有無障礙設施的行人天橋",
    crossingDescription: "為長者延長過路時間的斑馬線",
    locationDescription: "已驗證的無障礙地點",
    originMarker: "您的起點（可拖曳）",
    destinationMarker: "您的目的地（可拖曳）",
    addNote: "新增無障礙備註",
    shareExperience: "分享您的經驗以幫助社區",
    location: "位置",
    rating: "評分",
    condition: "狀況",
    comment: "評論",
    describeConditions: "描述無障礙狀況...",
    photos: "相片（選填，最多3張）",
    photosSelected: "已選擇 {count} 張相片",
    submitNote: "提交備註",
    submitting: "提交中...",
    cancel: "取消",
    excellent: "優秀",
    good: "良好",
    fair: "一般",
    poor: "欠佳",
    inaccessible: "不可通行",
    queenMaryHospital: "瑪麗醫院",
    centralGovOffices: "中環政府總部",
    hongKongStation: "香港站",
    kowloonStation: "九龍站",
    tuenMunHospital: "屯門醫院",
    admiraltyStation: "金鐘站",
  }
};

// Route history interface
interface RouteHistory {
  from: string;
  to: string;
  timestamp: number;
}

// Navigation step interface
interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
  facilityType?: "lift" | "ramp" | "stairs" | "level";
}

// Quick location shortcuts
const QUICK_LOCATIONS = [
  { nameKey: "queenMaryHospital", address: "102 Pok Fu Lam Road", icon: Hospital, lat: 22.2701, lng: 114.1316 },
  { nameKey: "centralGovOffices", address: "2 Tim Mei Avenue", icon: Building2, lat: 22.2819, lng: 114.1652 },
  { nameKey: "hongKongStation", address: "Central, Hong Kong", icon: Train, lat: 22.2848, lng: 114.1586 },
  { nameKey: "kowloonStation", address: "Kowloon, Hong Kong", icon: Train, lat: 22.3048, lng: 114.1615 },
  { nameKey: "tuenMunHospital", address: "23 Tsing Chung Koon Road", icon: Hospital, lat: 22.4106, lng: 113.9769 },
  { nameKey: "admiraltyStation", address: "Admiralty, Hong Kong", icon: Train, lat: 22.2795, lng: 114.1652 },
];

// AccessGuide.hk locations (sample data)
const ACCESSIBLE_LOCATIONS = [
  { name: "Golden Bauhinia Square", nameCh: "金紫荊廣場", lat: 22.2793, lng: 114.1738, category: "attraction" },
  { name: "Star Ferry Pier (Central)", nameCh: "天星碼頭（中環）", lat: 22.2871, lng: 114.1574, category: "attraction" },
  { name: "Stanley Market", nameCh: "赤柱市集", lat: 22.2184, lng: 114.2132, category: "shopping" },
  { name: "Temple Street Night Market", nameCh: "廟街夜市", lat: 22.3089, lng: 114.1717, category: "shopping" },
  { name: "Ladies Market", nameCh: "女人街", lat: 22.3193, lng: 114.1714, category: "shopping" },
  { name: "Hong Kong Museum of History", nameCh: "香港歷史博物館", lat: 22.3013, lng: 114.1739, category: "museum" },
  { name: "Hong Kong Space Museum", nameCh: "香港太空館", lat: 22.2944, lng: 114.1719, category: "museum" },
  { name: "Victoria Park", nameCh: "維多利亞公園", lat: 22.2810, lng: 114.1922, category: "park" },
  { name: "Kowloon Park", nameCh: "九龍公園", lat: 22.3022, lng: 114.1697, category: "park" },
  { name: "Hong Kong Park", nameCh: "香港公園", lat: 22.2773, lng: 114.1614, category: "park" },
];


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  
  // Cute spinning character loader component
  const CuteSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg 
        className="w-16 h-16 animate-spin-slow" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="45" fill="#ec4899" opacity="0.9"/>
        <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
        <circle cx="35" cy="40" r="5" fill="white"/>
        <circle cx="65" cy="40" r="5" fill="white"/>
        <path d="M 30 55 Q 50 65 70 55" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <g className="origin-center">
          <text x="50" y="15" fontSize="20" fill="#ec4899" textAnchor="middle" opacity="0.7">♥</text>
        </g>
        <g className="origin-center" style={{transform: 'rotate(120deg)'}}>
          <text x="50" y="15" fontSize="20" fill="#ec4899" textAnchor="middle" opacity="0.7">♥</text>
        </g>
        <g className="origin-center" style={{transform: 'rotate(240deg)'}}>
          <text x="50" y="15" fontSize="20" fill="#ec4899" textAnchor="middle" opacity="0.7">♥</text>
        </g>
      </svg>
      <p className="text-pink-600 font-semibold text-lg animate-pulse">{t("calculating")}</p>
    </div>
  );
  
  // Cartoon mascot character for the app
  const CartoonMascot = () => (
    <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-b from-pink-100 to-purple-100 rounded-3xl border-4 border-pink-400 shadow-lg">
      <svg 
        className="w-20 h-20" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="40" fill="#ec4899" opacity="0.9"/>
        <circle cx="50" cy="50" r="39" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
        <circle cx="35" cy="40" r="6" fill="white"/>
        <circle cx="65" cy="40" r="6" fill="white"/>
        <circle cx="37" cy="38" r="3" fill="#ec4899"/>
        <circle cx="67" cy="38" r="3" fill="#ec4899"/>
        <circle cx="38" cy="36" r="1.5" fill="white"/>
        <circle cx="68" cy="36" r="1.5" fill="white"/>
        <path d="M 30 55 Q 50 68 70 55" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="20" cy="50" r="8" fill="#f472b6" opacity="0.6"/>
        <circle cx="80" cy="50" r="8" fill="#f472b6" opacity="0.6"/>
        <text x="50" y="15" fontSize="16" fill="#fbbf24" textAnchor="middle">★</text>
      </svg>
      <p className="text-center font-bold text-pink-700 text-sm">
        {"I'm here to help!"}
      </p>
    </div>
  );

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
  const [uiLang, setUiLang] = useState<"en-US" | "zh-HK">("en-US");
  const [routeHistory, setRouteHistory] = useState<RouteHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickLocations, setShowQuickLocations] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const accessibleMarkersRef = useRef<google.maps.Marker[]>([]);
  const [showDestinationsMenu, setShowDestinationsMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Turn-by-turn navigation
  const [showNavigation, setShowNavigation] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Legend panel
  const [showLegend, setShowLegend] = useState(true);
  
  // User notes
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteLocation, setNoteLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [noteRating, setNoteRating] = useState(3);
  const [noteCondition, setNoteCondition] = useState<"excellent" | "good" | "fair" | "poor" | "inaccessible">("good");
  const [noteComment, setNoteComment] = useState("");
  const [notePhotos, setNotePhotos] = useState<File[]>([]);
  const [isUploadingNote, setIsUploadingNote] = useState(false);

  // Get translation
  const t = (key: keyof typeof translations["en-US"], params?: Record<string, any>): string => {
    let text = translations[uiLang][key] || translations["en-US"][key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, String(params[param]));
      });
    }
    return text;
  };

  // Fetch accessibility data
  const { data: lifts } = trpc.accessibility.getLifts.useQuery();
  const { data: footbridges } = trpc.accessibility.getAccessibleFootbridges.useQuery();
  const { data: zebraCrossings } = trpc.accessibility.getZebraCrossingsWithOctopus.useQuery();
  const { data: liftStatuses } = trpc.liftStatus.getAllStatuses.useQuery();
  const { data: outOfServiceLifts } = trpc.liftStatus.getOutOfService.useQuery();
  const { data: allDestinations } = trpc.destinations.getAll.useQuery();
  
  // Mutations
  const addNoteMutation = trpc.accessibilityNotes.add.useMutation();
  const addPhotoMutation = trpc.accessibilityNotes.addPhoto.useMutation();

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

  // Update recognition language when speech lang changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = speechLang;
    }
  }, [speechLang, recognition]);

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

    // Listen to zoom changes
    mapInstance.addListener("zoom_changed", () => {
      const zoom = mapInstance.getZoom() || 13;
      setCurrentZoom(zoom);
    });

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
          setCurrentZoom(15);

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
          setCurrentZoom(13);
        }
      );
    }

    // Add click listener for adding notes
    mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && geocoder) {
        geocoder.geocode({ location: e.latLng }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setNoteLocation({
              lat: e.latLng!.lat(),
              lng: e.latLng!.lng(),
              name: results[0].formatted_address,
            });
            setShowAddNote(true);
          }
        });
      }
    });
  }, [geocoder]);

  // Add markers for accessibility features
  useEffect(() => {
    if (!map || !liftStatuses) return;

    const outOfServiceIds = new Set(outOfServiceLifts?.map(l => l.id) || []);

    // Add lift markers with status
    lifts?.forEach((lift) => {
      if (lift.latitude && lift.longitude) {
        const isOutOfService = outOfServiceIds.has(lift.id);
        
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(lift.latitude),
            lng: parseFloat(lift.longitude),
          },
          map,
          title: lift.location + (isOutOfService ? " (OUT OF SERVICE)" : ""),
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <!-- Cartoon lift with happy face -->
                <circle cx="20" cy="20" r="16" fill="${isOutOfService ? '#ef4444' : '#ec4899'}" opacity="0.95"/>
                <circle cx="20" cy="20" r="15" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <!-- Happy eyes -->
                <circle cx="15" cy="16" r="2" fill="white"/>
                <circle cx="25" cy="16" r="2" fill="white"/>
                <!-- Smile -->
                <path d="M 14 22 Q 20 24 26 22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <!-- Lift arrows -->
                <path d="M20 10l3 3h-2v2h-2v-2h-2z" fill="white"/>
                <path d="M20 30l-3-3h2v-2h2v2h2z" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        // Show warning for out-of-service lifts with pulse animation
        if (isOutOfService) {
          // Create animated SVG with embedded pulse animation
          const animatedSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <defs>
                <style>
                  @keyframes pulse { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0.4)); } 50% { opacity: 0.8; filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6)); } }
                  .pulse-circle { animation: pulse 2s ease-in-out infinite; }
                </style>
              </defs>
              <g class="pulse-circle">
                <circle cx="16" cy="16" r="14" fill="#ef4444" opacity="0.9"/>
                <path d="M16 10l4 4h-3v4h-2v-4h-3z" fill="white"/>
                <path d="M16 22l-4-4h3v-4h2v4h3z" fill="white"/>
              </g>
            </svg>
          `;
          
          marker.setIcon({
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(animatedSvg),
            scaledSize: new google.maps.Size(32, 32),
          });
          
          marker.addListener("click", () => {
            toast.error(`⚠️ ${lift.location} is currently out of service`);
          });
        }
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
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="#a855f7" opacity="0.95"/>
                <circle cx="20" cy="20" r="15" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="15" cy="15" r="2" fill="white"/>
                <circle cx="25" cy="15" r="2" fill="white"/>
                <path d="M 14 22 Q 20 24 26 22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <rect x="10" y="10" width="20" height="3" fill="white" rx="1.5" opacity="0.8"/>
                <rect x="12" y="7" width="2" height="6" fill="white" rx="1" opacity="0.7"/>
                <rect x="26" y="7" width="2" height="6" fill="white" rx="1" opacity="0.7"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
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
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="#f43f5e" opacity="0.95"/>
                <circle cx="20" cy="20" r="15" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="15" cy="15" r="2" fill="white"/>
                <circle cx="25" cy="15" r="2" fill="white"/>
                <path d="M 14 22 Q 20 24 26 22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <g opacity="0.8">
                  <rect x="10" y="12" width="3" height="3" fill="white"/>
                  <rect x="15" y="12" width="3" height="3" fill="white"/>
                  <rect x="20" y="12" width="3" height="3" fill="white"/>
                  <rect x="25" y="12" width="3" height="3" fill="white"/>
                  <rect x="10" y="17" width="3" height="3" fill="white"/>
                  <rect x="15" y="17" width="3" height="3" fill="white"/>
                  <rect x="20" y="17" width="3" height="3" fill="white"/>
                  <rect x="25" y="17" width="3" height="3" fill="white"/>
                </g>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
          },
        });
      }
    });
  }, [map, lifts, footbridges, zebraCrossings, liftStatuses, outOfServiceLifts]);

  // Add AccessGuide.hk accessible locations with zoom-based visibility
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    accessibleMarkersRef.current.forEach(marker => marker.setMap(null));
    accessibleMarkersRef.current = [];

    // Only show when zoomed in 3x (zoom >= 16, since default is 13)
    const shouldShow = currentZoom >= 16;

    if (!shouldShow) return;

    ACCESSIBLE_LOCATIONS.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: uiLang === "zh-HK" ? location.nameCh : location.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <path d="M18 2c-5.5 0-10 4.5-10 10 0 7.5 10 20 10 20s10-12.5 10-20c0-5.5-4.5-10-10-10z" fill="#9333ea" opacity="0.9"/>
              <circle cx="18" cy="12" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(36, 36),
        },
      });

      // Make accessible locations clickable for route planning
      marker.addListener("click", () => {
        const name = uiLang === "zh-HK" ? location.nameCh : location.name;
        setDestination(name);
        toast.success(`${t("to")}: ${name}`);
      });

      accessibleMarkersRef.current.push(marker);
    });
  }, [map, currentZoom, uiLang]);

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
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M20 2c-6 0-11 5-11 11 0 8 11 23 11 23s11-15 11-23c0-6-5-11-11-11z" fill="#10b981" opacity="0.9"/>
            <circle cx="20" cy="13" r="5" fill="white"/>
            <text x="20" y="18" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#10b981">A</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
      },
    });

    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos && geocoder) {
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setOrigin(results[0].formatted_address);
            toast.info(t("from") + " " + results[0].formatted_address);
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
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M20 2c-6 0-11 5-11 11 0 8 11 23 11 23s11-15 11-23c0-6-5-11-11-11z" fill="#f43f5e" opacity="0.9"/>
            <circle cx="20" cy="13" r="5" fill="white"/>
            <text x="20" y="18" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#f43f5e">B</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
      },
    });

    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos && geocoder) {
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setDestination(results[0].formatted_address);
            toast.info(t("to") + " " + results[0].formatted_address);
          }
        });
      }
    });

    setDestinationMarker(marker);
  };

  // Parse route steps for turn-by-turn navigation
  const parseRouteSteps = (route: google.maps.DirectionsRoute): NavigationStep[] => {
    const steps: NavigationStep[] = [];
    const leg = route.legs[0];
    
    if (!leg || !leg.steps) return steps;

    leg.steps.forEach((step) => {
      // Detect facility type from instructions
      let facilityType: NavigationStep["facilityType"] = "level";
      const instruction = step.instructions.toLowerCase();
      
      if (instruction.includes("lift") || instruction.includes("elevator")) {
        facilityType = "lift";
      } else if (instruction.includes("ramp")) {
        facilityType = "ramp";
      } else if (instruction.includes("stairs") || instruction.includes("steps")) {
        facilityType = "stairs";
      }

      steps.push({
        instruction: step.instructions.replace(/<[^>]*>/g, ""), // Remove HTML tags
        distance: step.distance?.text || "",
        duration: step.duration?.text || "",
        travelMode: step.travel_mode,
        facilityType,
      });
    });

    return steps;
  };

  // Calculate accessible route
  const calculateRoute = async () => {
    if (!directionsService || !directionsRenderer || !origin || !destination) {
      toast.error(t("enterOrigin"));
      return;
    }

    setIsCalculating(true);

    try {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: travelMode === "WALKING" ? google.maps.TravelMode.WALKING : google.maps.TravelMode.TRANSIT,
        provideRouteAlternatives: true,
        language: uiLang === "zh-HK" ? "zh-HK" : "en",
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
          
          // Parse steps for turn-by-turn navigation
          const steps = parseRouteSteps(route);
          setNavigationSteps(steps);
          setCurrentStepIndex(0);
          setShowNavigation(true);
          
          // Build transit info message
          let message = `${leg.distance?.text}, ${leg.duration?.text}`;
          if (travelMode === "TRANSIT" && leg.steps) {
            const transitSteps = leg.steps.filter(step => step.travel_mode === "TRANSIT");
            if (transitSteps.length > 0) {
              message += ` (${transitSteps.length} ${t("publicTransport")})`;
            }
          }
          
          toast.success(message);
          
          // Save to history
          saveRouteHistory(origin, destination);
          
          // Speak route information if voice navigation is enabled
          if (user?.voiceNavigation) {
            let speechText = `${leg.distance?.text}. ${leg.duration?.text}.`;
            if (travelMode === "TRANSIT") {
              speechText += uiLang === "zh-HK" ? " 使用無障礙公共交通。" : " Using accessible public transport.";
            }
            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.lang = uiLang;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        } else {
          toast.error(uiLang === "zh-HK" ? "無法計算路線。請嘗試不同位置。" : "Could not calculate route. Please try different locations.");
        }
        setIsCalculating(false);
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error(uiLang === "zh-HK" ? "計算路線時出錯" : "Error calculating route");
      setIsCalculating(false);
    }
  };

  // Speak current navigation step
  const speakStep = (step: NavigationStep) => {
    if (!user?.voiceNavigation) return;
    
    let text = step.instruction;
    if (step.facilityType === "lift") {
      text += uiLang === "zh-HK" ? "。使用無障礙升降機。" : ". Use the accessible lift.";
    } else if (step.facilityType === "ramp") {
      text += uiLang === "zh-HK" ? "。有無障礙斜道。" : ". Accessible ramp available.";
    } else if (step.facilityType === "stairs") {
      text += uiLang === "zh-HK" ? "。警告：前方有樓梯。尋找其他無障礙路線。" : ". Warning: stairs ahead. Look for alternative accessible route.";
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = uiLang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      speakStep(navigationSteps[newIndex]);
    } else {
      const arrivalMsg = uiLang === "zh-HK" ? "您已到達目的地！" : "You have arrived at your destination!";
      toast.success(arrivalMsg);
      if (user?.voiceNavigation) {
        const utterance = new SpeechSynthesisUtterance(arrivalMsg);
        utterance.lang = uiLang;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Use current location as origin
  const useCurrentLocation = () => {
    if (userLocation) {
      setOrigin(`${userLocation.lat},${userLocation.lng}`);
      toast.success(t("useCurrentLocation"));
    } else {
      toast.error(uiLang === "zh-HK" ? "位置不可用。請啟用位置服務。" : "Location not available. Please enable location services.");
    }
  };

  // Swap origin and destination
  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    toast.info(t("swapLocations"));
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
    setShowNavigation(false);
    setNavigationSteps([]);
    setCurrentStepIndex(0);
    toast.info(t("clearRoute"));
  };

  // Start speech recognition for origin
  const startListeningOrigin = () => {
    if (!recognition) {
      toast.error(uiLang === "zh-HK" ? "此瀏覽器不支援語音識別" : "Speech recognition not supported in this browser");
      return;
    }

    setIsListeningOrigin(true);
    recognition.lang = speechLang;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setOrigin(transcript);
      toast.success(`${t("from")}: ${transcript}`);
      
      if (user?.voiceNavigation) {
        const msg = uiLang === "zh-HK" ? `起點設定為${transcript}` : `Starting location set to ${transcript}`;
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = uiLang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error(uiLang === "zh-HK" ? "無法識別語音。請再試一次。" : "Could not recognize speech. Please try again.");
      setIsListeningOrigin(false);
    };

    recognition.onend = () => {
      setIsListeningOrigin(false);
    };

    recognition.start();
    toast.info(uiLang === "zh-HK" ? "聆聽中...請說出起點位置" : "Listening... Speak your starting location");
  };

  // Start speech recognition for destination
  const startListeningDestination = () => {
    if (!recognition) {
      toast.error(uiLang === "zh-HK" ? "此瀏覽器不支援語音識別" : "Speech recognition not supported in this browser");
      return;
    }

    setIsListeningDestination(true);
    recognition.lang = speechLang;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDestination(transcript);
      toast.success(`${t("to")}: ${transcript}`);
      
      if (user?.voiceNavigation) {
        const msg = uiLang === "zh-HK" ? `目的地設定為${transcript}` : `Destination set to ${transcript}`;
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = uiLang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error(uiLang === "zh-HK" ? "無法識別語音。請再試一次。" : "Could not recognize speech. Please try again.");
      setIsListeningDestination(false);
    };

    recognition.onend = () => {
      setIsListeningDestination(false);
    };

    recognition.start();
    toast.info(uiLang === "zh-HK" ? "聆聽中...請說出目的地" : "Listening... Speak your destination");
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListeningOrigin(false);
    setIsListeningDestination(false);
  };

  // Toggle speech and UI language
  const toggleLanguage = () => {
    const newLang = speechLang === "en-US" ? "zh-HK" : "en-US";
    setSpeechLang(newLang);
    setUiLang(newLang);
    toast.info(newLang === "en-US" ? "Language switched to English" : "語言已切換至中文");
  };

  // Use quick location
  const useQuickLocation = (location: typeof QUICK_LOCATIONS[0]) => {
    const name = t(location.nameKey as any);
    setDestination(name);
    toast.success(`${t("to")}: ${name}`);
    setShowQuickLocations(false);
  };

  // Use history item
  const useHistoryItem = (item: RouteHistory) => {
    setOrigin(item.from);
    setDestination(item.to);
    toast.success(uiLang === "zh-HK" ? "已從記錄載入路線" : "Route loaded from history");
    setShowHistory(false);
  };

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // Max 3 photos
      setNotePhotos(files);
    }
  };

  // Submit accessibility note
  const submitNote = async () => {
    if (!user) {
      toast.error(uiLang === "zh-HK" ? "請登入以新增備註" : "Please log in to add notes");
      return;
    }

    if (!noteLocation) {
      toast.error(uiLang === "zh-HK" ? "請在地圖上選擇位置" : "Please select a location on the map");
      return;
    }

    if (!noteComment.trim()) {
      toast.error(uiLang === "zh-HK" ? "請輸入評論" : "Please enter a comment");
      return;
    }

    setIsUploadingNote(true);

    try {
      // Add the note
      const result = await addNoteMutation.mutateAsync({
        facilityType: "general",
        locationName: noteLocation.name,
        latitude: noteLocation.lat.toString(),
        longitude: noteLocation.lng.toString(),
        rating: noteRating,
        condition: noteCondition,
        comment: noteComment,
      });

      // Photo upload would be handled via a separate upload endpoint
      // For now, notes are submitted without photos
      if (notePhotos.length > 0) {
        toast.info(uiLang === "zh-HK" ? "相片上傳功能即將推出！" : "Photo upload feature coming soon!");
      }

      toast.success(uiLang === "zh-HK" ? "感謝您為社區作出貢獻！" : "Thank you for contributing to the community!");
      setShowAddNote(false);
      setNoteLocation(null);
      setNoteComment("");
      setNotePhotos([]);
      setNoteRating(3);
      setNoteCondition("good");
    } catch (error) {
      console.error("Error submitting note:", error);
      toast.error(uiLang === "zh-HK" ? "提交備註失敗。請再試一次。" : "Failed to submit note. Please try again.");
    } finally {
      setIsUploadingNote(false);
    }
  };

  // Get facility icon
  const getFacilityIcon = (type?: string) => {
    switch (type) {
      case "lift":
        return "🛗";
      case "ramp":
        return "♿";
      case "stairs":
        return "🚶";
      default:
        return "➡️";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-primary-foreground p-4 z-50">
        {t("skipToMain")}
      </a>

      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10" />
            <h1 className="text-2xl font-bold">{t("appTitle")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowDestinationsMenu(!showDestinationsMenu)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Popular Destinations"
            >
              <MapPinned className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowMenu(!showMenu)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              aria-label={t("toggleMenu")}
            >
              {showMenu ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Destinations Menu */}
      {showDestinationsMenu && (
        <div className="bg-card border-b-2 border-border p-4 max-h-[70vh] overflow-y-auto">
          <div className="container space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPinned className="w-6 h-6" />
              {uiLang === "zh-HK" ? "熱門目的地" : "Popular Destinations"}
            </h2>
            
            {/* Category buttons */}
            <div className="flex flex-wrap gap-2">
              {["Shopping", "Dining", "Medical", "Government", "Transport", "Parks", "Culture", "Entertainment"].map(cat => {
                const icons = {
                  Shopping: ShoppingBag,
                  Dining: UtensilsCrossed,
                  Medical: Hospital,
                  Government: Landmark,
                  Transport: Train,
                  Parks: TreePine,
                  Culture: Palette,
                  Entertainment: PartyPopper,
                };
                const Icon = icons[cat as keyof typeof icons];
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {cat}
                  </Button>
                );
              })}
            </div>

            {/* Destinations list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allDestinations
                ?.filter(d => !selectedCategory || d.category === selectedCategory)
                .map(dest => (
                  <Button
                    key={dest.id}
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => {
                      setDestination(uiLang === "zh-HK" ? dest.nameZh : dest.name);
                      toast.success(`${t("to")}: ${uiLang === "zh-HK" ? dest.nameZh : dest.name}`);
                      setShowDestinationsMenu(false);
                    }}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2 w-full">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{uiLang === "zh-HK" ? dest.nameZh : dest.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-7">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 rounded">{dest.category}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Number(dest.accessibilityRating) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}

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
              <Heart className="w-6 h-6 mr-3 text-pink-500" />
              {t("savedLocations")}
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-start text-lg">
              <Navigation className="w-6 h-6 mr-3" />
              {t("routeHistory")}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full justify-start text-lg"
              onClick={() => window.location.href = '/settings'}
            >
              <Volume2 className="w-6 h-6 mr-3" />
              {t("settings")}
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
              <CardTitle className="text-xl">{t("planRoute")}</CardTitle>
              <CardDescription className="text-base">
                {t("findRoutes")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cartoon Mascot */}
              <CartoonMascot />

              {/* Language toggle */}
              <div className="flex justify-end">
                <Button
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="text-sm font-semibold"
                >
                  {speechLang === "en-US" ? "EN" : "中"}
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="origin" className="text-base font-semibold">
                  {t("from")}
                </label>
                <div className="flex gap-2">
                  <Input
                    id="origin"
                    placeholder={t("enterOrigin")}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="text-base min-h-[3rem]"
                  />
                  <Button
                    onClick={useCurrentLocation}
                    variant="outline"
                    size="lg"
                    className="shrink-0"
                    aria-label={t("useCurrentLocation")}
                  >
                    <Navigation className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={isListeningOrigin ? stopListening : startListeningOrigin}
                    variant={isListeningOrigin ? "destructive" : "outline"}
                    size="lg"
                    className="shrink-0"
                    aria-label={isListeningOrigin ? t("stopListening") : t("speakOrigin")}
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
                  aria-label={t("swapLocations")}
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
                  {t("to")}
                </label>
                <div className="flex gap-2">
                  <Input
                    id="destination"
                    placeholder={t("enterDestination")}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-base min-h-[3rem]"
                  />
                  <Button
                    onClick={isListeningDestination ? stopListening : startListeningDestination}
                    variant={isListeningDestination ? "destructive" : "outline"}
                    size="lg"
                    className="shrink-0"
                    aria-label={isListeningDestination ? t("stopListening") : t("speakDestination")}
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
                  {t("history")}
                </Button>
                <Button
                  onClick={() => setShowQuickLocations(!showQuickLocations)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t("quickLocations")}
                </Button>
              </div>

              {/* Route history */}
              {showHistory && routeHistory.length > 0 && (
                <Card className="bg-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("recentRoutes")}</CardTitle>
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
                    <CardTitle className="text-sm">{t("quickDestinations")}</CardTitle>
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
                            <div className="font-semibold text-sm">{t(loc.nameKey as any)}</div>
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
                  {t("travelMode")}
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
                    {t("publicTransport")}
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
                    {t("walkingOnly")}
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
                    <CuteSpinner />
                  ) : (
                    <>
                      <Search className="w-6 h-6 mr-2" />
                      {t("findAccessibleRoute")}
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
                    {t("clearRoute")}
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {t("tip")}
              </div>
            </CardContent>
          </Card>

          {/* Turn-by-turn navigation panel */}
          {showNavigation && navigationSteps.length > 0 && (
            <Card className="border-2 border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t("turnByTurnNav")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNavigation(false)}
                  >
                    {showNavigation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                </div>
                <CardDescription className="text-sm">
                  {t("stepOf", { current: currentStepIndex + 1, total: navigationSteps.length })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              {/* Cartoon Mascot */}
              <CartoonMascot />

                {/* Current step */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getFacilityIcon(navigationSteps[currentStepIndex]?.facilityType)}</span>
                    <div className="flex-1">
                      <p className="text-base font-semibold mb-2">
                        {navigationSteps[currentStepIndex]?.instruction}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{navigationSteps[currentStepIndex]?.distance}</span>
                        <span>{navigationSteps[currentStepIndex]?.duration}</span>
                      </div>
                      {navigationSteps[currentStepIndex]?.facilityType === "stairs" && (
                        <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{uiLang === "zh-HK" ? "偵測到樓梯 - 尋找無障礙替代路線" : "Stairs detected - look for accessible alternative"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => speakStep(navigationSteps[currentStepIndex])}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    disabled={!user?.voiceNavigation}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {t("speakStep")}
                  </Button>
                  <Button
                    onClick={nextStep}
                    size="lg"
                    className="flex-1"
                    disabled={currentStepIndex >= navigationSteps.length - 1}
                  >
                    {t("nextStep")}
                  </Button>
                </div>

                {/* All steps preview */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {navigationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm ${idx === currentStepIndex ? 'bg-primary/20' : 'bg-muted/50'}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getFacilityIcon(step.facilityType)}</span>
                        <div className="flex-1">
                          <p className="font-medium">{idx + 1}. {step.instruction}</p>
                          <p className="text-xs text-muted-foreground">{step.distance} • {step.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">{t("mapLegend")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                  <circle cx="16" cy="16" r="14" fill="#ec4899" opacity="0.9"/>
                  <path d="M16 10l4 4h-3v4h-2v-4h-3z" fill="white"/>
                  <path d="M16 22l-4-4h3v-4h2v4h3z" fill="white"/>
                </svg>
                <span className="text-base">{t("accessibleLifts")}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0 animate-pulse">
                  <circle cx="16" cy="16" r="14" fill="#ef4444" opacity="0.9"/>
                  <path d="M16 10l4 4h-3v4h-2v-4h-3z" fill="white"/>
                  <path d="M16 22l-4-4h3v-4h2v4h3z" fill="white"/>
                </svg>
                <span className="text-base">{t("outOfServiceLifts")}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                  <circle cx="16" cy="16" r="14" fill="#a855f7" opacity="0.9"/>
                  <rect x="8" y="14" width="16" height="4" fill="white" rx="1"/>
                  <rect x="10" y="10" width="2" height="8" fill="white" rx="1"/>
                  <rect x="20" y="10" width="2" height="8" fill="white" rx="1"/>
                </svg>
                <span className="text-base">{t("accessibleFootbridges")}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                  <circle cx="16" cy="16" r="14" fill="#f43f5e" opacity="0.9"/>
                  <rect x="10" y="12" width="12" height="2" fill="white"/>
                  <rect x="10" y="16" width="12" height="2" fill="white"/>
                  <circle cx="16" cy="16" r="2" fill="#fbbf24"/>
                </svg>
                <span className="text-base">{t("extendedCrossingTime")}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
                  <path d="M18 2c-5.5 0-10 4.5-10 10 0 7.5 10 20 10 20s10-12.5 10-20c0-5.5-4.5-10-10-10z" fill="#9333ea" opacity="0.9"/>
                  <circle cx="18" cy="12" r="4" fill="white"/>
                </svg>
                <span className="text-base">{t("accessibleLocations")}</span>
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
          
          {/* Collapsible Legend Panel */}
          <div className={`absolute bottom-4 right-4 transition-all duration-300 ${showLegend ? 'w-72' : 'w-auto'}`}>
            {showLegend ? (
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-pink-200 shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-pink-500" />
                    {t("legend")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLegend(false)}
                    className="h-8 w-8 p-0"
                    aria-label={t("hideLegend")}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {/* Lift - Working */}
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                      <circle cx="16" cy="16" r="14" fill="#ec4899" opacity="0.9"/>
                      <path d="M16 10l4 4h-3v4h-2v-4h-3z" fill="white"/>
                      <path d="M16 22l-4-4h3v-4h2v4h3z" fill="white"/>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("accessibleLifts")}</p>
                      <p className="text-xs text-muted-foreground">{t("liftDescription")}</p>
                    </div>
                  </div>
                  
                  {/* Lift - Out of Service */}
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0 animate-pulse">
                      <circle cx="16" cy="16" r="14" fill="#ef4444" opacity="0.9"/>
                      <path d="M16 10l4 4h-3v4h-2v-4h-3z" fill="white"/>
                      <path d="M16 22l-4-4h3v-4h2v4h3z" fill="white"/>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("outOfServiceLifts")}</p>
                      <p className="text-xs text-muted-foreground">{t("outOfServiceDescription")}</p>
                    </div>
                  </div>
                  
                  {/* Footbridge */}
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                      <circle cx="16" cy="16" r="14" fill="#a855f7" opacity="0.9"/>
                      <rect x="8" y="14" width="16" height="4" fill="white" rx="1"/>
                      <rect x="10" y="10" width="2" height="8" fill="white" rx="1"/>
                      <rect x="20" y="10" width="2" height="8" fill="white" rx="1"/>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("accessibleFootbridges")}</p>
                      <p className="text-xs text-muted-foreground">{t("footbridgeDescription")}</p>
                    </div>
                  </div>
                  
                  {/* Zebra Crossing */}
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                      <circle cx="16" cy="16" r="14" fill="#f43f5e" opacity="0.9"/>
                      <rect x="10" y="12" width="12" height="2" fill="white"/>
                      <rect x="10" y="16" width="12" height="2" fill="white"/>
                      <circle cx="16" cy="16" r="2" fill="#fbbf24"/>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("extendedCrossingTime")}</p>
                      <p className="text-xs text-muted-foreground">{t("crossingDescription")}</p>
                    </div>
                  </div>
                  
                  {/* Accessible Location */}
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
                      <path d="M18 2c-5.5 0-10 4.5-10 10 0 7.5 10 20 10 20s10-12.5 10-20c0-5.5-4.5-10-10-10z" fill="#9333ea" opacity="0.9"/>
                      <circle cx="18" cy="12" r="4" fill="white"/>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("accessibleLocations")}</p>
                      <p className="text-xs text-muted-foreground">{t("locationDescription")}</p>
                    </div>
                  </div>
                  
                  {/* Origin Marker */}
                  <div className="flex items-start gap-3 pt-2 border-t">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
                      <path d="M20 2c-6 0-11 5-11 11 0 8 11 23 11 23s11-15 11-23c0-6-5-11-11-11z" fill="#10b981" opacity="0.9"/>
                      <circle cx="20" cy="13" r="5" fill="white"/>
                      <text x="20" y="18" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#10b981">A</text>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("from")}</p>
                      <p className="text-xs text-muted-foreground">{t("originMarker")}</p>
                    </div>
                  </div>
                  
                  {/* Destination Marker */}
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
                      <path d="M20 2c-6 0-11 5-11 11 0 8 11 23 11 23s11-15 11-23c0-6-5-11-11-11z" fill="#f43f5e" opacity="0.9"/>
                      <circle cx="20" cy="13" r="5" fill="white"/>
                      <text x="20" y="18" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#f43f5e">B</text>
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{t("to")}</p>
                      <p className="text-xs text-muted-foreground">{t("destinationMarker")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={() => setShowLegend(true)}
                className="bg-white/95 backdrop-blur-sm border-2 border-pink-200 shadow-lg hover:bg-pink-50"
                variant="outline"
                size="lg"
                aria-label={t("showLegend")}
              >
                <Info className="w-5 h-5 text-pink-500 mr-2" />
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Add Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("addNote")}</DialogTitle>
            <DialogDescription>
              {t("shareExperience")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">{t("location")}</label>
              <p className="text-sm text-muted-foreground">{noteLocation?.name}</p>
            </div>

            <div>
              <label className="text-sm font-semibold">{t("rating")}</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={noteRating >= star ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNoteRating(star)}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">{t("condition")}</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(["excellent", "good", "fair", "poor", "inaccessible"] as const).map((cond) => (
                  <Button
                    key={cond}
                    variant={noteCondition === cond ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNoteCondition(cond)}
                  >
                    {t(cond)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">{t("comment")}</label>
              <Textarea
                placeholder={t("describeConditions")}
                value={noteComment}
                onChange={(e) => setNoteComment(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">{t("photos")}</label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="mt-2"
              />
              {notePhotos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("photosSelected", { count: notePhotos.length })}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={submitNote}
                disabled={isUploadingNote || !noteComment.trim()}
                className="flex-1"
              >
                {isUploadingNote ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t("submitNote")}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowAddNote(false)}
                variant="outline"
                disabled={isUploadingNote}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
