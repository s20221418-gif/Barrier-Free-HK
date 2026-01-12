import { drizzle } from "drizzle-orm/mysql2";
import { popularDestinations } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const destinationsRaw = [
  // Shopping Malls (10)
  { name: "Times Square", nameZh: "時代廣場", category: "Shopping", lat: 22.2782, lng: 114.1826, accessibilityRating: 5 },
  { name: "Harbour City", nameZh: "海港城", category: "Shopping", lat: 22.2943, lng: 114.1683, accessibilityRating: 5 },
  { name: "IFC Mall", nameZh: "國際金融中心商場", category: "Shopping", lat: 22.2856, lng: 114.1577, accessibilityRating: 5 },
  { name: "Pacific Place", nameZh: "太古廣場", category: "Shopping", lat: 22.2770, lng: 114.1654, accessibilityRating: 5 },
  { name: "Festival Walk", nameZh: "又一城", category: "Shopping", lat: 22.3373, lng: 114.1747, accessibilityRating: 5 },
  { name: "Langham Place", nameZh: "朗豪坊", category: "Shopping", lat: 22.3185, lng: 114.1695, accessibilityRating: 4 },
  { name: "APM", nameZh: "創紀之城", category: "Shopping", lat: 22.3113, lng: 114.2249, accessibilityRating: 5 },
  { name: "Citygate Outlets", nameZh: "東薈城名店倉", category: "Shopping", lat: 22.2886, lng: 113.9364, accessibilityRating: 5 },
  { name: "Elements", nameZh: "圓方", category: "Shopping", lat: 22.3045, lng: 114.1611, accessibilityRating: 5 },
  { name: "MegaBox", nameZh: "MegaBox", category: "Shopping", lat: 22.3199, lng: 114.2094, accessibilityRating: 4 },
  
  // Dining & Food (8)
  { name: "Tsim Sha Tsui Promenade", nameZh: "尖沙咀海濱長廊", category: "Dining", lat: 22.2943, lng: 114.1722, accessibilityRating: 5 },
  { name: "Soho Central", nameZh: "蘇豪區", category: "Dining", lat: 22.2826, lng: 114.1533, accessibilityRating: 3 },
  { name: "Causeway Bay Food Street", nameZh: "銅鑼灣美食街", category: "Dining", lat: 22.2800, lng: 114.1850, accessibilityRating: 4 },
  { name: "Lei Yue Mun Seafood Village", nameZh: "鯉魚門海鮮村", category: "Dining", lat: 22.2896, lng: 114.2370, accessibilityRating: 3 },
  { name: "Lamma Island Seafood", nameZh: "南丫島海鮮", category: "Dining", lat: 22.2130, lng: 114.1290, accessibilityRating: 2 },
  { name: "Tai Hang Food Street", nameZh: "大坑美食街", category: "Dining", lat: 22.2788, lng: 114.1911, accessibilityRating: 3 },
  { name: "Sai Kung Waterfront", nameZh: "西貢海濱", category: "Dining", lat: 22.3817, lng: 114.2740, accessibilityRating: 3 },
  { name: "Yau Ma Tei Temple Street", nameZh: "油麻地廟街", category: "Dining", lat: 22.3080, lng: 114.1710, accessibilityRating: 3 },
  
  // Medical Facilities (8)
  { name: "Queen Mary Hospital", nameZh: "瑪麗醫院", category: "Medical", lat: 22.2700, lng: 114.1340, accessibilityRating: 5 },
  { name: "Queen Elizabeth Hospital", nameZh: "伊利沙伯醫院", category: "Medical", lat: 22.3088, lng: 114.1744, accessibilityRating: 5 },
  { name: "Prince of Wales Hospital", nameZh: "威爾斯親王醫院", category: "Medical", lat: 22.3738, lng: 114.2034, accessibilityRating: 5 },
  { name: "Tuen Mun Hospital", nameZh: "屯門醫院", category: "Medical", lat: 22.4110, lng: 113.9760, accessibilityRating: 5 },
  { name: "Pamela Youde Hospital", nameZh: "東區尤德夫人那打素醫院", category: "Medical", lat: 22.2760, lng: 114.2370, accessibilityRating: 5 },
  { name: "United Christian Hospital", nameZh: "基督教聯合醫院", category: "Medical", lat: 22.3189, lng: 114.2234, accessibilityRating: 5 },
  { name: "Kwong Wah Hospital", nameZh: "廣華醫院", category: "Medical", lat: 22.3155, lng: 114.1710, accessibilityRating: 4 },
  { name: "Princess Margaret Hospital", nameZh: "瑪嘉烈醫院", category: "Medical", lat: 22.3388, lng: 114.1403, accessibilityRating: 5 },
  
  // Government Offices (6)
  { name: "Central Government Offices", nameZh: "政府總部", category: "Government", lat: 22.2820, lng: 114.1650, accessibilityRating: 5 },
  { name: "Immigration Tower", nameZh: "入境事務大樓", category: "Government", lat: 22.3030, lng: 114.1720, accessibilityRating: 5 },
  { name: "Wan Chai Government Offices", nameZh: "灣仔政府大樓", category: "Government", lat: 22.2776, lng: 114.1730, accessibilityRating: 5 },
  { name: "Kwun Tong Government Offices", nameZh: "觀塘政府合署", category: "Government", lat: 22.3113, lng: 114.2249, accessibilityRating: 5 },
  { name: "Sha Tin Government Offices", nameZh: "沙田政府合署", category: "Government", lat: 22.3810, lng: 114.1890, accessibilityRating: 5 },
  { name: "Tuen Mun Government Offices", nameZh: "屯門政府合署", category: "Government", lat: 22.3920, lng: 113.9770, accessibilityRating: 5 },
  
  // MTR Stations (10)
  { name: "Hong Kong Station", nameZh: "香港站", category: "Transport", lat: 22.2850, lng: 114.1580, accessibilityRating: 5 },
  { name: "Central Station", nameZh: "中環站", category: "Transport", lat: 22.2820, lng: 114.1580, accessibilityRating: 5 },
  { name: "Admiralty Station", nameZh: "金鐘站", category: "Transport", lat: 22.2790, lng: 114.1650, accessibilityRating: 5 },
  { name: "Tsim Sha Tsui Station", nameZh: "尖沙咀站", category: "Transport", lat: 22.2976, lng: 114.1722, accessibilityRating: 5 },
  { name: "Mong Kok Station", nameZh: "旺角站", category: "Transport", lat: 22.3190, lng: 114.1690, accessibilityRating: 5 },
  { name: "Kowloon Station", nameZh: "九龍站", category: "Transport", lat: 22.3050, lng: 114.1610, accessibilityRating: 5 },
  { name: "Causeway Bay Station", nameZh: "銅鑼灣站", category: "Transport", lat: 22.2800, lng: 114.1850, accessibilityRating: 5 },
  { name: "Quarry Bay Station", nameZh: "鰂魚涌站", category: "Transport", lat: 22.2880, lng: 114.2100, accessibilityRating: 5 },
  { name: "Tung Chung Station", nameZh: "東涌站", category: "Transport", lat: 22.2890, lng: 113.9410, accessibilityRating: 5 },
  { name: "Airport Express Station", nameZh: "機場快線", category: "Transport", lat: 22.3150, lng: 113.9370, accessibilityRating: 5 },
  
  // Parks & Recreation (8)
  { name: "Victoria Park", nameZh: "維多利亞公園", category: "Parks", lat: 22.2820, lng: 114.1920, accessibilityRating: 5 },
  { name: "Hong Kong Park", nameZh: "香港公園", category: "Parks", lat: 22.2770, lng: 114.1620, accessibilityRating: 4 },
  { name: "Kowloon Park", nameZh: "九龍公園", category: "Parks", lat: 22.3020, lng: 114.1710, accessibilityRating: 5 },
  { name: "Tamar Park", nameZh: "添馬公園", category: "Parks", lat: 22.2830, lng: 114.1660, accessibilityRating: 5 },
  { name: "Tsim Sha Tsui Waterfront", nameZh: "尖沙咀海濱", category: "Parks", lat: 22.2960, lng: 114.1720, accessibilityRating: 5 },
  { name: "Shing Mun Reservoir", nameZh: "城門水塘", category: "Parks", lat: 22.3980, lng: 114.1490, accessibilityRating: 2 },
  { name: "Tai Po Waterfront Park", nameZh: "大埔海濱公園", category: "Parks", lat: 22.4450, lng: 114.1720, accessibilityRating: 5 },
  { name: "West Kowloon Cultural District", nameZh: "西九文化區", category: "Parks", lat: 22.3020, lng: 114.1620, accessibilityRating: 5 },
  
  // Culture & Museums (6)
  { name: "Hong Kong Museum of History", nameZh: "香港歷史博物館", category: "Culture", lat: 22.3010, lng: 114.1750, accessibilityRating: 5 },
  { name: "Hong Kong Science Museum", nameZh: "香港科學館", category: "Culture", lat: 22.3010, lng: 114.1770, accessibilityRating: 5 },
  { name: "Hong Kong Space Museum", nameZh: "香港太空館", category: "Culture", lat: 22.2940, lng: 114.1720, accessibilityRating: 5 },
  { name: "Hong Kong Museum of Art", nameZh: "香港藝術館", category: "Culture", lat: 22.2940, lng: 114.1710, accessibilityRating: 5 },
  { name: "M+ Museum", nameZh: "M+博物館", category: "Culture", lat: 22.3040, lng: 114.1610, accessibilityRating: 5 },
  { name: "Hong Kong Heritage Museum", nameZh: "香港文化博物館", category: "Culture", lat: 22.3750, lng: 114.1870, accessibilityRating: 5 },
  
  // Entertainment & Attractions (6)
  { name: "Ocean Park", nameZh: "海洋公園", category: "Entertainment", lat: 22.2470, lng: 114.1750, accessibilityRating: 4 },
  { name: "Hong Kong Disneyland", nameZh: "香港迪士尼樂園", category: "Entertainment", lat: 22.3130, lng: 114.0410, accessibilityRating: 5 },
  { name: "Ngong Ping 360", nameZh: "昂坪360", category: "Entertainment", lat: 22.2530, lng: 113.9050, accessibilityRating: 4 },
  { name: "Peak Tram", nameZh: "山頂纜車", category: "Entertainment", lat: 22.2780, lng: 114.1610, accessibilityRating: 3 },
  { name: "Star Ferry", nameZh: "天星小輪", category: "Entertainment", lat: 22.2940, lng: 114.1690, accessibilityRating: 3 },
  { name: "Sky100", nameZh: "天際100", category: "Entertainment", lat: 22.3050, lng: 114.1610, accessibilityRating: 5 },
];

async function seedDestinations() {
  try {
    console.log("Seeding popular destinations...");
    
    // Convert lat/lng to strings for decimal columns
    const destinations = destinationsRaw.map(d => ({
      ...d,
      latitude: d.lat.toString(),
      longitude: d.lng.toString(),
    }));
    
    for (const dest of destinations) {
      await db.insert(popularDestinations).values(dest);
    }
    
    console.log(`✅ Successfully seeded ${destinations.length} popular destinations`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding destinations:", error);
    process.exit(1);
  }
}

seedDestinations();
