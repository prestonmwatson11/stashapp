import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RAW_SHOPS from "./lns_combined_approved.json";

// ─── FONTS & TOKENS ───────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');`;

// LoveCrafts-inspired palette: deep teal navy + coral + clean whites
const T = {
  bark: "#1C3D5A",
  coffee: "#1C3D5A",
  navy: "#1C3D5A",
  navyDark: "#142D42",
  navyLight: "#2A5278",
  caramel: "#E07060",
  honey: "#E8897C",
  beeswax: "#FDDDD9",
  parchment: "#F2F4F6",
  linen: "#F8F9FA",
  cream: "#FFFFFF",
  softBlack: "#1A1A2E",
  warmGray: "#5A6370",
  sandGray: "#9AA3AE",
  sage: "#4A8C7A",
  fern: "#2D7060",
  dustyRose: "#E07060",
  terracotta: "#C85A4A",
  slate: "#4A6070",
  paleGreen: "#E8F5F2",
  paleTeal: "#E8F5F2",
  palePeach: "#FEF0EE",
  paleBlue: "#EAF2F8",
  white: "#FFFFFF",
  sand: "#DDE3E9",
  sandGrayLight: "#EEF1F4",
};

// ─── THREAD DATABASE ──────────────────────────────────────────────────────────
const THREAD_DB = {
  "DMC": {
    "Perle Cotton": {
      sizes: ["3", "5", "8", "12"],
      colors: [
        { num: "310", name: "Black", hex: "#1C1C1C" },
        { num: "blanc", name: "White", hex: "#FAFAFA" },
        { num: "3750", name: "Antique Blue Very Dark", hex: "#2A4A5A" },
        { num: "3752", name: "Antique Blue Very Light", hex: "#CADCE5" },
        { num: "3346", name: "Hunter Green Med", hex: "#3A7032" },
        { num: "3347", name: "Yellow Green Med", hex: "#5E8A3A" },
        { num: "562", name: "Jade Med", hex: "#3D8A6E" },
        { num: "564", name: "Jade Very Light", hex: "#90C8B2" },
        { num: "905", name: "Parrot Green", hex: "#4A8C2A" },
        { num: "760", name: "Salmon", hex: "#F08080" },
        { num: "761", name: "Salmon Light", hex: "#F8B0A0" },
        { num: "321", name: "Red", hex: "#C0272D" },
        { num: "437", name: "Tan Light", hex: "#E0B080" },
        { num: "436", name: "Tan", hex: "#D09050" },
        { num: "435", name: "Brown Very Light", hex: "#B87840" },
        { num: "738", name: "Tan Very Light", hex: "#F0D0A0" },
        { num: "820", name: "Royal Blue", hex: "#1B3A8A" },
        { num: "932", name: "Antique Blue Light", hex: "#8FAABB" },
        { num: "822", name: "Beige Gray Light", hex: "#E8DED0" },
        { num: "3033", name: "Mocha Brown Very Light", hex: "#D8C8B0" },
        { num: "776", name: "Pink Medium", hex: "#F8A8B0" },
        { num: "225", name: "Shell Pink Ultra Very Light", hex: "#FCDDD8" },
        { num: "704", name: "Chartreuse Bright", hex: "#8FC840" },
        { num: "747", name: "Sky Blue Very Light", hex: "#BEE8F0" },
      ]
    },
    "Stranded Cotton": {
      sizes: ["6-strand skein"],
      colors: [
        { num: "310", name: "Black", hex: "#1C1C1C" },
        { num: "blanc", name: "White", hex: "#FAFAFA" },
        { num: "321", name: "Red", hex: "#C0272D" },
        { num: "820", name: "Royal Blue", hex: "#1B3A8A" },
        { num: "3345", name: "Hunter Green", hex: "#2D5A27" },
      ]
    }
  },
  "Silk & Ivory": {
    "Standard": {
      sizes: ["1 strand"],
      colors: [
        { num: "001", name: "Ivory", hex: "#F8F0DC" },
        { num: "002", name: "Ecru", hex: "#EDE0C8" },
        { num: "054", name: "Sage", hex: "#7A8C72" },
        { num: "055", name: "Fern", hex: "#5A7A52" },
        { num: "056", name: "Forest", hex: "#3A5A3A" },
        { num: "118", name: "Dusty Rose", hex: "#C4897A" },
        { num: "119", name: "Blush", hex: "#D8A898" },
        { num: "120", name: "Mauve", hex: "#A87870" },
        { num: "201", name: "Navy", hex: "#1A2A4A" },
        { num: "203", name: "Periwinkle", hex: "#7080C0" },
        { num: "301", name: "Gold", hex: "#C09830" },
        { num: "302", name: "Honey", hex: "#D4A840" },
      ]
    }
  },
  "Vineyard Silk": {
    "Classic": {
      sizes: ["1 strand"],
      colors: [
        { num: "V01", name: "Snow White", hex: "#FDFCFA" },
        { num: "V14", name: "Gold Rush", hex: "#C89840" },
        { num: "V45", name: "Dusty Teal", hex: "#5A8888" },
        { num: "V46", name: "Deep Teal", hex: "#3A6868" },
        { num: "V67", name: "Burgundy", hex: "#7A2838" },
        { num: "V89", name: "Charcoal", hex: "#484848" },
      ]
    }
  },
  "Pepper Pot Silk": {
    "Standard": {
      sizes: ["1 strand"],
      colors: [
        { num: "P001", name: "Pearl", hex: "#F5EFE8" },
        { num: "P042", name: "Spring Meadow", hex: "#88B868" },
        { num: "P043", name: "Leaf", hex: "#6A9A50" },
        { num: "P156", name: "Terracotta", hex: "#C07850" },
        { num: "P099", name: "Midnight", hex: "#1A1A3A" },
      ]
    }
  },
  "Rainbow Gallery": {
    "Petite Silk Lame Braid": {
      sizes: ["PS", "regular"],
      colors: [
        { num: "PS01", name: "Silver", hex: "#C8C8C8" },
        { num: "PS02", name: "Gold", hex: "#C8A830" },
        { num: "PS03", name: "Copper", hex: "#B86830" },
        { num: "PS15", name: "Black", hex: "#181818" },
      ]
    }
  }
};

// ─── STITCH DATA ──────────────────────────────────────────────────────────────
const STITCHES = [
  { id:1, name:"Basketweave", cat:"Foundation", size:"1×1", tags:["background","large areas","beginner-friendly","minimal distortion"], desc:"The gold standard of needlepoint. Worked diagonally to minimize canvas distortion. Essential for backgrounds and any large fill area.", bestFor:["Large backgrounds","Minimal canvas distortion","Even thread coverage","Over-dyed and hand-dyed threads"], colorNotes:"Shows color uniformly. Beautiful with variegated threads.", diagType:"basketweave" },
  { id:2, name:"Continental", cat:"Foundation", size:"1×1", tags:["outline","border","single row","beginner-friendly"], desc:"Simple horizontal tent stitch rows. More distortion than basketweave, but perfect for outlines, single rows, and lettering.", bestFor:["Outlines and borders","Lettering","Tiny isolated areas","Single-row details"], colorNotes:"Sharp, clean color transitions.", diagType:"continental" },
  { id:3, name:"Scotch Stitch", cat:"Geometric", size:"3×3", tags:["geometric","background","sky","fabric texture","two-color"], desc:"A padded square of five diagonal stitches. Alternated in direction (Alternating Scotch) it creates subtle, beautiful texture.", bestFor:["Sky areas","Geometric backgrounds","Clothing fabric","Decorative borders"], colorNotes:"Reflects light differently in each direction. Try two tonal values for depth.", diagType:"scotch" },
  { id:4, name:"Cashmere", cat:"Geometric", size:"2×3", tags:["fur","foliage","fabric texture","variegated thread"], desc:"Rectangular blocks of diagonal stitches with a smooth, flowing quality. Beautiful for animal fur and foliage.", bestFor:["Animal fur textures","Fabric in garments","Foliage areas","Subtle backgrounds"], colorNotes:"Stunning with variegated thread — the length variation shows color transitions naturally.", diagType:"cashmere" },
  { id:5, name:"Turkish Work", cat:"Dimensional", size:"looped", tags:["fur","pet portrait","dimensional","flowers","grass","advanced"], desc:"Loops of thread left on the canvas front, then cut to create a plush pile effect. The most tactile stitch in needlepoint.", bestFor:["Animal fur (dogs, cats)","Fluffy clouds","Chrysanthemums and pompom flowers","Grass and moss"], colorNotes:"Mix 2–3 values of the same color for realistic fur depth.", diagType:"turkeywork" },
  { id:6, name:"French Knot", cat:"Dimensional", size:"single knot", tags:["berries","flowers","eyes","beginner-friendly","dimensional"], desc:"A single wrapped knot sitting raised on the canvas. In clusters creates grapes, berries, flower fields, and natural texture.", bestFor:["Berries and grapes","Flower centers","Animal eyes","Scattered field flowers","Pearl effects"], colorNotes:"Mix colors within a cluster for natural depth. A single gold French knot simulates a tiny jewel.", diagType:"frenchknot" },
  { id:7, name:"Rhodes Stitch", cat:"Geometric", size:"5×5+", tags:["focal point","metallic","decorative","geometric","advanced"], desc:"All threads crossing at the center, creating a raised star-like element. Dramatic and highly dimensional.", bestFor:["Decorative accents","Geometric patterns","Jewel and button effects","Focal point backgrounds"], colorNotes:"Metallics and luminous silks make Rhodes stitches pop.", diagType:"rhodes" },
  { id:8, name:"Brick Stitch", cat:"Straight", size:"variable", tags:["architecture","fabric","geometric","background","straight stitch"], desc:"Rows of straight vertical stitches offset like bricks, creating an even, clean texture perfect for architecture and flat fabric.", bestFor:["Brick walls","Stone textures","Flat fabric areas","Geometric backgrounds"], colorNotes:"Alternating two close tonal values emphasizes the brick offset pattern.", diagType:"brick" },
  { id:9, name:"Satin Stitch", cat:"Straight", size:"variable", tags:["water","sky","flowers","silk","smooth","gradient"], desc:"Straight parallel stitches of varying lengths creating a smooth, silky surface. Essential for water, sky, and flower petals.", bestFor:["Water reflections","Sky and sunset gradients","Flower petals","Smooth metallic accents"], colorNotes:"Perfect for ombre and color blending. Silk threads create a luminous sheen.", diagType:"satin" },
  { id:10, name:"Hungarian Ground", cat:"Geometric", size:"variable", tags:["water","sky","two-color","texture","background"], desc:"Alternating rows of long and short stitches creating a chevron-like woven pattern. Adds rhythm and depth to large areas.", bestFor:["Water","Sky","Fabric textures","Backgrounds needing subtle interest"], colorNotes:"Exceptional with two tonal values — the alternation emphasizes the geometric pattern.", diagType:"hungarian" },
  { id:11, name:"Bullion Knot", cat:"Dimensional", size:"coiled", tags:["roses","flowers","decorative","metallic","advanced"], desc:"Thread coiled around the needle, creating a raised barrel-shaped element. Elegant and dimensional.", bestFor:["Rose petals","Flower stamens","Decorative borders","Pearl and jewel effects"], colorNotes:"Metallics and silks catch light beautifully in bullion knots.", diagType:"bullion" },
  { id:12, name:"Milanese", cat:"Geometric", size:"large", tags:["geometric","background","herringbone","fabric","two-color"], desc:"Triangular blocks of diagonal stitches creating an interlocking arrow pattern. Highly decorative for large backgrounds.", bestFor:["Decorative backgrounds","Herringbone fabric texture","Bold geometric areas"], colorNotes:"Two contrasting colors create striking visual rhythm.", diagType:"milanese" },
];

// ─── EVENTS ───────────────────────────────────────────────────────────────────
const EVENTS = [
  { id:1, type:"retreat", title:"Sea Island Stitching Retreat", loc:"Sea Island, GA", date:"June 12–15, 2026", host:"Third Coast Stitches", price:"$1,195", spots:3, desc:"Luxury retreat at The Cloister. Expert workshops, private beach time, and a sea glass canvas project.", featured:true },
  { id:2, type:"drop", title:"Love You More — Spring Collection Drop", loc:"Online + select LNS", date:"April 19 at 10am ET", host:"Love You More Designs", price:"Retail", spots:null, desc:"12 new painted canvases including a botanical series and collegiate belts.", featured:true },
  { id:3, type:"retreat", title:"Nashville Needlepoint Retreat", loc:"Nashville, TN", date:"April 24–27, 2026", host:"Nashville Needleworks", price:"$895", spots:6, desc:"Four days of stitching in the Gulch with Rachel Barri workshops and a private trunk show.", featured:false },
  { id:4, type:"class", title:"Beginner Basketweave Morning", loc:"Stitch by Stitch, Larchmont NY", date:"April 12, 2026", host:"Stitch by Stitch", price:"$45", spots:8, desc:"Two-hour Saturday class covering canvas setup, basketweave, and thread management.", featured:false },
  { id:5, type:"sale", title:"Melissa Shirley Trunk Show", loc:"KC Needlepoint (online)", date:"Apr 15 – May 15", host:"KC Needlepoint", price:"20% off all MSD", spots:null, desc:"Month-long 20% off the full Melissa Shirley catalog. Free shipping over $150.", featured:true },
  { id:6, type:"meetup", title:"Houston Stitch Club — Monthly Meet", loc:"Needlepoint Texas, Houston TX", date:"April 22 at 6pm", host:"Needlepoint Texas", price:"Free", spots:20, desc:"Monthly open stitch night. Bring your WIP! Beginners always welcome.", featured:false },
  { id:7, type:"class", title:"Turkey Work Masterclass", loc:"BeStitched, Chevy Chase MD", date:"May 10, 2026", host:"BeStitched Needlepoint", price:"$95", spots:10, desc:"Advanced workshop on Turkey Work for pet portraits and dimensional botanicals. Materials included.", featured:false },
  { id:8, type:"sale", title:"Rainbow Gallery Thread Clearance", loc:"Multiple LNS", date:"May 1–31, 2026", host:"Rainbow Gallery", price:"30% off selected fibers", spots:null, desc:"Annual clearance on discontinued and limited-run specialty fibers.", featured:false },
];

// ─── LNS SHOPS ────────────────────────────────────────────────────────────────
const JUNK_SIGNALS = ['philadelphia','cape may','subject to change','please call',
  'visit our','check our','see our','ct to change','just an hour'];
const SHOPS = RAW_SHOPS.map(s => ({
  name:  s.shop_name || '',
  city:  s.city || '',
  state: s.state || '',
  url:   s.url ? (s.url.startsWith('http') ? s.url : 'https://' + s.url) : '',
  hours: JUNK_SIGNALS.some(x => (s.hours_value||'').toLowerCase().includes(x)) ? '' : (s.hours_value||''),
  phone: s.phone_value || '',
  ig:    s.ig_value || '',
}));


// ─── STATE NAME LOOKUP ────────────────────────────────────────────────────────
const STATE_NAMES = {
  'AL':'alabama','AK':'alaska','AZ':'arizona','AR':'arkansas','CA':'california',
  'CO':'colorado','CT':'connecticut','DE':'delaware','FL':'florida','GA':'georgia',
  'HI':'hawaii','ID':'idaho','IL':'illinois','IN':'indiana','IA':'iowa',
  'KS':'kansas','KY':'kentucky','LA':'louisiana','ME':'maine','MD':'maryland',
  'MA':'massachusetts','MI':'michigan','MN':'minnesota','MS':'mississippi',
  'MO':'missouri','MT':'montana','NE':'nebraska','NV':'nevada','NH':'new hampshire',
  'NJ':'new jersey','NM':'new mexico','NY':'new york','NC':'north carolina',
  'ND':'north dakota','OH':'ohio','OK':'oklahoma','OR':'oregon','PA':'pennsylvania',
  'RI':'rhode island','SC':'south carolina','SD':'south dakota','TN':'tennessee',
  'TX':'texas','UT':'utah','VT':'vermont','VA':'virginia','WA':'washington',
  'WV':'west virginia','WI':'wisconsin','WY':'wyoming','DC':'washington dc',
};

// ─── SHOP GEOCOORDS ──────────────────────────────────────────────────────────
const CITY_COORDS = {
  'Trussville, AL': [33.62,-86.608],
  'Gulf Shores, AL': [30.246,-87.7],
  'Montgomery, AL': [32.361,-86.279],
  'Vestavia Hills, AL': [33.445,-86.791],
  'Homewood, AL': [33.469,-86.802],
  'Scottsdale, AZ': [33.494,-111.926],
  'Tucson, AZ': [32.221,-110.969],
  'Phoenix, AZ': [33.448,-112.074],
  'Paradise Valley, AZ': [33.535,-111.942],
  'Little Rock, AR': [34.746,-92.289],
  'Alamo, CA': [37.852,-121.976],
  'Alameda, CA': [37.765,-122.242],
  'Auburn, CA': [38.896,-121.077],
  'Beverly Hills, CA': [34.073,-118.4],
  'Cambria, CA': [35.564,-121.08],
  'Carmel, CA': [36.555,-121.923],
  'Carmel-by-the-Sea, CA': [36.555,-121.923],
  'Corona del Mar, CA': [33.6,-117.873],
  'Costa Mesa, CA': [33.641,-117.919],
  'Covina, CA': [34.09,-117.89],
  'Fresno, CA': [36.737,-119.787],
  'Garden Grove, CA': [33.774,-117.938],
  'La Jolla, CA': [32.842,-117.274],
  'Los Angeles, CA': [34.052,-118.244],
  'Menlo Park, CA': [37.453,-122.182],
  'Mill Valley, CA': [37.906,-122.545],
  'Montecito, CA': [34.433,-119.635],
  'Montrose, CA': [34.21,-118.228],
  'Morgan Hill, CA': [37.13,-121.654],
  'Napa, CA': [38.297,-122.286],
  'Orange, CA': [33.788,-117.853],
  'Pasadena, CA': [34.148,-118.144],
  'Petaluma, CA': [38.232,-122.637],
  'Pleasanton, CA': [37.662,-121.875],
  'Sacramento, CA': [38.581,-121.494],
  'San Diego, CA': [32.715,-117.157],
  'San Francisco, CA': [37.774,-122.419],
  'San Marino, CA': [34.121,-118.107],
  'San Mateo, CA': [37.563,-122.323],
  'Santa Barbara, CA': [34.421,-119.698],
  'Santa Clarita, CA': [34.392,-118.543],
  'Santa Monica, CA': [34.019,-118.491],
  'Saratoga, CA': [37.264,-122.023],
  'Sonoma, CA': [38.292,-122.458],
  'Tarzana, CA': [34.168,-118.549],
  'Thousand Oaks, CA': [34.171,-118.838],
  'Tiburon, CA': [37.891,-122.456],
  'Toluca Lake, CA': [34.157,-118.355],
  'Torrance, CA': [33.836,-118.34],
  'Walnut Creek, CA': [37.906,-122.065],
  'Denver, CO': [39.739,-104.984],
  'Englewood, CO': [39.648,-104.988],
  'Bethel, CT': [41.37,-73.414],
  'Branford, CT': [41.279,-72.818],
  'Darien, CT': [41.078,-73.469],
  'Greenwich, CT': [41.027,-73.628],
  'Mystic, CT': [41.354,-71.967],
  'New Canaan, CT': [41.147,-73.495],
  'New Milford, CT': [41.578,-73.408],
  'Old Greenwich, CT': [41.025,-73.568],
  'Ridgefield, CT': [41.284,-73.499],
  'Simsbury, CT': [41.877,-72.808],
  'Wethersfield, CT': [41.714,-72.651],
  'Westport, CT': [41.141,-73.357],
  'Wilton, CT': [41.195,-73.437],
  'Washington, DC': [38.907,-77.036],
  'New Castle, DE': [39.661,-75.567],
  'Rehoboth Beach, DE': [38.72,-75.075],
  'Wilmington, DE': [39.745,-75.546],
  'Altamonte Springs, FL': [28.661,-81.365],
  'Belleair Bluffs, FL': [27.912,-82.796],
  'Boca Grande, FL': [26.753,-82.265],
  'Boca Raton, FL': [26.368,-80.128],
  'Bunnell, FL': [29.464,-81.256],
  'Clearwater, FL': [27.966,-82.8],
  'Coral Gables, FL': [25.721,-80.269],
  'Delray Beach, FL': [26.461,-80.073],
  'Fernandina Beach, FL': [30.67,-81.462],
  'Fort Lauderdale, FL': [26.122,-80.143],
  'Jacksonville, FL': [30.332,-81.656],
  'Lake Park, FL': [26.8,-80.065],
  'Miami, FL': [25.775,-80.208],
  'Naples, FL': [26.142,-81.795],
  'Naples Park, FL': [26.175,-81.777],
  'Orlando, FL': [28.538,-81.379],
  'Palm Beach, FL': [26.705,-80.037],
  'Palm Beach Gardens, FL': [26.823,-80.138],
  'Ponte Vedra Beach, FL': [30.239,-81.385],
  'Sarasota, FL': [27.337,-82.531],
  'St. Petersburg, FL': [27.771,-82.679],
  'Stuart, FL': [27.197,-80.253],
  'Tampa, FL': [27.947,-82.459],
  'Venice, FL': [27.1,-82.454],
  'Vero Beach, FL': [27.638,-80.398],
  'Winter Park, FL': [28.6,-81.339],
  'Alpharetta, GA': [34.075,-84.294],
  'Athens, GA': [33.961,-83.378],
  'Atlanta, GA': [33.749,-84.388],
  'Augusta, GA': [33.474,-82.009],
  'Rome, GA': [34.257,-85.165],
  'Roswell, GA': [34.023,-84.362],
  'Sandy Springs, GA': [33.924,-84.379],
  'Savannah, GA': [32.08,-81.099],
  'St. Simons Island, GA': [31.135,-81.368],
  'Thomasville, GA': [30.836,-83.979],
  'Hailey, ID': [43.52,-114.314],
  'Ketchum, ID': [43.681,-114.363],
  'Barrington, IL': [42.154,-88.137],
  'Chicago, IL': [41.878,-87.63],
  'Downers Grove, IL': [41.808,-88.011],
  'Evanston, IL': [42.045,-87.688],
  'Geneva, IL': [41.888,-88.305],
  'Glenview, IL': [42.07,-87.788],
  'Hinsdale, IL': [41.8,-87.938],
  'Lake Forest, IL': [42.259,-87.84],
  'Naperville, IL': [41.785,-88.147],
  'Northbrook, IL': [42.125,-87.827],
  'Northfield, IL': [42.1,-87.787],
  'Westmont, IL': [41.795,-87.975],
  'Winnetka, IL': [42.107,-87.736],
  'Carmel, IN': [39.978,-86.118],
  'Evansville, IN': [37.975,-87.571],
  'Goshen, IN': [41.583,-85.833],
  'Indianapolis, IN': [39.768,-86.158],
  'Newburgh, IN': [37.942,-87.4],
  'Zionsville, IN': [39.953,-86.259],
  'Des Moines, IA': [41.6,-93.609],
  'Waverly, IA': [42.727,-92.476],
  'Overland Park, KS': [38.982,-94.671],
  'Prairie Village, KS': [38.988,-94.632],
  'Bowling Green, KY': [36.99,-86.444],
  'Lexington, KY': [38.04,-84.458],
  'Louisville, KY': [38.252,-85.758],
  'Middletown, KY': [38.244,-85.538],
  'Murray, KY': [36.61,-88.314],
  'Paducah, KY': [37.083,-88.6],
  'Pikeville, KY': [37.479,-82.519],
  'Shelbyville, KY': [38.212,-85.224],
  'Versailles, KY': [38.053,-84.73],
  'Baton Rouge, LA': [30.451,-91.187],
  'Broussard, LA': [30.144,-91.962],
  'New Orleans, LA': [29.951,-90.072],
  'Shreveport, LA': [32.525,-93.75],
  'Boston, MA': [42.36,-71.058],
  'Brewster, MA': [41.762,-70.082],
  'Hingham, MA': [42.241,-70.889],
  'Lexington, MA': [42.447,-71.225],
  'Littleton, MA': [42.536,-71.485],
  'Manchester, MA': [42.578,-70.768],
  'Marstons Mills, MA': [41.668,-70.408],
  'Nantucket, MA': [41.283,-70.099],
  'Needham, MA': [42.28,-71.234],
  'Salem, MA': [42.519,-70.897],
  'Wellesley, MA': [42.297,-71.294],
  'Annapolis, MD': [38.978,-76.492],
  'Baltimore, MD': [39.29,-76.612],
  'Bethesda, MD': [38.984,-77.094],
  'Chevy Chase, MD': [38.984,-77.078],
  'Lutherville, MD': [39.432,-76.623],
  'Potomac, MD': [39.017,-77.208],
  'Rockville, MD': [39.084,-77.153],
  'St. Michaels, MD': [38.786,-76.224],
  'Stevenson, MD': [39.433,-76.7],
  'Camden, ME': [44.21,-69.065],
  'Freeport, ME': [43.857,-70.103],
  'Portland, ME': [43.661,-70.255],
  'Ada, MI': [42.958,-85.497],
  'Ann Arbor, MI': [42.281,-83.748],
  'Birmingham, MI': [42.547,-83.212],
  'Grand Blanc, MI': [42.927,-83.626],
  'Grand Rapids, MI': [42.963,-85.668],
  'Grosse Pointe, MI': [42.386,-82.899],
  'Grosse Pointe Woods, MI': [42.437,-82.902],
  'Macomb, MI': [42.667,-82.962],
  'Troy, MI': [42.606,-83.15],
  'Edina, MN': [44.879,-93.349],
  'Mendota Heights, MN': [44.882,-93.138],
  'Minneapolis, MN': [44.977,-93.265],
  'Minnetonka, MN': [44.921,-93.469],
  'Wayzata, MN': [44.975,-93.509],
  'Diamondhead, MS': [30.38,-89.387],
  'Jackson, MS': [32.298,-90.18],
  'Natchez, MS': [31.561,-91.403],
  'Pass Christian, MS': [30.318,-89.249],
  'Bozeman, MT': [45.679,-111.044],
  'Kansas City, MO': [39.099,-94.578],
  'St. Louis, MO': [38.627,-90.198],
  'Asheville, NC': [35.595,-82.551],
  'Chapel Hill, NC': [35.913,-79.056],
  'Charlotte, NC': [35.227,-80.843],
  'Davidson, NC': [35.499,-80.843],
  'Dillsboro, NC': [35.372,-83.249],
  'Durham, NC': [35.994,-78.899],
  'Greensboro, NC': [36.073,-79.792],
  'Hendersonville, NC': [35.318,-82.461],
  'Pinehurst, NC': [35.195,-79.469],
  'Raleigh, NC': [35.779,-78.638],
  'Wilmington, NC': [34.226,-77.945],
  'Winston-Salem, NC': [36.099,-80.244],
  'Fargo, ND': [46.877,-96.79],
  'Lincoln, NE': [40.814,-96.7],
  'Omaha, NE': [41.258,-95.938],
  'Amherst, NH': [42.868,-71.612],
  'Concord, NH': [43.207,-71.538],
  'Contoocook, NH': [43.218,-71.713],
  'Hanover, NH': [43.703,-72.289],
  'Meredith, NH': [43.654,-71.502],
  'Nashua, NH': [42.765,-71.468],
  'Portsmouth, NH': [43.072,-70.762],
  'Bay Head, NJ': [40.074,-74.044],
  'Bedminster, NJ': [40.685,-74.656],
  'Bernardsville, NJ': [40.717,-74.569],
  'Caldwell, NJ': [40.839,-74.277],
  'Chatham, NJ': [40.742,-74.382],
  'Eatontown, NJ': [40.295,-74.056],
  'Fair Haven, NJ': [40.357,-74.038],
  'Far Hills, NJ': [40.682,-74.638],
  'Haddonfield, NJ': [39.901,-75.037],
  'Jersey City, NJ': [40.729,-74.077],
  'Mendham, NJ': [40.774,-74.599],
  'Merchantville, NJ': [39.947,-75.061],
  'Metuchen, NJ': [40.543,-74.363],
  'Ocean City, NJ': [39.277,-74.574],
  'Pennington, NJ': [40.329,-74.796],
  'Rumson, NJ': [40.369,-74.009],
  'Summit, NJ': [40.716,-74.359],
  'Wyckoff, NJ': [41.013,-74.167],
  'Albuquerque, NM': [35.085,-106.651],
  'Santa Fe, NM': [35.687,-105.938],
  'Henderson, NV': [36.04,-114.982],
  'Las Vegas, NV': [36.175,-115.137],
  'Reno, NV': [39.529,-119.813],
  'Albany, NY': [42.652,-73.757],
  'Bohemia, NY': [40.771,-73.127],
  'Bronxville, NY': [40.938,-73.833],
  'Canandaigua, NY': [42.888,-77.28],
  'Cold Spring Harbor, NY': [40.859,-73.458],
  'East Rochester, NY': [43.108,-77.487],
  'Garden City, NY': [40.727,-73.636],
  'Larchmont, NY': [40.929,-73.752],
  'Locust Valley, NY': [40.874,-73.599],
  'Manhasset, NY': [40.7,-73.697],
  'Merrick, NY': [40.659,-73.549],
  'Nesconset, NY': [40.845,-73.153],
  'New York, NY': [40.713,-74.006],
  'Oyster Bay, NY': [40.868,-73.532],
  'Rhinebeck, NY': [41.926,-73.913],
  'Rye, NY': [40.981,-73.687],
  'Scarsdale, NY': [40.989,-73.785],
  'Southampton, NY': [40.884,-72.389],
  'Southold, NY': [41.065,-72.428],
  'Tuckahoe, NY': [40.951,-73.826],
  'Woodridge, NY': [41.716,-74.581],
  'Akron, OH': [41.081,-81.519],
  'Cincinnati, OH': [39.103,-84.512],
  'Cleveland, OH': [41.499,-81.695],
  'Cleveland Heights, OH': [41.51,-81.556],
  'Columbus, OH': [39.961,-82.999],
  'Dayton, OH': [39.759,-84.192],
  'Dublin, OH': [40.099,-83.115],
  'Medina, OH': [41.138,-81.864],
  'Powell, OH': [40.158,-83.074],
  'Toledo, OH': [41.664,-83.555],
  'Wooster, OH': [40.805,-81.935],
  'Oklahoma City, OK': [35.467,-97.517],
  'Tulsa, OK': [36.154,-95.993],
  'Beaverton, OR': [45.487,-122.804],
  'Portland, OR': [45.523,-122.676],
  'Allentown, PA': [40.608,-75.491],
  'Bryn Mawr, PA': [40.02,-75.313],
  'Chadds Ford, PA': [39.862,-75.591],
  'Devon, PA': [40.046,-75.43],
  'Doylestown, PA': [40.31,-75.13],
  'Lancaster, PA': [40.038,-76.306],
  'Malvern, PA': [40.036,-75.514],
  'Media, PA': [39.916,-75.388],
  'New Hope, PA': [40.362,-74.954],
  'Philadelphia, PA': [39.952,-75.165],
  'Pittsburgh, PA': [40.44,-79.996],
  'Sewickley, PA': [40.538,-80.179],
  'Wayne, PA': [40.043,-75.388],
  'Barrington, RI': [41.741,-71.312],
  'East Greenwich, RI': [41.661,-71.453],
  'Narragansett, RI': [41.43,-71.448],
  'Newport, RI': [41.491,-71.313],
  'Providence, RI': [41.824,-71.412],
  'Aiken, SC': [33.56,-81.72],
  'Charleston, SC': [32.776,-79.931],
  'Columbia, SC': [34.0,-81.035],
  'Greenville, SC': [34.852,-82.394],
  'Hilton Head Island, SC': [32.216,-80.752],
  'Johns Island, SC': [32.693,-80.044],
  'Landrum, SC': [35.175,-82.188],
  'Myrtle Beach, SC': [33.689,-78.887],
  'Pawleys Island, SC': [33.429,-79.117],
  'Rock Hill, SC': [34.925,-81.026],
  'Spartanburg, SC': [34.9,-81.932],
  'Sumter, SC': [33.92,-80.341],
  'Sioux Falls, SD': [43.549,-96.7],
  'Brentwood, TN': [36.033,-86.783],
  'Columbia, TN': [35.615,-87.035],
  'Knoxville, TN': [35.961,-83.921],
  'Memphis, TN': [35.149,-90.049],
  'Nashville, TN': [36.166,-86.784],
  'Sewanee, TN': [35.203,-85.921],
  'Austin, TX': [30.267,-97.743],
  'Cleburne, TX': [32.347,-97.387],
  'Dallas, TX': [32.783,-96.807],
  'Fort Worth, TX': [32.755,-97.333],
  'Harlingen, TX': [26.19,-97.696],
  'Houston, TX': [29.76,-95.37],
  'Lubbock, TX': [33.578,-101.856],
  'Midland, TX': [31.997,-102.078],
  'New Braunfels, TX': [29.703,-98.125],
  'San Angelo, TX': [31.464,-100.437],
  'San Antonio, TX': [29.425,-98.494],
  'Spring, TX': [30.079,-95.417],
  'Sugar Land, TX': [29.62,-95.635],
  'The Woodlands, TX': [30.158,-95.471],
  'Tyler, TX': [32.351,-95.301],
  'Victoria, TX': [28.805,-97.003],
  'Murray, UT': [40.667,-111.888],
  'Salt Lake City, UT': [40.761,-111.891],
  'Alexandria, VA': [38.805,-77.047],
  'Arlington, VA': [38.881,-77.171],
  'Ashland, VA': [37.76,-77.479],
  'Charlottesville, VA': [38.029,-78.478],
  'Falls Church, VA': [38.882,-77.171],
  'Fredericksburg, VA': [38.304,-77.461],
  'Great Falls, VA': [39.0,-77.287],
  'Haymarket, VA': [38.814,-77.636],
  'Irvington, VA': [37.665,-76.427],
  'Leesburg, VA': [39.115,-77.564],
  'McLean, VA': [38.934,-77.18],
  'Middleburg, VA': [38.969,-77.736],
  'Newport News, VA': [37.087,-76.473],
  'Richmond, VA': [37.541,-77.434],
  'Roanoke, VA': [37.271,-79.941],
  'Virginia Beach, VA': [36.853,-75.978],
  'Warrenton, VA': [38.721,-77.796],
  'Williamsburg, VA': [37.271,-76.707],
  'Winchester, VA': [39.186,-78.164],
  'Woodstock, VA': [38.878,-78.507],
  'Arlington, VT': [43.079,-73.157],
  'Burlington, VT': [44.48,-73.212],
  'Dorset, VT': [43.255,-73.086],
  'Bellevue, WA': [47.61,-122.201],
  'Everett, WA': [47.979,-122.202],
  'Issaquah, WA': [47.53,-122.033],
  'Langley, WA': [48.039,-122.407],
  'Seattle, WA': [47.606,-122.332],
  'Appleton, WI': [44.262,-88.416],
  'Madison, WI': [43.073,-89.401],
  'Milwaukee, WI': [43.039,-87.907],
  'Charleston, WV': [38.349,-81.633],
  'Honolulu, HI': [21.306,-157.858],
};
const SHOPS_GEO = SHOPS.map(s => {
  const key = `${s.city}, ${s.state}`;
  const c = CITY_COORDS[key];
  return c ? {...s, lat:c[0], lng:c[1]} : s;
});

// ─── THREAD STASH ─────────────────────────────────────────────────────────────
const INIT_THREADS = [
  { id:1, brand:"DMC", type:"Perle Cotton", size:"5", num:"3750", name:"Antique Blue Very Dark", hex:"#2A4A5A", qty:3, unit:"skeins", dyelot:"L8234" },
  { id:2, brand:"DMC", type:"Perle Cotton", size:"5", num:"3346", name:"Hunter Green Med", hex:"#3A7032", qty:2, unit:"skeins", dyelot:"K7821" },
  { id:3, brand:"Silk & Ivory", type:"Standard", size:"1 strand", num:"054", name:"Sage", hex:"#7A8C72", qty:5, unit:"skeins", dyelot:"2024-A" },
  { id:4, brand:"Silk & Ivory", type:"Standard", size:"1 strand", num:"118", name:"Dusty Rose", hex:"#C4897A", qty:4, unit:"skeins", dyelot:"2024-A" },
  { id:5, brand:"Vineyard Silk", type:"Classic", size:"1 strand", num:"V45", name:"Dusty Teal", hex:"#5A8888", qty:8, unit:"skeins", dyelot:"VS-2024" },
  { id:6, brand:"Rainbow Gallery", type:"Petite Silk Lame Braid", size:"PS", num:"PS02", name:"Gold", hex:"#C8A830", qty:2, unit:"cards", dyelot:"RG-44" },
  { id:7, brand:"DMC", type:"Perle Cotton", size:"5", num:"437", name:"Tan Light", hex:"#E0B080", qty:1, unit:"skeins", dyelot:"M9012" },
  { id:8, brand:"DMC", type:"Perle Cotton", size:"3", num:"564", name:"Jade Very Light", hex:"#90C8B2", qty:3, unit:"skeins", dyelot:"L8234" },
];

const INIT_CANVASES = [
  { id:1, title:"Christmas Stocking — Santa's Workshop", designer:"Melissa Shirley", mesh:18, dims:'14"×22"', status:"stash", from:"KC Needlepoint", price:285, notes:"Purchased Spring 2024 trunk show. Need to order threads." },
  { id:2, title:"Coastal Labrador (Black)", designer:"Julia's Needlework", mesh:13, dims:'12"×16"', status:"stash", from:"Nashville Needleworks", price:195, notes:"Birthday gift for Mom — do not forget!" },
  { id:3, title:"Blue & White Chinoiserie Ginger Jar", designer:"Rachel Barri", mesh:18, dims:'8"×12"', status:"wip", from:"Stitch by Stitch", price:225, notes:"Started March 2025. Using Vineyard Silk V45 for blue areas." },
];

const INIT_PROJECTS = [
  { id:1, title:"Blue & White Chinoiserie Ginger Jar", canvas:"Rachel Barri — Chinoiserie Ginger Jar", startDate:"March 15, 2025", status:"wip",
    entries:[
      { date:"March 15, 2025", note:"Started! Canvas blocking was easy on 18 mesh. Beginning with the blue jar body.", threads:["Vineyard Silk V45 (Dusty Teal)","Vineyard Silk V46 (Deep Teal)"] },
      { date:"March 28, 2025", note:"Jar body 60% complete. Switching to white porcelain areas with Silk & Ivory 001. Will need 3 more skeins of V45.", threads:["Silk & Ivory 001 (Ivory)"] },
    ]
  },
];

// ─── STITCH DIAGRAMS ──────────────────────────────────────────────────────────
function Diagram({ type, size = 120 }) {
  const s = size, c = s/2;
  if (type === "basketweave" || type === "continental") return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#EDF2E8"/>
      {[0,14,28,42,56,70,84].map(x => [0,14,28,42,56,70,84].map(y => (
        <rect key={`${x}${y}`} x={x+1} y={y+1} width="12" height="12" rx="1"
          fill={(x/14+y/14)%2===0 ? "#5A7248" : "#A8C090"} opacity="0.9"/>
      )))}
    </svg>
  );
  if (type === "scotch" || type === "cashmere") return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#FBF0E8"/>
      {[[5,5],[35,5],[65,5],[5,35],[35,35],[65,35],[5,65],[35,65],[65,65]].map(([bx,by],i) => (
        <g key={i}>
          {[1,2,3,2,1].map((h,j) => Array.from({length:h}).map((_,k) => (
            <rect key={`${j}${k}`} x={bx+j*5} y={by+k*5+(3-h)*2.5} width="4" height="4" rx="0.5"
              fill={i%2===0 ? "#C07840" : "#E8C080"} opacity="0.85"/>
          )))}
        </g>
      ))}
    </svg>
  );
  if (type === "turkeywork") return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#F2F4F6"/>
      {Array.from({length:36}).map((_,i) => {
        const x = (i%6)*16+8, y = Math.floor(i/6)*16+4;
        const cs = ["#7A8C6A","#4A2E1A","#C07840","#5A7248","#B86448"];
        const c = cs[i%5];
        return <g key={i}><path d={`M${x},${y+4} Q${x-3},${y+11} ${x},${y+16} Q${x+3},${y+11} ${x},${y+4}`} fill={c} opacity="0.8"/><path d={`M${x},${y+4} Q${x-5},${y+9} ${x-5},${y+15}`} fill={c} opacity="0.5"/><path d={`M${x},${y+4} Q${x+5},${y+9} ${x+5},${y+15}`} fill={c} opacity="0.6"/></g>;
      })}
    </svg>
  );
  if (type === "frenchknot") return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#FDF8F2"/>
      {[[15,15],[30,12],[50,18],[70,10],[85,16],[10,32],[25,28],[45,35],[65,27],[82,32],[18,50],[38,47],[58,53],[75,45],[20,68],[40,64],[60,70],[78,62],[30,85],[55,82],[75,80]].map(([x,y],i) => {
        const cs=["#C4897A","#7A8C6A","#C07840","#4A2E1A","#5A7248"];
        return <g key={i}><circle cx={x} cy={y} r="5" fill={cs[i%5]}/><circle cx={x-1} cy={y-1} r="2" fill="rgba(255,255,255,0.45)"/></g>;
      })}
    </svg>
  );
  if (type === "rhodes") return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#1C1410"/>
      {Array.from({length:14}).map((_,i) => {
        const a1 = (i/14)*Math.PI*2, a2 = a1+Math.PI;
        return <line key={i} x1={50+Math.cos(a1)*38} y1={50+Math.sin(a1)*38} x2={50+Math.cos(a2)*14} y2={50+Math.sin(a2)*14} stroke="#D4965A" strokeWidth="2" opacity={0.5+i*0.035}/>;
      })}
      <circle cx="50" cy="50" r="5" fill="#D4965A"/><circle cx="50" cy="50" r="2.5" fill="#FDF8F2"/>
    </svg>
  );
  if (type === "satin" || type === "hungarian") return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#E8F5F2"/>
      {Array.from({length:16}).map((_,i) => (
        <rect key={i} x={i*6+2} y={5+Math.sin(i*0.5)*8} width="4.5" height={80-Math.abs(Math.sin(i*0.5)*16)} rx="2"
          fill={i%2===0 ? "#3A6868" : "#7AB0A8"} opacity="0.85"/>
      ))}
    </svg>
  );
  // generic fallback
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#F2F4F6"/>
      {Array.from({length:25}).map((_,i) => (
        <rect key={i} x={(i%5)*18+8} y={Math.floor(i/5)*18+8} width="14" height="14" rx="2"
          fill={(i+Math.floor(i/5))%2===0 ? "#C07840" : "#E8C080"} opacity="0.8"/>
      ))}
    </svg>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
${fonts}
*{box-sizing:border-box;margin:0;padding:0;}

/* ── BASE ── */
.app{
  min-height:100vh;
  font-family:'Inter',sans-serif;
  background:${T.linen};
  color:${T.softBlack};
  position:relative;
}

/* ── HEADER ── */
.header{
  position:relative;z-index:50;
  background:${T.navy};
  padding:0 28px;
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  height:60px;
  box-shadow:0 2px 12px rgba(28,61,90,0.18);
  min-width:0;
}
.logo{
  font-family:'Fraunces',serif; font-size:21px; font-weight:700;
  color:#FFFFFF; letter-spacing:-0.01em; flex-shrink:0;
}
.logo em{color:${T.honey};font-style:normal;}
.nav{display:flex;gap:0px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;}
.nav::-webkit-scrollbar{display:none;}
.ntab{
  padding:6px 13px; border:none; background:transparent; cursor:pointer;
  font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
  color:rgba(255,255,255,0.65); letter-spacing:0;
  border-radius:4px; transition:all 0.15s; white-space:nowrap; flex-shrink:0;
}
.ntab:hover{color:#FFFFFF;background:rgba(255,255,255,0.08);}
.ntab.active{
  color:#FFFFFF;background:rgba(255,255,255,0.12);
  border-bottom:2px solid ${T.honey}; border-radius:4px 4px 0 0;
}
.hright{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.drop-pill{
  padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;
  background:${T.caramel}; color:#FFFFFF; border:none;
  white-space:nowrap;
}
.avatar{
  width:32px;height:32px;border-radius:50%;background:${T.caramel};
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#FFFFFF;cursor:pointer;
  flex-shrink:0;
}

/* ── MAIN ── */
.main{position:relative;z-index:1;overflow-x:hidden;}

/* ── SECTION HEADER ── */
.sec-head{padding:40px 40px 0;}
.sec-title{font-family:'Fraunces',serif;font-size:28px;font-weight:700;color:${T.navy};margin-bottom:4px;}
.sec-sub{font-size:14px;color:${T.warmGray};margin-bottom:24px;line-height:1.6;}

/* ── SEARCH ── */
.sbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:24px;}
.sinput{
  flex:1;min-width:200px;padding:10px 16px;border:1.5px solid ${T.sandGray};border-radius:6px;
  font-family:'Inter',sans-serif;font-size:14px;background:${T.cream};
  color:${T.softBlack};outline:none;transition:border 0.15s;
}
.sinput:focus{border-color:${T.navy};}
.chip{
  padding:7px 14px;border-radius:20px;border:1.5px solid ${T.sandGray};font-size:12px;
  cursor:pointer;background:${T.cream};color:${T.warmGray};font-family:'Inter',sans-serif;
  transition:all 0.15s;white-space:nowrap;font-weight:500;
}
.chip:hover{border-color:${T.navy};color:${T.navy};}
.chip.on{background:${T.navy};border-color:${T.navy};color:#FFFFFF;}

/* ── STITCH GRID ── */
.sgl{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;padding:0 40px 40px;}
.scard{
  background:${T.cream};border-radius:12px;overflow:hidden;
  border:1.5px solid ${T.sand};cursor:pointer;transition:all 0.2s;
  box-shadow:0 2px 8px rgba(28,61,90,0.05);
}
.scard:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(28,61,90,0.13);border-color:${T.caramel};}
.sdiag{height:120px;display:flex;align-items:center;justify-content:center;background:${T.parchment};}
.scbody{padding:16px;}
.scname{font-family:'Fraunces',serif;font-size:18px;font-weight:500;color:${T.navy};margin-bottom:2px;}
.sccat{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${T.caramel};margin-bottom:8px;font-weight:600;}
.scdesc{font-size:13px;color:${T.warmGray};line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.sctags{display:flex;flex-wrap:wrap;gap:4px;}
.sctag{padding:2px 8px;border-radius:10px;font-size:11px;background:${T.palePeach};color:${T.caramel};font-weight:500;}

/* ── STITCH DETAIL ── */
.sdet{padding:40px;max-width:860px;}
.backbtn{
  display:flex;align-items:center;gap:6px;color:${T.warmGray};cursor:pointer;
  font-size:13px;margin-bottom:28px;border:none;background:none;
  font-family:'Inter',sans-serif;transition:color 0.15s;
}
.backbtn:hover{color:${T.navy};}
.detheader{display:flex;gap:28px;margin-bottom:32px;align-items:flex-start;flex-wrap:wrap;}
.detdiag{width:220px;height:180px;flex-shrink:0;border-radius:10px;overflow:hidden;border:1.5px solid ${T.sand};}
.dettitle{font-family:'Fraunces',serif;font-size:36px;font-weight:600;color:${T.navy};margin-bottom:3px;}
.detcat{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${T.caramel};font-weight:600;margin-bottom:12px;}
.detdesc{font-size:15px;line-height:1.7;color:${T.softBlack};margin-bottom:20px;}
.detsec{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${T.sandGray};margin-bottom:10px;font-weight:600;}
.useitem{display:flex;align-items:flex-start;gap:8px;font-size:14px;color:${T.softBlack};margin-bottom:6px;}
.usedot{width:6px;height:6px;border-radius:50%;background:${T.sage};flex-shrink:0;margin-top:6px;}
.photogrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:8px;}
.photocell{
  aspect-ratio:4/3;border-radius:8px;background:${T.parchment};
  display:flex;align-items:center;justify-content:center;
  border:1.5px solid ${T.sand};flex-direction:column;gap:4px;color:${T.sandGray};font-size:12px;
}

/* ── EVENTS ── */
.evlayout{display:flex;gap:0;padding:0 40px 40px;}
.evsidebar{width:190px;flex-shrink:0;padding-right:20px;}
.evftype{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${T.sandGray};margin-bottom:10px;font-weight:600;}
.evfitem{
  display:flex;align-items:center;gap:8px;padding:7px 0;cursor:pointer;
  font-size:13px;color:${T.warmGray};transition:color 0.15s;
}
.evfitem:hover,.evfitem.on{color:${T.navy};}
.evmain{flex:1;}
.evgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:28px;}
.evcard{
  background:${T.cream};border-radius:10px;border:1.5px solid ${T.sand};
  overflow:hidden;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(74,46,26,0.04);
}
.evcard:hover{box-shadow:0 8px 24px rgba(28,61,90,0.12);border-color:${T.honey};transform:translateY(-2px);}
.evaccent{height:5px;}
.evcbody{padding:16px;}
.evbadge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;margin-bottom:9px;text-transform:uppercase;letter-spacing:0.06em;}
.evtitle{font-family:'Fraunces',serif;font-size:17px;font-weight:500;color:${T.navy};margin-bottom:3px;}
.evhost{font-size:12px;color:${T.sandGray};margin-bottom:8px;}
.evmeta{display:flex;gap:14px;font-size:13px;color:${T.warmGray};margin-bottom:10px;flex-wrap:wrap;}
.evdesc{font-size:13px;color:${T.warmGray};line-height:1.5;margin-bottom:12px;}
.evfooter{display:flex;align-items:center;justify-content:space-between;}
.notifbtn{
  padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;
  font-family:'Inter',sans-serif;cursor:pointer;border:1.5px solid;transition:all 0.15s;
}

/* ── MAP ── */
.mapsec{padding:0 40px 40px;}
.mapbox{
  position:relative;background:${T.cream};border-radius:12px;
  border:1.5px solid ${T.sand};overflow:hidden;height:460px;
  margin-bottom:28px;box-shadow:0 2px 12px rgba(28,61,90,0.06);
}
.mapsvg{width:100%;height:100%;}
.maptt{
  position:absolute;background:${T.navy};color:${T.beeswax};
  padding:12px 16px;border-radius:8px;font-size:13px;
  box-shadow:0 6px 20px rgba(0,0,0,0.25);min-width:190px;z-index:10;pointer-events:none;
}
.lnsgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;}
.lnscard{
  background:${T.cream};border-radius:8px;padding:16px;
  border:1.5px solid ${T.sand};transition:all 0.2s;cursor:pointer;
}
.lnscard:hover{border-color:${T.honey};box-shadow:0 4px 14px rgba(28,61,90,0.09);}
.lnscard.feat{border-left:3px solid ${T.caramel};}
.lnsname{font-family:'Fraunces',serif;font-size:16px;font-weight:500;color:${T.navy};margin-bottom:2px;}
.lnscity{font-size:12px;color:${T.sandGray};margin-bottom:8px;}
.lnsrow{font-size:12.5px;color:${T.warmGray};margin-bottom:4px;}

/* ── PROFILE ── */
.profwrap{display:flex;height:calc(100vh - 70px);}
.profsidebar{width:230px;background:${T.navy};flex-shrink:0;padding:28px 0;overflow-y:auto;}
.profnavitem{
  padding:12px 22px;cursor:pointer;font-size:13px;color:rgba(255,255,255,0.5);
  transition:all 0.15s;display:flex;align-items:center;gap:10px;
}
.profnavitem:hover{color:rgba(255,255,255,0.85);background:rgba(232,192,128,0.06);}
.profnavitem.on{color:${T.beeswax};background:rgba(224,112,96,0.15);border-right:3px solid ${T.caramel};}
.profcontent{flex:1;overflow-y:auto;padding:36px 40px;}
.profname{font-family:'Fraunces',serif;font-size:26px;font-weight:600;color:${T.navy};margin-bottom:4px;}
.profstats{
  display:flex;gap:28px;padding:18px 24px;background:${T.cream};
  border-radius:10px;border:1.5px solid ${T.sand};margin:16px 0 28px;
}
.stat{text-align:center;}
.statnum{font-family:'Fraunces',serif;font-size:30px;font-weight:400;color:${T.navy};}
.statlabel{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${T.sandGray};}

/* ── PROJECT NOTES ── */
.projcard{
  background:${T.cream};border-radius:10px;border:1.5px solid ${T.sand};
  overflow:hidden;margin-bottom:14px;
}
.projhead{padding:16px 18px;display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer;}
.projtitle{font-family:'Fraunces',serif;font-size:18px;font-weight:500;color:${T.navy};}
.projcanvas{font-size:12px;color:${T.sandGray};margin-bottom:3px;}
.entries{padding:0 18px 18px;}
.entry{
  padding:12px 14px;background:${T.linen};border-radius:7px;margin-bottom:8px;
  border-left:3px solid ${T.sage};
}
.entdate{font-size:11px;color:${T.sandGray};margin-bottom:5px;text-transform:uppercase;letter-spacing:0.06em;}
.entnote{font-size:13.5px;color:${T.softBlack};line-height:1.6;margin-bottom:7px;}
.entthreads{display:flex;flex-wrap:wrap;gap:4px;}
.etag{padding:2px 8px;border-radius:10px;font-size:11px;background:${T.fern};color:white;font-weight:500;}

/* ── CRAFT CLOSET ── */
.closettabs{display:flex;gap:2px;margin-bottom:20px;background:${T.sandGrayLight};border-radius:7px;padding:3px;width:fit-content;}
.ctab{
  padding:7px 18px;border-radius:5px;cursor:pointer;font-size:13px;
  color:${T.warmGray};transition:all 0.15s;border:none;background:transparent;
  font-family:'Inter',sans-serif;font-weight:500;
}
.ctab.on{background:${T.cream};color:${T.navy};box-shadow:0 1px 4px rgba(28,61,90,0.1);}
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:10px;}
.tcard{
  background:${T.cream};border-radius:8px;padding:12px 14px;
  border:1.5px solid ${T.sand};display:flex;gap:11px;align-items:center;
  transition:all 0.15s;
}
.tcard:hover{border-color:${T.honey};box-shadow:0 2px 8px rgba(28,61,90,0.07);}
.tswatch{width:38px;height:38px;border-radius:6px;flex-shrink:0;border:1px solid rgba(0,0,0,0.1);}
.tbrand{font-size:10.5px;color:${T.sandGray};text-transform:uppercase;letter-spacing:0.06em;}
.tname{font-size:13.5px;font-weight:600;color:${T.navy};margin:1px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tmeta{font-size:11.5px;color:${T.warmGray};}
.tqty{font-size:12.5px;font-weight:600;color:${T.fern};margin-top:3px;}

/* ── CANVAS STASH ── */
.cvgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;}
.cvcard{background:${T.cream};border-radius:10px;border:1.5px solid ${T.sand};overflow:hidden;transition:all 0.15s;}
.cvcard:hover{border-color:${T.honey};box-shadow:0 4px 14px rgba(28,61,90,0.09);}
.cvthumb{height:110px;background:${T.parchment};display:flex;align-items:center;justify-content:center;}
.cvbody{padding:13px;}
.cvtitle{font-family:'Fraunces',serif;font-size:15px;font-weight:500;color:${T.navy};margin-bottom:2px;}
.cvdesigner{font-size:12px;color:${T.caramel};font-weight:600;margin-bottom:6px;}
.cvmeta{display:flex;gap:14px;font-size:12px;color:${T.warmGray};}
.cvnotes{font-size:12px;color:${T.sandGray};margin-top:5px;font-style:italic;line-height:1.4;}
.cvstatus{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;margin-top:7px;}

/* ── ADD FORM ── */
.addform{
  background:${T.cream};border-radius:10px;border:1.5px solid ${T.honey};
  padding:20px;margin-bottom:20px;
  box-shadow:0 2px 12px rgba(192,120,64,0.08);
}
.frow{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
.fgrp{display:flex;flex-direction:column;gap:5px;flex:1;min-width:130px;}
.flabel{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${T.sandGray};font-weight:600;}
.fsel,.finput{
  padding:8px 11px;border:1.5px solid #D0C4B8;border-radius:6px;
  font-family:'Inter',sans-serif;font-size:13.5px;background:${T.linen};
  color:${T.softBlack};outline:none;transition:border 0.15s;appearance:none;
}
.fsel:focus,.finput:focus{border-color:${T.navy};background:${T.cream};}
.cswatch{width:22px;height:22px;border-radius:4px;border:1px solid rgba(0,0,0,0.12);flex-shrink:0;}
.ddlist{
  position:absolute;background:${T.cream};border:1.5px solid #D0C4B8;border-radius:8px;
  max-height:210px;overflow-y:auto;width:100%;z-index:200;
  box-shadow:0 8px 24px rgba(74,46,26,0.14);top:calc(100% + 4px);left:0;
}
.dditem{
  padding:8px 13px;cursor:pointer;font-size:13px;display:flex;align-items:center;
  gap:9px;transition:background 0.1s;
}
.dditem:hover{background:${T.sandGrayLight};}
.btn{
  padding:9px 20px;border-radius:24px;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
  border:none;transition:all 0.15s;
}
.btn-p{background:${T.caramel};color:#FFFFFF;}
.btn-p:hover{background:${T.terracotta};}
.btn-s{background:transparent;color:${T.navy};border:1.5px solid ${T.sand};}
.btn-s:hover{border-color:${T.navy};color:${T.navy};background:${T.paleBlue};}
.btn-g{background:${T.navy};color:white;}
.btn-g:hover{background:${T.navyDark};}

/* ── FINISHING ── */
.fingrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px;padding:0 40px 40px;}
.fincard{
  background:${T.cream};border-radius:10px;border:1.5px solid ${T.sand};
  padding:18px;transition:all 0.2s;cursor:pointer;
  box-shadow:0 2px 8px rgba(74,46,26,0.04);
}
.fincard:hover{box-shadow:0 8px 24px rgba(28,61,90,0.12);border-color:${T.caramel};}
.finname{font-family:'Fraunces',serif;font-size:19px;font-weight:500;color:${T.navy};margin-bottom:2px;}
.finloc{font-size:12px;color:${T.sandGray};margin-bottom:12px;}
.waitbar{height:7px;border-radius:4px;background:#E8DDD0;margin:6px 0;overflow:hidden;}
.waitfill{height:100%;border-radius:4px;}
.ftags{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px;}
.ftag{padding:2px 8px;border-radius:10px;font-size:11px;background:${T.paleGreen};color:${T.fern};font-weight:500;}

/* ── DISCOVERY ── */
.disco{padding:0 40px 40px;}
.masonry{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.disccard{background:${T.cream};border-radius:10px;border:1.5px solid ${T.sand};overflow:hidden;cursor:pointer;transition:all 0.2s;}
.disccard:hover{box-shadow:0 8px 24px rgba(28,61,90,0.12);border-color:${T.honey};transform:translateY(-2px);}
.discthumb{background:${T.parchment};display:flex;align-items:center;justify-content:center;position:relative;}
.discinfo{padding:12px 14px;}
.disctitle{font-family:'Fraunces',serif;font-size:15px;font-weight:500;color:${T.navy};margin-bottom:2px;}
.discdesigner{font-size:12px;color:${T.caramel};font-weight:600;margin-bottom:5px;}
.discrow{display:flex;justify-content:space-between;font-size:12px;color:${T.warmGray};}

/* ── MISC ── */
.divider{height:1px;background:#E8DDD0;margin:20px 0;}
.pill{display:inline-block;padding:2px 9px;border-radius:10px;font-size:11px;font-weight:600;}
.fadein{animation:fi 0.22s ease forwards;}
@keyframes fi{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#D0C4B8;border-radius:3px;}
`;

// ─── EVENT COLORS ─────────────────────────────────────────────────────────────
const EV = {
  retreat: { accent: T.caramel, bg: "#FBF0E8", textColor: T.caramel, label: "✦ Retreat" },
  class:   { accent: T.sage,    bg: T.paleGreen, textColor: T.fern, label: "Class" },
  sale:    { accent: T.terracotta, bg: "#FAEEE8", textColor: T.terracotta, label: "◈ Trunk Show / Sale" },
  drop:    { accent: T.honey,   bg: "#FDF5E6", textColor: T.caramel, label: "⬇ New Drop" },
  meetup:  { accent: T.slate,   bg: T.paleTeal, textColor: T.slate, label: "Stitch Club" },
};

// ─── LEAFLET MAP ──────────────────────────────────────────────────────────────
function USMap({ shops }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [38.5, -96],
      zoom: 4,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const makeIcon = (hasUrl) => L.divIcon({
      className: '',
      html: `<div style="width:13px;height:13px;border-radius:50%;background:${hasUrl ? '#E07060' : '#1C3D5A'};border:2.5px solid #FFFFFF;box-shadow:0 1px 5px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
      iconSize: [13,13], iconAnchor: [6,6], popupAnchor: [0,-10],
    });

    shops.forEach(s => {
      if (!s.lat || !s.lng) return;
      const urlLine  = s.url   ? `<a href="${s.url}" target="_blank" rel="noreferrer" style="color:#E07060;font-size:11px;">${s.url.replace(/https?:\/\//,'').split('/')[0]}</a>` : '';
      const hoursLine = s.hours ? `<div style="font-size:11px;color:#777;margin-top:3px;">⏰ ${s.hours.slice(0,60)}</div>` : '';
      const phoneLine = s.phone ? `<div style="font-size:11px;color:#777;margin-top:2px;">📞 ${s.phone}</div>` : '';
      L.marker([s.lat, s.lng], { icon: makeIcon(!!s.url) })
        .bindPopup(`<div style="font-family:sans-serif;min-width:160px;"><div style="font-size:14px;font-weight:600;color:#1C3D5A;margin-bottom:2px;">${s.name}</div><div style="font-size:12px;color:#999;margin-bottom:4px;">${s.city}, ${s.state}</div>${hoursLine}${phoneLine}<div style="margin-top:6px;">${urlLine}</div></div>`, { maxWidth:240 })
        .addTo(map);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div style={{width:'100%', height:'420px', borderRadius:12,
      overflow:'hidden', border:'1px solid #DDD3C8'}}>
      <div ref={containerRef} style={{width:'100%', height:'100%'}} />
    </div>
  );
}

// ─── THREAD ADD FORM ──────────────────────────────────────────────────────────
function AddThreadForm({ onAdd }) {
  const [brand,setBrand]=useState('');
  const [type,setType]=useState('');
  const [size,setSize]=useState('');
  const [input,setInput]=useState('');
  const [sel,setSel]=useState(null);
  const [qty,setQty]=useState(1);
  const [lot,setLot]=useState('');
  const [dd,setDd]=useState(false);
  const [opts,setOpts]=useState([]);

  const brands = Object.keys(THREAD_DB);
  const types = brand ? Object.keys(THREAD_DB[brand]||{}) : [];
  const sizes = (brand&&type) ? (THREAD_DB[brand]?.[type]?.sizes||[]) : [];

  useEffect(()=>{
    if(brand&&type&&input.length>0){
      const all = THREAD_DB[brand]?.[type]?.colors||[];
      const q=input.toLowerCase();
      setOpts(all.filter(c=>c.num.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)).slice(0,8));
      setDd(true);
    } else { setDd(false); setOpts([]); }
  },[input,brand,type]);

  const clear=()=>{setBrand('');setType('');setSize('');setInput('');setSel(null);setQty(1);setLot('');};

  return (
    <div className="addform">
      <div style={{fontFamily:"'Fraunces',serif",fontSize:17,color:T.navy,marginBottom:14,fontWeight:600}}>Add Thread to Craft Closet</div>
      <div className="frow">
        <div className="fgrp">
          <label className="flabel">Brand</label>
          <select className="fsel" value={brand} onChange={e=>{setBrand(e.target.value);setType('');setSize('');setSel(null);setInput('');}}>
            <option value="">Select brand…</option>
            {brands.map(b=><option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="fgrp">
          <label className="flabel">Thread Type</label>
          <select className="fsel" value={type} onChange={e=>{setType(e.target.value);setSize('');setSel(null);setInput('');}} disabled={!brand}>
            <option value="">Select type…</option>
            {types.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="fgrp" style={{maxWidth:120}}>
          <label className="flabel">Size</label>
          <select className="fsel" value={size} onChange={e=>setSize(e.target.value)} disabled={!type}>
            <option value="">Size…</option>
            {sizes.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="frow">
        <div className="fgrp" style={{flex:2,position:'relative'}}>
          <label className="flabel">Color # or Name</label>
          <div style={{display:'flex',gap:7,alignItems:'center'}}>
            {sel && <div className="cswatch" style={{background:sel.hex}}/>}
            <input className="finput" style={{flex:1}} placeholder="e.g. 3750 or Antique Blue…" value={input}
              onChange={e=>{setInput(e.target.value);setSel(null);}} autoComplete="off" disabled={!type}/>
          </div>
          {dd&&opts.length>0&&(
            <div className="ddlist">
              {opts.map(c=>(
                <div key={c.num} className="dditem" onClick={()=>{setSel(c);setInput(`${c.num} — ${c.name}`);setDd(false);}}>
                  <div style={{width:18,height:18,borderRadius:4,background:c.hex,border:'1px solid rgba(0,0,0,0.1)',flexShrink:0}}/>
                  <span style={{fontWeight:600,color:T.navy}}>{c.num}</span>
                  <span style={{color:T.warmGray,fontSize:12}}>{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="fgrp" style={{maxWidth:80}}>
          <label className="flabel">Qty</label>
          <input className="finput" type="number" min="1" value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)}/>
        </div>
        <div className="fgrp">
          <label className="flabel">Dye Lot</label>
          <input className="finput" placeholder="e.g. L8234" value={lot} onChange={e=>setLot(e.target.value)}/>
        </div>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn btn-p" onClick={()=>{if(brand&&type&&sel){onAdd({brand,type,size,...sel,qty,dyelot:lot});clear();}}}>Add to Closet</button>
        <button className="btn btn-s" onClick={clear}>Clear</button>
      </div>
    </div>
  );
}

// ─── CANVAS COLORS ────────────────────────────────────────────────────────────
const CV_COLORS = ["#C07840","#7A8C6A","#5A7248","#B86448","#4A2E1A","#C4897A","#D4965A","#5A6470","#7A6E64","#3A6868","#C09830","#7A2838"];

function colorSearch(hex, q) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  if(q.includes('green')&&g>r&&g>b&&g>80) return true;
  if(q.includes('blue')&&b>r&&b>g&&b>80) return true;
  if(q.includes('red')&&r>g&&r>b&&r>140) return true;
  if((q.includes('gold')||q.includes('yellow'))&&r>150&&g>110&&b<100) return true;
  if((q.includes('pink')||q.includes('rose'))&&r>150&&g<r&&b<r&&b>70) return true;
  if((q.includes('teal')||q.includes('aqua'))&&g>90&&b>90&&r<120) return true;
  if((q.includes('white')||q.includes('ivory')||q.includes('cream'))&&r>210&&g>200&&b>185) return true;
  if((q.includes('black')||q.includes('dark'))&&Math.max(r,g,b)<70) return true;
  if((q.includes('brown')||q.includes('tan'))&&r>100&&g>60&&b<80&&r>g) return true;
  return false;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Needlewise() {
  const [tab,setTab]=useState('discover');
  const [stitchQ,setStitchQ]=useState('');
  const [stitchCat,setStitchCat]=useState('All');
  const [selStitch,setSelStitch]=useState(null);
  const [evFilter,setEvFilter]=useState('all');
  const [hovShop,setHovShop]=useState(null);
  const [ttPos,setTtPos]=useState({x:0,y:0});
  const [profTab,setProfTab]=useState('notes');
  const [closetTab,setClosetTab]=useState('threads');
  const [threadQ,setThreadQ]=useState('');
  const [threads,setThreads]=useState(INIT_THREADS);
  const [notifs,setNotifs]=useState({});
  const [expProj,setExpProj]=useState(1);
  const [cvFilter,setCvFilter]=useState('All');
  const [discoverTab,setDiscoverTab]=useState('designs');
  const [libraryTab,setLibraryTab]=useState('stitches');
  const [followedDesigners,setFollowedDesigners]=useState({'Melissa Shirley':true,'Rachel Barri':true});
  const [wishlisted,setWishlisted]=useState({2:true,5:true});
  const [bookingFinisher,setBookingFinisher]=useState(null);
  const [bookingStep,setBookingStep]=useState(1);
  const [bookingCanvas,setBookingCanvas]=useState('');
  const [bookingService,setBookingService]=useState('');
  const [bookingConfirmed,setBookingConfirmed]=useState({});
  const [planMode,setPlanMode]=useState(false);
  const [planCanvas,setPlanCanvas]=useState('');
  const [sharedProject,setSharedProject]=useState(null);
  // forums
  const [forumCat,setForumCat]=useState('All');
  const [forumThread,setForumThread]=useState(null);
  const [communityTab,setCommunityTab]=useState('events');
  // howto
  const [howtoSection,setHowtoSection]=useState('All');
  const [howtoArticle,setHowtoArticle]=useState(null);
  // destash
  const [destashFilter,setDestashFilter]=useState('All');
  const [contactedListing,setContactedListing]=useState({});
  const [shopQ,setShopQ]=useState('');
  // guide ratings
  const [guideRatings,setGuideRatings]=useState({0:5,1:4,2:5,3:4,4:5,5:4});
  const [avatarOpen,setAvatarOpen]=useState(false);

  const cats=['All','Foundation','Geometric','Straight','Dimensional'];
  const cvCats=['All','Holiday','Animals','Florals','Collegiate','Accessories'];

  const filtStitches = STITCHES.filter(s=>{
    const mc = stitchCat==='All'||s.cat===stitchCat;
    const q=stitchQ.toLowerCase();
    const ms = !q||s.name.toLowerCase().includes(q)||s.tags.some(t=>t.includes(q))||s.bestFor.some(b=>b.toLowerCase().includes(q));
    return mc&&ms;
  });

  const filtEvents = EVENTS.filter(e=>evFilter==='all'||e.type===evFilter);

  const filtThreads = threads.filter(t=>{
    const q=threadQ.toLowerCase();
    return !q||t.brand.toLowerCase().includes(q)||t.name.toLowerCase().includes(q)||t.num.toLowerCase().includes(q)||t.type.toLowerCase().includes(q)||(t.hex&&colorSearch(t.hex,q));
  });

  const canvasData = [
    // 2Busy Needlepointing designs (real)
    {t:"Jack of All Faces",d:"2Busy Needlepointing",m:18,p:144,h:200,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/jackofallfacescopy_62f8ce89-5dc5-4671-a150-1320c878b993.jpg?v=1727029473&width=533",url:"https://2busyneedlepointing.com/products/jack-of-all-faces"},
    {t:"Peace, Witches!",d:"2Busy Needlepointing",m:18,p:95,h:190,lns:"2busyneedlepointing.com",st:"Pre-Order",img:"https://2busyneedlepointing.com/cdn/shop/files/peacewitches.jpg?v=1738951114&width=533",url:"https://2busyneedlepointing.com/products/peace-witches-pre-order"},
    {t:"Bits N' Bobs",d:"2Busy Needlepointing",m:18,p:120,h:210,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/bitsnbobs.jpg?v=1727031792&width=533",url:"https://2busyneedlepointing.com/products/bits-n-bobs"},
    {t:"Hallowed Be Thy Ween",d:"2Busy Needlepointing",m:18,p:65,h:175,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/productphoto.jpg?v=1696793471&width=533",url:"https://2busyneedlepointing.com/products/hallowed-be-thy-ween"},
    {t:"Bat Outta Hell",d:"2Busy Needlepointing",m:18,p:60,h:160,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/batouttahell2.jpg?v=1727030155&width=533",url:"https://2busyneedlepointing.com/products/bat-outta-hell"},
    {t:"Back On My Bull",d:"2Busy Needlepointing",m:18,p:104,h:185,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/backonmybull_345fe454-19b1-40a4-abe6-644c742d4f9c.jpg?v=1727029323&width=533",url:"https://2busyneedlepointing.com/products/back-on-my-bull"},
    {t:"Ask Me When My Meds Kick In",d:"2Busy Needlepointing",m:18,p:80,h:155,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/products/2BN-MED.jpg?v=1674928490&width=533",url:"https://2busyneedlepointing.com/products/ask-me-when-my-meds-kick-in"},
    {t:"The Audacity!",d:"2Busy Needlepointing",m:18,p:65,h:145,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/products/2BN-AUD.jpg?v=1674928569&width=533",url:"https://2busyneedlepointing.com/products/the-audacity"},
    {t:"BOO, Signed",d:"2Busy Needlepointing",m:18,p:110,h:175,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/IMG_4611.jpg?v=1694720088&width=533",url:"https://2busyneedlepointing.com/products/boo-signed-pre-order"},
    {t:"Spooky Rockin'",d:"2Busy Needlepointing",m:18,p:95,h:190,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/IMG_4613.jpg?v=1694720480&width=533",url:"https://2busyneedlepointing.com/products/rock-on-devil"},
    {t:"Big Girl Panties",d:"2Busy Needlepointing",m:18,p:50,h:140,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/biggirlpanties.jpg?v=1727029975&width=533",url:"https://2busyneedlepointing.com/products/big-girl-panties"},
    {t:"Lift Like A Girl",d:"2Busy Needlepointing",m:18,p:54,h:150,lns:"2busyneedlepointing.com",st:"In Stock",img:"https://2busyneedlepointing.com/cdn/shop/files/liftlikeagirl_646fdc55-e531-494e-b9b9-30b8d2170e00.jpg?v=1727030585&width=533",url:"https://2busyneedlepointing.com/products/lift-like-a-girl"},
    // Other designers
    {t:"Harvest Pumpkin Stocking",d:"Melissa Shirley",m:18,p:295,h:190,lns:"Needlepoint.com",st:"In Stock",img:null,url:null},
    {t:"Labrador Portrait",d:"Julia's Needlework",m:13,p:215,h:230,lns:"KC Needlepoint",st:"Pre-Order",img:null,url:null},
    {t:"Chinoiserie Ginger Jar",d:"Rachel Barri",m:18,p:225,h:165,lns:"Stitch by Stitch",st:"In Stock",img:null,url:null},
    {t:"Peony Garden",d:"Alice Peterson",m:18,p:185,h:195,lns:"NP Clubhouse",st:"In Stock",img:null,url:null},
    {t:"Golden Retriever Santa",d:"Susan Roberts",m:18,p:245,h:210,lns:"Nashville NW",st:"In Stock",img:null,url:null},
    {t:"White Hydrangea Pillow",d:"Penny Linn",m:18,p:195,h:200,lns:"Penny Linn",st:"In Stock",img:null,url:null},
  ];

  const finishers=[
    {name:"Island House Needlepoint",loc:"Mt. Pleasant, SC",wait:4,svcs:["Pillows","Stockings","Ornaments","Belts"],rating:4.9,reviews:142,slots:"By reservation"},
    {name:"Needle to Finish",loc:"Nashville, TN",wait:2,svcs:["Pillows","Stockings","Ornaments","Door Hangers"],rating:4.8,reviews:89,slots:"Open"},
    {name:"Hummingbird NP Services",loc:"Laurel, MD",wait:3,svcs:["Ornaments","Pillows","Specialty"],rating:4.9,reviews:204,slots:"Open"},
    {name:"Rittenhouse Finishing",loc:"Philadelphia, PA",wait:5,svcs:["Full Service","Bags","Belts","Rugs"],rating:4.8,reviews:312,slots:"Open"},
    {name:"The Finishing Room",loc:"Atlanta, GA",wait:8,svcs:["Pillows","Stockings","Ornaments"],rating:4.7,reviews:78,slots:"Limited"},
    {name:"By Hand Finishing",loc:"Dallas, TX",wait:6,svcs:["Stockings","Ornaments","Pillows"],rating:4.6,reviews:55,slots:"Open"},
  ];
  const wc=(w)=>w<=3?T.sage:w<=6?T.caramel:T.terracotta;

  const TABS=[
    {id:'discover',label:'Designs'},
    {id:'stitches',label:'Stitch Library'},
    {id:'events',label:'Community'},
    {id:'destash',label:'Destash'},
    {id:'map',label:'Find a Shop'},
    {id:'finishing',label:'Finishing'},
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* HEADER */}
        <header className="header">
          <div className="logo" style={{cursor:'pointer'}} onClick={()=>{setTab('discover');setSelStitch(null);setDiscoverTab('designs');}}>Needle<em>wise</em></div>
          <nav className="nav">
            {TABS.map(t=>(
              <button key={t.id} className={`ntab ${tab===t.id?'active':''}`} onClick={()=>{setTab(t.id);setSelStitch(null);}}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="hright">
            <div style={{position:'relative'}}>
              <div className="avatar" onClick={()=>setAvatarOpen(o=>!o)}
                title="My Stuff"
                style={{cursor:'pointer',userSelect:'none'}}>SL</div>
              {avatarOpen&&(
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,background:T.cream,border:`1.5px solid #E8DDD0`,borderRadius:10,boxShadow:`0 8px 28px rgba(74,46,26,0.16)`,minWidth:160,zIndex:200,overflow:'hidden'}}>
                  <div style={{padding:'10px 16px',borderBottom:`1px solid #E8DDD0`,fontSize:13,fontWeight:600,color:T.navy,fontFamily:"'Fraunces',serif"}}>Sarah L.</div>
                  <div onClick={()=>{setTab('profile');setAvatarOpen(false);}}
                    style={{padding:'10px 16px',fontSize:13,color:T.warmGray,cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'background 0.12s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.parchment}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    &#x1F9F5; My Stuff
                  </div>
                  <div style={{padding:'10px 16px',fontSize:13,color:T.warmGray,cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'background 0.12s',borderTop:`1px solid #E8DDD0`}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.parchment}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    &#x2699;&#xFE0F; Settings
                  </div>
                  <div style={{padding:'10px 16px',fontSize:13,color:T.terracotta,cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'background 0.12s',borderTop:`1px solid #E8DDD0`}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.parchment}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    &#x2192; Sign out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="main">

          {/* ══ CANVAS DISCOVERY ══ */}
          {tab==='discover'&&(
            <div className="fadein">
              <div className="sec-head">
                <div className="sec-title">Designs</div>
                <div className="sec-sub">Browse canvases from hundreds of designers — and find canvas-linked stitch guides all in one place.</div>
                {/* Sub-nav */}
                <div style={{display:'flex',gap:2,marginTop:14,borderBottom:`1.5px solid #E8DDD0`,paddingBottom:0}}>
                  {[{id:'designs',label:'Canvases'},{id:'guides',label:'Stitch Guides'}].map(st=>(
                    <button key={st.id} onClick={()=>setDiscoverTab(st.id)}
                      style={{padding:'8px 18px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:600,
                        fontFamily:"'Inter',sans-serif",
                        color:discoverTab===st.id?T.navy:T.sandGray,
                        borderBottom:`2.5px solid ${discoverTab===st.id?T.caramel:'transparent'}`,
                        marginBottom:-1.5,transition:'color 0.15s'}}>
                      {st.label}
                    </button>
                  ))}
                </div>
                {discoverTab==='designs'&&(
                <div className="sbar" style={{marginTop:12}}>
                  <input className="sinput" placeholder="Search by designer, theme, subject, shop…"/>
                  {cvCats.map(c=>(
                    <button key={c} className={`chip ${cvFilter===c?'on':''}`} onClick={()=>setCvFilter(c)}>{c}</button>
                  ))}
                </div>
                )}
                {discoverTab==='guides'&&(
                <div className="sbar" style={{marginTop:12}}>
                  <input className="sinput" placeholder="Search by canvas, designer, or subject…"/>
                  {['All','Holiday','Animals','Florals','Belts & Accessories'].map(c=>(
                    <button key={c} className="chip">{c}</button>
                  ))}
                </div>
                )}
              </div>

              {/* ── Canvases sub-tab ── */}
              {discoverTab==='designs'&&(
              <div className="disco">
                {/* New designs badge */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18,padding:'12px 16px',background:`linear-gradient(90deg,${T.palePeach},${T.cream})`,borderRadius:10,border:`1.5px solid ${T.beeswax}`}}>
                  <span style={{fontSize:20}}>&#x1FAA1;</span>
                  <div>
                    <span style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:500,color:T.navy}}>3 new designs this week</span>
                    <span style={{fontSize:13,color:T.sandGray,marginLeft:10}}>from designers you follow</span>
                  </div>
                  <button className="btn btn-s" style={{marginLeft:'auto',fontSize:11,padding:'4px 12px',flexShrink:0}}>See what&#x2019;s new &#x2192;</button>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <span style={{fontSize:13,color:T.warmGray}}>Showing {canvasData.length} canvases</span>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-s" style={{fontSize:12,padding:'6px 12px'}}>&#x1F514; Follow designers</button>
                    <button className="btn btn-g" style={{fontSize:12,padding:'6px 12px'}}>+ Submit a Canvas</button>
                  </div>
                </div>
                <div className="masonry">
                  {canvasData.map((c,i)=>{
                    const hasGuide = [0,2,4,7].includes(i);
                    const isWished = wishlisted[i];
                    const isFollowed = followedDesigners[c.d];
                    const is2Busy = c.d === '2Busy Needlepointing';
                    return (
                    <div key={i} className="disccard">
                      <div className="discthumb" style={{height:200,overflow:'hidden',position:'relative'}}>
                        {c.img ? (
                          <img src={c.img} alt={c.t} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                        ) : (
                          <svg width="100%" height="200" viewBox={`0 0 200 200`} preserveAspectRatio="xMidYMid slice">
                            <rect width="200" height="200" fill={CV_COLORS[i%CV_COLORS.length]} opacity="0.18"/>
                            <rect x="20" y="20" width="160" height="160" rx="4" fill={CV_COLORS[i%CV_COLORS.length]} opacity="0.22"/>
                            <rect x="42" y="42" width="116" height="116" rx="3" fill={CV_COLORS[i%CV_COLORS.length]} opacity="0.38"/>
                            <text x="100" y="96" textAnchor="middle" fill={T.warmGray} fontSize="10" fontFamily="Lora,serif" fontStyle="italic">{c.d}</text>
                            <text x="100" y="112" textAnchor="middle" fill={T.navy} fontSize="11" fontFamily="Inter,sans-serif">{c.m} mesh</text>
                          </svg>
                        )}
                        <div style={{position:'absolute',top:8,right:8,background:c.st==='In Stock'?T.sage:T.caramel,color:'white',fontSize:10,padding:'2px 7px',borderRadius:8,fontWeight:700}}>{c.st}</div>
                        {is2Busy&&<div style={{position:'absolute',top:8,left:8,background:'rgba(74,46,26,0.85)',color:T.beeswax,fontSize:9,padding:'2px 7px',borderRadius:8,fontWeight:700}}>2Busy</div>}
                        {hasGuide&&!is2Busy&&<div style={{position:'absolute',top:8,left:8,background:T.navy,color:T.beeswax,fontSize:10,padding:'2px 7px',borderRadius:8,fontWeight:700}}>&#x1F4D6; Stitch Guide</div>}
                        <button
                          onClick={e=>{e.stopPropagation();setWishlisted(w=>({...w,[i]:!w[i]}));}}
                          style={{position:'absolute',bottom:8,right:8,background:isWished?T.caramel:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,boxShadow:'0 1px 4px rgba(0,0,0,0.15)',transition:'all 0.15s'}}>
                          {isWished?'♥':'♡'}
                        </button>
                      </div>
                      <div className="discinfo">
                        <div className="disctitle">{c.t}</div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                          <div className="discdesigner">{c.d}</div>
                          <button onClick={e=>{e.stopPropagation();setFollowedDesigners(f=>({...f,[c.d]:!f[c.d]}));}}
                            style={{fontSize:10,padding:'2px 7px',borderRadius:8,border:`1px solid ${isFollowed?T.sage:'#D0C4B8'}`,background:isFollowed?T.paleGreen:'transparent',color:isFollowed?T.fern:T.sandGray,cursor:'pointer',fontWeight:600,whiteSpace:'nowrap',transition:'all 0.15s'}}>
                            {isFollowed?'&#x2713; Following':'+ Follow'}
                          </button>
                        </div>
                        <div className="discrow">
                          <span>{c.lns}</span>
                          <span style={{fontWeight:700,color:T.navy}}>${c.p}</span>
                        </div>
                        {hasGuide&&(
                          <div style={{marginTop:8,padding:'6px 9px',background:T.palePeach,borderRadius:6,border:`1px solid ${T.beeswax}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            <span style={{fontSize:11,color:T.navy}}>&#x1F4D6; Stitch guide available</span>
                            <span style={{fontSize:11,fontWeight:700,color:T.caramel}}>$18</span>
                          </div>
                        )}
                        <div style={{display:'flex',gap:6,marginTop:9}}>
                          {c.url
                            ? <a href={c.url} target="_blank" rel="noreferrer" className="btn btn-p" style={{flex:1,fontSize:11,padding:'5px 10px',textAlign:'center',textDecoration:'none'}}>View at Shop &#x2192;</a>
                            : <button className="btn btn-p" style={{flex:1,fontSize:11,padding:'5px 10px'}}>View at Shop &#x2192;</button>
                          }
                          {hasGuide&&<button className="btn btn-g" style={{fontSize:11,padding:'5px 10px'}} onClick={e=>{e.stopPropagation();setDiscoverTab('guides');}}>Buy Guide</button>}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              )} {/* end discoverTab==='designs' */}

              {/* ── Stitch Guides sub-tab ── */}
              {discoverTab==='guides'&&(
              <div style={{padding:'0 40px 40px'}}>
                <div style={{background:`linear-gradient(135deg,${T.navy},${T.navy})`,borderRadius:12,padding:'22px 28px',marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap',boxShadow:`0 4px 18px rgba(74,46,26,0.18)`}}>
                  <div>
                    <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:T.honey,fontWeight:700,marginBottom:4}}>&#x2736; Featured Guide</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.beeswax,marginBottom:3}}>Harvest Pumpkin Stocking — Complete Stitch Plan</div>
                    <div style={{fontSize:13,color:T.sandGray,marginBottom:8}}>by Melissa Shirley &nbsp;&#x00B7;&nbsp; 34 pages &nbsp;&#x00B7;&nbsp; 18 mesh &nbsp;&#x00B7;&nbsp; PDF</div>
                    <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                      {['Full thread list w/ dye lots','Stitch-by-area diagram','Sequence guide','Finishing notes'].map(f=>(
                        <span key={f} style={{fontSize:12,color:T.honey}}>&#x2713; {f}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:28,fontFamily:"'Fraunces',serif",color:T.beeswax,marginBottom:2}}>$24</div>
                    <div style={{fontSize:11,color:T.sandGray,marginBottom:10}}>instant PDF download</div>
                    <button className="btn btn-g" style={{padding:'10px 24px',fontSize:13}}>Buy Guide &#x2192;</button>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
                  {[
                    {title:'Chinoiserie Ginger Jar — Full Stitch Plan',designer:'Rachel Barri',mesh:18,pages:28,price:22,tags:['Florals','Blue & White'],hasCanvas:true,reviews:47},
                    {title:'Coastal Labrador — Fur & Background Guide',designer:"Julia's Needlework",mesh:13,pages:18,price:18,tags:['Animals','Pet Portrait'],hasCanvas:false,reviews:31},
                    {title:'Virginia Fox Hunt Belt — Stitch Map',designer:'Mark Campbell',mesh:18,pages:12,price:16,tags:['Belts','Collegiate'],hasCanvas:false,reviews:19},
                    {title:'White Hydrangea Pillow — Color & Stitch Plan',designer:'Penny Linn',mesh:18,pages:22,price:20,tags:['Florals'],hasCanvas:false,reviews:28},
                    {title:'Golden Retriever Santa — Fur Techniques',designer:'Susan Roberts',mesh:18,pages:24,price:22,tags:['Animals','Holiday'],hasCanvas:false,reviews:52},
                    {title:'Peony Garden — Petal-by-Petal Guide',designer:'Alice Peterson',mesh:18,pages:30,price:24,tags:['Florals'],hasCanvas:false,reviews:38},
                  ].map((g,i)=>(
                    <div key={i} style={{background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,overflow:'hidden',transition:'all 0.2s',cursor:'pointer'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.honey;e.currentTarget.style.boxShadow=`0 6px 20px rgba(28,61,90,0.1)`;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8DDD0';e.currentTarget.style.boxShadow='none';}}>
                      <div style={{height:100,background:`linear-gradient(135deg,${T.parchment},${T.palePeach})`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',borderBottom:`1px solid #E8DDD0`}}>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:28,marginBottom:4}}>&#x1F4C4;</div>
                          <div style={{fontSize:10,color:T.sandGray}}>{g.pages} pages &nbsp;&#x00B7;&nbsp; PDF</div>
                        </div>
                        {g.hasCanvas&&<div style={{position:'absolute',top:8,left:8,background:T.fern,color:'white',fontSize:9,padding:'2px 7px',borderRadius:6,fontWeight:700}}>In Your Stash</div>}
                        <div style={{position:'absolute',top:8,right:8,display:'flex',gap:4}}>
                          {g.tags.map(tag=><span key={tag} style={{background:T.palePeach,color:T.caramel,fontSize:9,padding:'2px 6px',borderRadius:5,fontWeight:600}}>{tag}</span>)}
                        </div>
                      </div>
                      <div style={{padding:'14px 16px'}}>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:500,color:T.navy,marginBottom:3,lineHeight:1.3}}>{g.title}</div>
                        <div style={{fontSize:12,color:T.caramel,fontWeight:600,marginBottom:6}}>by {g.designer}</div>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                          <div style={{display:'flex',gap:2}}>
                            {[1,2,3,4,5].map(star=>(
                              <span key={star} onClick={e=>{e.stopPropagation();setGuideRatings(r=>({...r,[i]:star}));}}
                                style={{fontSize:14,cursor:'pointer',color:star<=(guideRatings[i]||0)?'#C07840':'#D0C4B8',lineHeight:1,transition:'color 0.1s'}}>&#x2605;</span>
                            ))}
                          </div>
                          <span style={{fontSize:11,color:T.sandGray}}>({g.reviews})</span>
                        </div>
                        <div style={{fontSize:12,color:T.warmGray,marginBottom:12}}>{g.mesh} mesh &nbsp;&#x00B7;&nbsp; {g.pages} pages &nbsp;&#x00B7;&nbsp; Instant PDF</div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <span style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.navy,fontWeight:500}}>${g.price}</span>
                          <div style={{display:'flex',gap:7}}>
                            <button className="btn btn-s" style={{fontSize:11,padding:'5px 10px'}}>Preview</button>
                            <button className="btn btn-g" style={{fontSize:11,padding:'5px 10px'}}>Buy &#x2192;</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:32,background:T.cream,borderRadius:12,border:`1.5px solid #E8DDD0`,padding:'22px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap'}}>
                  <div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:17,color:T.navy,marginBottom:3}}>Are you a designer or stitcher with a guide to sell?</div>
                    <div style={{fontSize:13,color:T.warmGray}}>List your stitch guides on Needlewise. We handle delivery and payment — you keep 85%. No minimums, no exclusivity.</div>
                  </div>
                  <button className="btn btn-p" style={{flexShrink:0}}>Submit a Guide &#x2192;</button>
                </div>
              </div>
              )} {/* end discoverTab==='guides' */}
            </div>
          )}

          {/* ══ STITCH LIBRARY ══ */}
          {tab==='stitches'&&!selStitch&&(
            <div className="fadein">
              <div className="sec-head">
                <div className="sec-title">Stitch Library</div>
                <div className="sec-sub">Every documented needlepoint stitch — with diagrams, full-color photography, and technique guides from editors and the community.</div>
                {/* Sub-nav */}
                <div style={{display:'flex',gap:2,marginTop:14,borderBottom:`1.5px solid #E8DDD0`,paddingBottom:0}}>
                  {[{id:'stitches',label:'Stitch Library'},{id:'howto',label:'How To & Guides'}].map(st=>(
                    <button key={st.id} onClick={()=>setLibraryTab(st.id)}
                      style={{padding:'8px 18px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:600,
                        fontFamily:"'Inter',sans-serif",
                        color:libraryTab===st.id?T.navy:T.sandGray,
                        borderBottom:`2.5px solid ${libraryTab===st.id?T.caramel:'transparent'}`,
                        marginBottom:-1.5,transition:'color 0.15s'}}>
                      {st.label}
                    </button>
                  ))}
                </div>
                {libraryTab==='stitches'&&(
                <div className="sbar" style={{marginTop:12}}>
                  <input className="sinput" placeholder="Search by name or use — try 'water', 'fur', 'background', 'flower'…" value={stitchQ} onChange={e=>setStitchQ(e.target.value)}/>
                  {cats.map(c=>(
                    <button key={c} className={`chip ${stitchCat===c?'on':''}`} onClick={()=>setStitchCat(c)}>{c}</button>
                  ))}
                </div>
                )}
              </div>
              {libraryTab==='stitches'&&(
              <div className="sgl">
                {filtStitches.map(s=>(
                  <div key={s.id} className="scard" onClick={()=>setSelStitch(s)}>
                    <div className="sdiag"><Diagram type={s.diagType} size={110}/></div>
                    <div className="scbody">
                      <div className="scname">{s.name}</div>
                      <div className="sccat">{s.cat} · {s.size}</div>
                      <div className="scdesc">{s.desc}</div>
                      <div className="sctags">
                        {s.tags.slice(0,4).map(t=><span key={t} className="sctag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              {libraryTab==='howto'&&(()=>{
                const HOWTO_SECTIONS=[
                  {id:'All',label:'All Guides'},
                  {id:'Stitches',label:'Stitches & Technique'},
                  {id:'Canvas',label:'Canvas & Mesh'},
                  {id:'Thread',label:'Thread & Tools'},
                  {id:'Finishing',label:'Finishing & Framing'},
                  {id:'Getting Started',label:'Getting Started'},
                  {id:'Community',label:'Community Guides'},
                ];
                const ARTICLES=[
                  {id:1,sec:'Getting Started',type:'editorial',title:'How to start needlepoint: your first canvas',author:'Needlewise Editors',readMin:8,desc:'Everything you need to set up your first canvas — mesh count, threading, your first stitch, and finishing the back.',tags:['beginner','setup','first canvas'],featured:true},
                  {id:2,sec:'Stitches',type:'editorial',title:'How to work Basketweave stitch',author:'Needlewise Editors',readMin:5,desc:'The gold standard of needlepoint backgrounds. Step-by-step with diagrams showing the diagonal working path.',tags:['basketweave','beginner','foundation'],featured:true},
                  {id:3,sec:'Stitches',type:'community',title:'Turkey Work for realistic pet portraits — a deep dive',author:'ThreadWhisperer',readMin:12,desc:'How I approach Turkey Work for fur depth on dogs and cats, including the cut-and-sculpt technique for directional highlights.',tags:['turkey work','pets','advanced'],featured:false},
                  {id:4,sec:'Thread',type:'editorial',title:'Silk vs cotton — when to use each thread type',author:'Needlewise Editors',readMin:6,desc:'A side-by-side guide to DMC Perle Cotton, Silk & Ivory, Vineyard Silk, and metallics.',tags:['thread','silk','cotton'],featured:false},
                  {id:5,sec:'Canvas',type:'editorial',title:'How to read a painted canvas',author:'Needlewise Editors',readMin:4,desc:'Understanding mesh count, painted areas vs. background decisions, and how to plan your thread palette.',tags:['canvas','planning','beginner'],featured:false},
                  {id:6,sec:'Finishing',type:'editorial',title:'How to prepare your canvas for a finisher',author:'Needlewise Editors',readMin:7,desc:'Blocking, labeling, thread documentation, and what to include in your finishing intake packet.',tags:['finishing','blocking','documentation'],featured:true},
                  {id:7,sec:'Stitches',type:'community',title:'My favorite stitches for water and sky',author:'SilkAndSage',readMin:9,desc:'After 20 years of needlepoint I have strong opinions about stitches for water. Hungarian Ground is my default.',tags:['water','sky','hungarian ground'],featured:false},
                  {id:8,sec:'Thread',type:'community',title:'Dye lot management — why I document every project',author:'KarenNP',readMin:6,desc:'Running out of thread mid-project is painful. My system for logging dye lots and ordering smart buffers.',tags:['dye lots','thread management','planning'],featured:false},
                  {id:9,sec:'Getting Started',type:'editorial',title:'How to choose your first canvas',author:'Needlewise Editors',readMin:5,desc:'Size, mesh count, subject complexity, and price — a framework for picking a canvas that sets you up for success.',tags:['beginner','first canvas','choosing'],featured:false},
                  {id:10,sec:'Community',type:'community',title:'How I organize my stash with Craft Closet',author:'ChristmasCountdown',readMin:4,desc:'Before Needlewise I had three spreadsheets and a box of mystery thread. Here is how I migrated everything.',tags:['stash management','craft closet','organization'],featured:false},
                ];
                const filtA = howtoSection==='All'?ARTICLES:ARTICLES.filter(a=>a.sec===howtoSection);
                return howtoArticle?(
                  <div style={{maxWidth:720,margin:'0 auto',padding:'0 40px 48px'}}>
                    <button className="btn btn-s" style={{fontSize:12,marginBottom:20}} onClick={()=>setHowtoArticle(null)}>&#x2190; Back to How To</button>
                    <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
                      <span style={{fontSize:11,padding:'2px 9px',borderRadius:6,background:howtoArticle.type==='editorial'?T.paleTeal:T.palePeach,color:howtoArticle.type==='editorial'?T.slate:T.caramel,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                        {howtoArticle.type==='editorial'?'Editorial':'Community Guide'}
                      </span>
                      <span style={{fontSize:11,color:T.sandGray,padding:'2px 9px',borderRadius:6,background:T.linen}}>{howtoArticle.sec}</span>
                    </div>
                    <h1 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:T.navy,fontWeight:500,lineHeight:1.25,marginBottom:10}}>{howtoArticle.title}</h1>
                    <div style={{display:'flex',gap:16,marginBottom:24,fontSize:12,color:T.sandGray}}>
                      <span>By <strong style={{color:T.warmGray}}>{howtoArticle.author}</strong></span>
                      <span>{howtoArticle.readMin} min read</span>
                    </div>
                    <div style={{height:200,background:`linear-gradient(135deg,${T.parchment},${T.palePeach})`,borderRadius:10,marginBottom:28,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid #E8DDD0`,fontSize:48,opacity:0.5}}>&#x1F4D6;</div>
                    <p style={{fontSize:15,color:T.softBlack,lineHeight:1.8,marginBottom:18}}>{howtoArticle.desc}</p>
                    <p style={{fontSize:15,color:T.softBlack,lineHeight:1.8,marginBottom:18}}>The canvas is prepared by stretching over bars and securing at even intervals. Thread choice depends heavily on the mesh count — finer mesh requires thinner threads for adequate coverage without bunching.</p>
                    <p style={{fontSize:15,color:T.softBlack,lineHeight:1.8,marginBottom:24}}>Beginner stitchers often underestimate how much thread they need. A good rule of thumb: purchase 20% more than your best estimate for solid background areas, and always buy from the same dye lot.</p>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:28}}>
                      {howtoArticle.tags.map(tg=><span key={tg} style={{padding:'3px 10px',borderRadius:10,fontSize:12,background:T.linen,color:T.warmGray,border:`1px solid #E8DDD0`}}>#{tg}</span>)}
                    </div>
                    <div style={{background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,padding:'16px 20px',display:'flex',gap:10}}>
                      <button className="btn btn-p" style={{fontSize:12,padding:'6px 16px'}}>&#x1F44D; Helpful</button>
                      <button className="btn btn-s" style={{fontSize:12,padding:'6px 16px'}}>Suggest an edit</button>
                    </div>
                  </div>
                ):(
                  <div>
                    <div style={{padding:'0 40px 20px',display:'flex',gap:28,flexWrap:'wrap',borderBottom:`1px solid #E8DDD0`,marginBottom:0,marginTop:4}}>
                      {HOWTO_SECTIONS.map(s=>(
                        <div key={s.id} onClick={()=>setHowtoSection(s.id)}
                          style={{cursor:'pointer',fontSize:13,fontWeight:600,color:howtoSection===s.id?T.navy:T.sandGray,paddingBottom:10,borderBottom:`2px solid ${howtoSection===s.id?T.caramel:'transparent'}`,transition:'all 0.15s',whiteSpace:'nowrap'}}>
                          {s.label}
                        </div>
                      ))}
                    </div>
                    <div style={{padding:'24px 40px 40px'}}>
                      {howtoSection==='All'&&(
                        <div style={{marginBottom:28}}>
                          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',color:T.sandGray,marginBottom:14,fontWeight:700}}>Featured</div>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                            {ARTICLES.filter(a=>a.featured).map(a=>(
                              <div key={a.id} onClick={()=>setHowtoArticle(a)}
                                style={{background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,overflow:'hidden',cursor:'pointer',transition:'all 0.18s'}}
                                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.honey;e.currentTarget.style.boxShadow=`0 5px 16px rgba(28,61,90,0.09)`;}}
                                onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8DDD0';e.currentTarget.style.boxShadow='none';}}>
                                <div style={{height:72,background:`linear-gradient(135deg,${T.navy}15,${T.caramel}15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>&#x1F4D6;</div>
                                <div style={{padding:'12px 14px'}}>
                                  <div style={{display:'flex',gap:5,marginBottom:6}}>
                                    <span style={{fontSize:10,padding:'1px 7px',borderRadius:5,background:a.type==='editorial'?T.paleTeal:T.palePeach,color:a.type==='editorial'?T.slate:T.caramel,fontWeight:700,textTransform:'uppercase'}}>{a.type==='editorial'?'Editorial':'Community'}</span>
                                    <span style={{fontSize:10,padding:'1px 7px',borderRadius:5,background:T.linen,color:T.sandGray}}>{a.sec}</span>
                                  </div>
                                  <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:500,color:T.navy,marginBottom:3,lineHeight:1.3}}>{a.title}</div>
                                  <div style={{fontSize:11,color:T.sandGray}}>{a.author} &nbsp;&#x00B7;&nbsp; {a.readMin} min</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',color:T.sandGray,marginBottom:12,fontWeight:700}}>
                        {howtoSection==='All'?'All Guides':howtoSection} ({filtA.length})
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:9}}>
                        {filtA.map(a=>(
                          <div key={a.id} onClick={()=>setHowtoArticle(a)}
                            style={{background:T.cream,borderRadius:8,border:`1.5px solid #E8DDD0`,padding:'13px 16px',cursor:'pointer',display:'flex',gap:14,alignItems:'flex-start',transition:'all 0.15s'}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.honey;e.currentTarget.style.boxShadow=`0 3px 10px rgba(28,61,90,0.07)`;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8DDD0';e.currentTarget.style.boxShadow='none';}}>
                            <div style={{width:44,height:44,borderRadius:7,background:`linear-gradient(135deg,${T.parchment},${T.palePeach})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>&#x1F4D6;</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',gap:5,marginBottom:4,flexWrap:'wrap'}}>
                                <span style={{fontSize:10,padding:'1px 7px',borderRadius:5,background:a.type==='editorial'?T.paleTeal:T.palePeach,color:a.type==='editorial'?T.slate:T.caramel,fontWeight:700,textTransform:'uppercase'}}>{a.type==='editorial'?'Editorial':'Community'}</span>
                                <span style={{fontSize:10,padding:'1px 7px',borderRadius:5,background:T.linen,color:T.sandGray}}>{a.sec}</span>
                              </div>
                              <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:500,color:T.navy,marginBottom:2,lineHeight:1.3}}>{a.title}</div>
                              <div style={{fontSize:11,color:T.sandGray}}>{a.author} &nbsp;&#x00B7;&nbsp; {a.readMin} min read</div>
                            </div>
                            <div style={{flexShrink:0,color:T.sandGray,fontSize:16,alignSelf:'center'}}>&#x203A;</div>
                          </div>
                        ))}
                      </div>
                      <div style={{marginTop:24,background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap'}}>
                        <div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:15,color:T.navy,marginBottom:2}}>Have expertise to share?</div>
                          <div style={{fontSize:13,color:T.warmGray}}>Write a community guide — your techniques, tips, and hard-won knowledge. Verified members only.</div>
                        </div>
                        <button className="btn btn-p" style={{flexShrink:0,fontSize:12}}>Submit a Guide &#x2192;</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══ STITCH DETAIL ══ */}
          {tab==='stitches'&&selStitch&&(
            <div className="fadein">
              <div className="sdet">
                <button className="backbtn" onClick={()=>setSelStitch(null)}>← Back to Stitch Library</button>
                <div className="detheader">
                  <div className="detdiag"><Diagram type={selStitch.diagType} size={220}/></div>
                  <div style={{flex:1}}>
                    <div className="detcat">{selStitch.cat}</div>
                    <div className="dettitle">{selStitch.name}</div>
                    <div style={{display:'flex',gap:20,marginBottom:12,fontSize:13,color:T.warmGray}}>
                      <span><strong style={{color:T.navy}}>Size:</strong> {selStitch.size}</span>
                      <span><strong style={{color:T.navy}}>Mesh:</strong> 13–18 count</span>
                    </div>
                    <div className="detdesc">{selStitch.desc}</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {selStitch.tags.map(t=>(
                        <span key={t} style={{padding:'2px 9px',borderRadius:10,fontSize:11,background:T.palePeach,color:T.caramel,fontWeight:600}}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28,marginBottom:28}}>
                  <div>
                    <div className="detsec">✓ Best Used For</div>
                    {selStitch.bestFor.map(u=>(
                      <div key={u} className="useitem"><div className="usedot"/>{u}</div>
                    ))}
                  </div>
                  <div>
                    <div className="detsec">Thread & Color Notes</div>
                    <p style={{fontSize:14,color:T.softBlack,lineHeight:1.7}}>{selStitch.colorNotes}</p>
                  </div>
                </div>

                <div className="divider"/>
                <div style={{marginBottom:28}}>
                  <div className="detsec" style={{marginBottom:10}}>The Stitch in Action — Full-Color Photography</div>
                  <p style={{fontSize:12,color:T.sandGray,marginBottom:12,fontStyle:'italic'}}>Full-canvas, color photographs showing this stitch in real finished pieces. Tap to expand.</p>
                  <div className="photogrid">
                    {[1,2,3,4,5,6].map(n=>(
                      <div key={n} className="photocell" style={{background:`linear-gradient(135deg,${T.parchment},${T.palePeach})`}}>
                        <div style={{fontSize:22}}>{n<=2?'🖼️':n<=4?'📸':'🪡'}</div>
                        <div style={{fontSize:11,color:T.sandGray,textAlign:'center'}}>
                          <div>Full color · in situ</div>
                          <div style={{fontSize:10,opacity:0.7}}>Community photo {n}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:11,color:T.sandGray,marginTop:8,fontStyle:'italic'}}>Have a great example of this stitch? <span style={{color:T.navy,cursor:'pointer'}}>Submit your photo →</span></p>
                </div>

                <div className="divider"/>
                <div>
                  <div className="detsec">Related Stitches</div>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:8}}>
                    {STITCHES.filter(s=>s.id!==selStitch.id&&s.tags.some(t=>selStitch.tags.includes(t))).slice(0,4).map(s=>(
                      <div key={s.id} onClick={()=>setSelStitch(s)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 13px',background:T.cream,borderRadius:8,border:`1.5px solid #E8DDD0`,cursor:'pointer',transition:'border-color 0.15s'}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=T.honey} onMouseLeave={e=>e.currentTarget.style.borderColor='#E8DDD0'}>
                        <div style={{width:40,height:40,borderRadius:6,overflow:'hidden',flexShrink:0}}>
                          <Diagram type={s.diagType} size={40}/>
                        </div>
                        <div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:500,color:T.navy}}>{s.name}</div>
                          <div style={{fontSize:11,color:T.sandGray}}>{s.cat}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ COMMUNITY ══ */}
          {tab==='events'&&(
            <div className="fadein">
              <div className="sec-head">
                <div className="sec-title">Community</div>
                <div className="sec-sub">Events, retreats, trunk shows, stitch club meetups — and the Needlewise forums where stitchers share, ask, and connect.</div>
                {/* Community sub-nav */}
                <div style={{display:'flex',gap:2,marginTop:14,borderBottom:`1.5px solid #E8DDD0`,paddingBottom:0}}>
                  {[{id:'events',label:'&#x1F4C5; Events & Calendar'},{id:'forums',label:'&#x1F4AC; Forums'}].map(ct=>(
                    <button key={ct.id}
                      onClick={()=>setCommunityTab(ct.id)}
                      style={{padding:'8px 18px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:"'Inter',sans-serif",
                        color:communityTab===ct.id?T.navy:T.sandGray,
                        borderBottom:communityTab===ct.id?`2.5px solid ${T.caramel}`:'2.5px solid transparent',
                        marginBottom:-1.5,transition:'color 0.15s'}}
                      dangerouslySetInnerHTML={{__html:ct.label}}/>
                  ))}
                </div>
              </div>
              {communityTab==='events'&&(
              <div className="evlayout">
                <div className="evsidebar">
                  <div className="evftype">Filter by Type</div>
                  {[{id:'all',label:'All Events'},{id:'retreat',label:'Retreats'},{id:'class',label:'Classes'},{id:'sale',label:'Sales & Trunk Shows'},{id:'drop',label:'Design Drops'},{id:'meetup',label:'Stitch Club Meetups'}].map(f=>(
                    <div key={f.id} className={`evfitem ${evFilter===f.id?'on':''}`} onClick={()=>setEvFilter(f.id)}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:EV[f.id]?.accent||T.caramel,flexShrink:0}}/>
                      {f.label}
                    </div>
                  ))}
                  <div style={{marginTop:24,padding:'14px',background:T.palePeach,borderRadius:8,border:`1.5px solid ${T.beeswax}`}}>
                    <div className="evftype">Drop Alerts</div>
                    <p style={{fontSize:12,color:T.warmGray,lineHeight:1.55,marginBottom:10}}>Follow your favorite designers to get notified before their drops go live.</p>
                    <button className="btn btn-g" style={{width:'100%',fontSize:12,padding:'7px'}}>🔔 Manage Alerts</button>
                  </div>
                </div>
                <div className="evmain">
                  {filtEvents.filter(e=>e.featured).length>0&&(
                    <>
                      <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',color:T.sandGray,marginBottom:10,fontWeight:600}}>Featured</div>
                      <div className="evgrid">
                        {filtEvents.filter(e=>e.featured).map(e=>{
                          const ev=EV[e.type];
                          return (
                            <div key={e.id} className="evcard">
                              <div className="evaccent" style={{background:ev.accent}}/>
                              <div className="evcbody">
                                <div className="evbadge" style={{background:ev.bg,color:ev.textColor}}>{ev.label}</div>
                                <div className="evtitle">{e.title}</div>
                                <div className="evhost">{e.host}</div>
                                <div className="evmeta">
                                  <span>📅 {e.date}</span>
                                  <span>📍 {e.loc}</span>
                                  {e.price&&<span style={{color:T.fern,fontWeight:600}}>{e.price}</span>}
                                </div>
                                <div className="evdesc">{e.desc}</div>
                                <div className="evfooter">
                                  {e.spots!==null&&<span style={{fontSize:12,color:e.spots<=5?T.terracotta:T.warmGray}}>{e.spots<=5?`⚠ ${e.spots} spots left`:`${e.spots} spots`}</span>}
                                  <button className="notifbtn" style={{
                                    background:notifs[e.id]?ev.accent:'transparent',
                                    color:notifs[e.id]?'white':T.warmGray,
                                    borderColor:notifs[e.id]?ev.accent:'#D0C4B8',
                                  }} onClick={()=>setNotifs(n=>({...n,[e.id]:!n[e.id]}))}>
                                    {notifs[e.id]?'🔔 Added':(e.type==='drop'?'Alert Me':'Register')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',color:T.sandGray,marginBottom:10,fontWeight:600}}>All Upcoming</div>
                  {filtEvents.map(e=>{
                    const ev=EV[e.type];
                    return (
                      <div key={e.id} style={{background:T.cream,borderRadius:8,border:`1.5px solid #E8DDD0`,padding:'13px 15px',display:'flex',alignItems:'flex-start',gap:12,marginBottom:9,cursor:'pointer',transition:'border-color 0.15s'}}
                        onMouseEnter={el=>el.currentTarget.style.borderColor=T.honey} onMouseLeave={el=>el.currentTarget.style.borderColor='#E8DDD0'}>
                        <div style={{width:4,alignSelf:'stretch',borderRadius:2,background:ev.accent,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap'}}>
                            <div>
                              <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:500,color:T.navy,marginBottom:2}}>{e.title}</div>
                              <div style={{fontSize:12,color:T.sandGray}}>{e.host} · {e.loc} · {e.date}</div>
                            </div>
                            <button className="notifbtn" style={{background:notifs[e.id]?ev.accent:'transparent',color:notifs[e.id]?'white':T.warmGray,borderColor:notifs[e.id]?ev.accent:'#D0C4B8',fontSize:11,padding:'5px 11px'}}
                              onClick={ev2=>{ev2.stopPropagation();setNotifs(n=>({...n,[e.id]:!n[e.id]}));}}>
                              {notifs[e.id]?'🔔':'+'} {notifs[e.id]?'Added':e.type==='drop'?'Alert Me':'Register'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {communityTab==='forums'&&(()=>{
                const FORUM_CATS=[
                  {id:'All',icon:'&#x1F4CB;'},
                  {id:'Stitches & Technique',icon:'&#x1FAA1;'},
                  {id:'Canvas Help',icon:'&#x1F5BC;'},
                  {id:'Thread & Tools',icon:'&#x1F9F5;'},
                  {id:'Stitch Guides',icon:'&#x1F4D6;'},
                  {id:'Finishing',icon:'&#x2702;'},
                  {id:'Beginner Corner',icon:'&#x1F331;'},
                  {id:'Show & Tell',icon:'&#x2728;'},
                ];
                const THREADS=[
                  {id:1,cat:'Stitches & Technique',title:'Best stitch for a cloudy sky background?',author:'MargaretA',ago:'2h ago',replies:14,views:112,tags:['basketweave','scotch','sky'],pinned:false,preview:"I've been trying Scotch stitch but it feels too geometric for soft clouds. Has anyone had luck with Hungarian Ground or a satin variation?"},
                  {id:2,cat:'Canvas Help',title:'18 mesh vs 13 mesh for a portrait canvas — pros and cons?',author:'StitchingMom',ago:'5h ago',replies:28,views:309,tags:['mesh count','portraits','beginner'],pinned:false,preview:"My LNS is pushing me toward 13 mesh for the Labrador portrait I want to do but I'm nervous about the thread coverage being too loose."},
                  {id:3,cat:'Finishing',title:'Wait time horror stories — and how did you find a good finisher?',author:'JaniceT',ago:'1d ago',replies:41,views:521,tags:['finishing','wait times','recommendations'],pinned:false,preview:"My last piece sat at a finisher for 14 months with zero updates. I finally had to ask for it back unfinished. Has anyone used the Needlewise directory to find someone reliable?"},
                  {id:4,cat:'Thread & Tools',title:'Silk & Ivory vs Vineyard Silk — which do you prefer for florals?',author:'PetitePointPaula',ago:'1d ago',replies:22,views:274,tags:['silk','thread','florals'],pinned:false,preview:"I've mostly used Silk & Ivory but saw a beautiful peony done in Vineyard Silk with gorgeous sheen. Is VY harder to work with?"},
                  {id:5,cat:'Stitch Guides',title:'Has anyone used the Rachel Barri Chinoiserie guide? Worth $22?',author:'BlueMingWatcher',ago:'2d ago',replies:9,views:88,tags:['stitch guides','rachel barri','review'],pinned:false,preview:"Thinking about buying it. The canvas is already in my stash but I'm a confident intermediate — is the guide still useful at that level?"},
                  {id:6,cat:'Beginner Corner',title:'How do I park my thread properly? Mine keeps tangling.',author:'NewToNeedles',ago:'3d ago',replies:33,views:445,tags:['beginner','thread management','parking'],pinned:true,preview:"I've watched three YouTube videos and I still end up with a knot festival on the back of my canvas. Please help!"},
                  {id:7,cat:'Show & Tell',title:'Finished my first full stocking! 18 months of work.',author:'ChristmasCountdown',ago:'4d ago',replies:67,views:892,tags:['completed','stocking','show & tell'],pinned:false,preview:"Melissa Shirley Santa's Workshop. Finished by Island House. I cried when I opened the box. Here's the photo journey..."},
                  {id:8,cat:'Canvas Help',title:'Where to find the Alice Peterson Peony Garden in stock?',author:'PeonyHunter',ago:'5d ago',replies:11,views:143,tags:['in stock','alice peterson','canvas hunt'],pinned:false,preview:"It keeps showing Pre-Order everywhere I look. Anyone seen it at a shop recently or know when the next drop is?"},
                ];
                const filtThreads2 = forumCat==='All'?THREADS:THREADS.filter(t=>t.cat===forumCat);
                return forumThread?(
                  // Thread detail view
                  <div style={{padding:'0 40px 40px'}}>
                    <button className="btn btn-s" style={{fontSize:12,marginBottom:20}} onClick={()=>setForumThread(null)}>&#x2190; Back to Forums</button>
                    <div style={{background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,padding:'24px 28px',marginBottom:20}}>
                      <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
                        <span style={{padding:'2px 9px',borderRadius:6,fontSize:11,background:T.palePeach,color:T.caramel,fontWeight:600}}>{forumThread.cat}</span>
                        {forumThread.tags.map(tg=>(
                          <span key={tg} style={{padding:'2px 9px',borderRadius:6,fontSize:11,background:T.linen,color:T.warmGray,fontWeight:500}}>#{tg}</span>
                        ))}
                      </div>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:T.navy,marginBottom:8,lineHeight:1.3}}>{forumThread.title}</div>
                      <div style={{fontSize:12,color:T.sandGray,marginBottom:16}}>Posted by <strong style={{color:T.warmGray}}>{forumThread.author}</strong> &nbsp;&#x00B7;&nbsp; {forumThread.ago} &nbsp;&#x00B7;&nbsp; {forumThread.views} views</div>
                      <p style={{fontSize:14,color:T.softBlack,lineHeight:1.7,marginBottom:0}}>{forumThread.preview} Lorem ipsum stitching dolor sit amet, consectetur canvas adipiscing elit. Sed do eiusmod thread tempor incididunt ut labore et dolore magna stitcha.</p>
                    </div>
                    {[
                      {author:'KarenNP',ago:'1h ago',text:"I'd go with Hungarian Ground — the texture is soft enough for sky and it catches light beautifully in silk.",upvotes:8},
                      {author:'ThreadWhisperer',ago:'3h ago',text:"Scotch is fine but try Alternating Scotch with two very close tonal values. The direction change softens the geometry a lot.",upvotes:12},
                      {author:'SilkAndSage',ago:'5h ago',text:"Satin stitch worked in diagonal rows for me. The smooth surface really reads as 'sky' better than anything geometric.",upvotes:19},
                    ].map((r,i)=>(
                      <div key={i} style={{background:T.cream,borderRadius:8,border:`1.5px solid #E8DDD0`,padding:'16px 20px',marginBottom:10,display:'flex',gap:14}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:T.parchment,border:`1.5px solid #D0C4B8`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:T.navy,flexShrink:0}}>
                          {r.author.slice(0,2).toUpperCase()}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                            <span style={{fontSize:13,fontWeight:600,color:T.navy}}>{r.author}</span>
                            <span style={{fontSize:11,color:T.sandGray}}>{r.ago}</span>
                          </div>
                          <p style={{fontSize:13,color:T.softBlack,lineHeight:1.6,margin:0,marginBottom:8}}>{r.text}</p>
                          <button style={{background:'none',border:'none',fontSize:11,color:T.sandGray,cursor:'pointer',padding:0}}>&#x25B2; {r.upvotes} helpful</button>
                        </div>
                      </div>
                    ))}
                    <div style={{background:T.linen,borderRadius:8,border:`1.5px solid #D0C4B8`,padding:'14px 16px',marginTop:8}}>
                      <div style={{fontSize:12,color:T.sandGray,marginBottom:8,fontWeight:600}}>Add a reply</div>
                      <textarea style={{width:'100%',minHeight:80,border:`1px solid #D0C4B8`,borderRadius:6,padding:'8px 11px',fontFamily:"'Inter',sans-serif",fontSize:13,color:T.softBlack,background:T.cream,resize:'vertical',boxSizing:'border-box'}} placeholder="Share your experience or advice…"/>
                      <button className="btn btn-p" style={{marginTop:8,fontSize:12}}>Post Reply</button>
                    </div>
                  </div>
                ):(
                  // Thread list view
                  <div style={{display:'flex',gap:0,padding:'0 40px 40px'}}>
                    {/* Category sidebar */}
                    <div style={{width:200,flexShrink:0,paddingRight:24}}>
                      <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.09em',color:T.sandGray,fontWeight:700,marginBottom:10}}>Categories</div>
                      {FORUM_CATS.map(fc=>(
                        <div key={fc.id} onClick={()=>setForumCat(fc.id)}
                          style={{padding:'8px 12px',borderRadius:7,cursor:'pointer',marginBottom:2,display:'flex',alignItems:'center',gap:8,fontSize:13,
                            background:forumCat===fc.id?T.parchment:'transparent',
                            color:forumCat===fc.id?T.navy:T.warmGray,
                            fontWeight:forumCat===fc.id?600:400,
                            transition:'all 0.12s'}}
                          dangerouslySetInnerHTML={{__html:`<span style="font-size:15px">${fc.icon}</span> ${fc.id}`}}/>
                      ))}
                      <div style={{marginTop:20,padding:'12px',background:T.palePeach,borderRadius:8,border:`1px solid ${T.beeswax}`}}>
                        <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.07em'}}>Forum Rules</div>
                        <p style={{fontSize:11,color:T.warmGray,lineHeight:1.55,margin:0}}>Be kind, stay on topic, no spam. Tag your posts so others can find them. Verified members only to post.</p>
                      </div>
                    </div>
                    {/* Thread list */}
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                        <span style={{fontSize:13,color:T.warmGray}}>{filtThreads2.length} threads{forumCat!=='All'?` in ${forumCat}`:''}</span>
                        <div style={{display:'flex',gap:8}}>
                          <input className="sinput" style={{maxWidth:200,padding:'6px 12px',fontSize:12}} placeholder="Search threads…"/>
                          <button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}}>+ New Thread</button>
                        </div>
                      </div>
                      {filtThreads2.map(th=>(
                        <div key={th.id} onClick={()=>setForumThread(th)}
                          style={{background:T.cream,borderRadius:8,border:`1.5px solid ${th.pinned?T.honey:'#E8DDD0'}`,padding:'14px 16px',marginBottom:9,cursor:'pointer',transition:'border-color 0.15s,box-shadow 0.15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.honey;e.currentTarget.style.boxShadow=`0 3px 12px rgba(74,46,26,0.08)`;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=th.pinned?T.honey:'#E8DDD0';e.currentTarget.style.boxShadow='none';}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap',alignItems:'center'}}>
                                {th.pinned&&<span style={{fontSize:10,padding:'1px 7px',borderRadius:5,background:T.beeswax,color:T.navy,fontWeight:700}}>&#x1F4CC; Pinned</span>}
                                <span style={{fontSize:10,padding:'1px 7px',borderRadius:5,background:T.palePeach,color:T.caramel,fontWeight:600}}>{th.cat}</span>
                                {th.tags.slice(0,2).map(tg=><span key={tg} style={{fontSize:10,color:T.sandGray}}>#{tg}</span>)}
                              </div>
                              <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:500,color:T.navy,marginBottom:4,lineHeight:1.3}}>{th.title}</div>
                              <div style={{fontSize:12,color:T.sandGray,marginBottom:6,lineHeight:1.5,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',maxWidth:'100%'}}>{th.preview}</div>
                              <div style={{fontSize:11,color:T.sandGray}}>by <strong style={{color:T.warmGray}}>{th.author}</strong> &nbsp;&#x00B7;&nbsp; {th.ago}</div>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0,minWidth:70}}>
                              <div style={{fontSize:17,fontWeight:600,color:T.navy,fontFamily:"'Fraunces',serif"}}>{th.replies}</div>
                              <div style={{fontSize:10,color:T.sandGray,marginBottom:4}}>replies</div>
                              <div style={{fontSize:11,color:T.sandGray}}>{th.views} views</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══ DESTASH ══ */}
          {tab==='destash'&&(()=>{
            const DESTASH_ITEMS=[
              {id:1,seller:'MargaretA',verified:true,type:'Canvas',title:'Melissa Shirley — Holiday Hound Stocking (unstitched)',condition:'New',price:195,retail:285,photo:'&#x1F3E0;',tags:['holiday','dog','stocking'],loc:'Raleigh, NC',ago:'1d ago',desc:'Purchased at a trunk show, never opened. Still in original packaging with tags. Moving to a smaller apartment and destashing.',contacted:false},
              {id:2,seller:'StitchingMom',verified:true,type:'Canvas',title:'Peony Garden by Alice Peterson (unstitched)',condition:'New',price:145,retail:185,photo:'&#x1F338;',tags:['florals','alice peterson'],loc:'Nashville, TN',ago:'2d ago',desc:'Bought with good intentions but my WIP pile has gotten out of control. Comes with the original stitch guide.',contacted:false},
              {id:3,seller:'JaniceT',verified:true,type:'Thread Lot',title:'Silk & Ivory lot — 42 skeins, mixed colors',condition:'New',price:85,retail:165,photo:'&#x1F9F5;',tags:['silk','silk & ivory','thread lot'],loc:'Atlanta, GA',ago:'3d ago',desc:'Purchasing all these for a project that fell through. Most are still banded. Full color list in photos.',contacted:false},
              {id:4,seller:'PetitePointPaula',verified:true,type:'Canvas',title:'Rachel Barri coastal scene — 16"x20" 18 mesh',condition:'Like New',price:175,retail:240,photo:'&#x1F30A;',tags:['coastal','rachel barri'],loc:'Philadelphia, PA',ago:'3d ago',desc:"Barely handled — I held it up, decided it wasn't my style. Immaculate condition.",contacted:false},
              {id:5,seller:'ThreadWhisperer',verified:false,type:'Tools',title:'Laying tool collection — 4 tools including Trolley Needle',condition:'Good',price:35,retail:70,photo:'&#x1F9F5;',tags:['tools','laying tool'],loc:'Houston, TX',ago:'5d ago',desc:'Four assorted laying tools from various brands. All functional, one has minor wear on handle.',contacted:false},
              {id:6,seller:'BlueMingWatcher',verified:true,type:'Thread Lot',title:'Vineyard Silk blues & greens — 28 skeins',condition:'New',price:65,retail:110,photo:'&#x1F9F5;',tags:['vineyard silk','thread lot','blues'],loc:'Kansas City, MO',ago:'6d ago',desc:'Originally purchased for a Chinoiserie project. Palette is V45, V46, and assorted greens. Still banded.',contacted:false},
              {id:7,seller:'KarenNP',verified:true,type:'Canvas',title:'Susan Roberts Golden Retriever (unstitched)',condition:'New',price:185,retail:245,photo:'&#x1F436;',tags:['animals','dog','golden retriever'],loc:'New York, NY',ago:'1w ago',desc:'Duplicate — received this as a gift and already owned it. One will find a better home here.',contacted:false},
              {id:8,seller:'NewToNeedles',verified:false,type:'Tools',title:'Beginner starter kit — frame, scissors, laying tool',condition:'Good',price:25,retail:55,photo:'&#x2702;',tags:['beginner','tools','starter kit'],loc:'Austin, TX',ago:'1w ago',desc:'Outgrown my beginner tools. Includes Q-Snap frame (8"x8"), Karen Kay Buckley scissors, and a basic laying tool.',contacted:false},
            ];
            const DTYPES=['All','Canvas','Thread Lot','Tools'];
            const filtDest = destashFilter==='All'?DESTASH_ITEMS:DESTASH_ITEMS.filter(d=>d.type===destashFilter);
            return (
              <div className="fadein">
                <div className="sec-head">
                  <div className="sec-title">Destash Marketplace</div>
                  <div className="sec-sub">Buy and sell unstitched canvases, thread, and tools from verified Needlewise members. Find treasures, free up space.</div>
                  <div className="sbar">
                    <input className="sinput" placeholder="Search by canvas, designer, thread brand, or seller…"/>
                    {DTYPES.map(dt=>(
                      <button key={dt} className={`chip ${destashFilter===dt?'on':''}`} onClick={()=>setDestashFilter(dt)}>{dt}</button>
                    ))}
                  </div>
                </div>
                <div style={{padding:'0 40px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                    <span style={{fontSize:13,color:T.warmGray}}>{filtDest.length} listings</span>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:T.sandGray}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:T.fern}}/> Verified seller
                        <div style={{width:8,height:8,borderRadius:'50%',background:T.sandGray,marginLeft:8}}/> Unverified
                      </div>
                      <button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}}>+ List an Item</button>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16,marginBottom:32}}>
                    {filtDest.map((d,i)=>(
                      <div key={d.id} style={{background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,overflow:'hidden',transition:'all 0.18s'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.honey;e.currentTarget.style.boxShadow=`0 5px 16px rgba(28,61,90,0.09)`;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8DDD0';e.currentTarget.style.boxShadow='none';}}>
                        {/* Item thumb */}
                        <div style={{height:110,background:`linear-gradient(135deg,${T.parchment},${T.palePeach})`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',fontSize:40,borderBottom:`1px solid #E8DDD0`}}
                          dangerouslySetInnerHTML={{__html:d.photo}}>
                        </div>
                        <div style={{padding:'14px 16px'}}>
                          {/* Seller + verified */}
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                            <div style={{width:24,height:24,borderRadius:'50%',background:d.verified?T.fern:T.sandGray,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'white',flexShrink:0}}>
                              {d.seller.slice(0,2).toUpperCase()}
                            </div>
                            <span style={{fontSize:12,fontWeight:600,color:T.navy}}>{d.seller}</span>
                            {d.verified&&<span style={{fontSize:10,color:T.fern,fontWeight:700}}>&#x2713; Verified</span>}
                            <span style={{fontSize:10,color:T.sandGray,marginLeft:'auto'}}>{d.ago}</span>
                          </div>
                          {/* Type badge */}
                          <div style={{marginBottom:6}}>
                            <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,background:T.linen,color:T.warmGray,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>{d.type}</span>
                          </div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:500,color:T.navy,marginBottom:4,lineHeight:1.3}}>{d.title}</div>
                          <div style={{fontSize:12,color:T.warmGray,marginBottom:6,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{d.desc}</div>
                          <div style={{display:'flex',gap:10,fontSize:12,color:T.sandGray,marginBottom:10}}>
                            <span>Condition: <strong style={{color:d.condition==='New'?T.fern:T.warmGray}}>{d.condition}</strong></span>
                            <span>&#x1F4CD; {d.loc}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            <div>
                              <span style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.navy,fontWeight:500}}>${d.price}</span>
                              <span style={{fontSize:12,color:T.sandGray,marginLeft:6,textDecoration:'line-through'}}>${d.retail} retail</span>
                            </div>
                            <button
                              onClick={()=>setContactedListing(c=>({...c,[d.id]:true}))}
                              className={contactedListing[d.id]?'btn btn-s':'btn btn-p'}
                              style={{fontSize:11,padding:'6px 12px'}}>
                              {contactedListing[d.id]?'&#x2713; Message Sent':'Contact Seller'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Seller CTA */}
                  <div style={{background:`linear-gradient(135deg,${T.navy},${T.navy})`,borderRadius:12,padding:'22px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap',marginBottom:32,boxShadow:`0 4px 18px rgba(74,46,26,0.18)`}}>
                    <div>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.beeswax,marginBottom:3}}>Ready to destash?</div>
                      <div style={{fontSize:13,color:T.sandGray,maxWidth:400}}>List your unstitched canvases, thread, and tools for free. Verified Needlewise Pro members only — no fees, no commission.</div>
                    </div>
                    <button className="btn btn-g" style={{flexShrink:0}}>List an Item &#x2192;</button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ══ MAP ══ */}
          {tab==='map'&&(
            <div className="fadein">
              <div className="sec-head">
                <div className="sec-title">Find a Local Needlepoint Shop</div>
                <div className="sec-sub">{SHOPS_GEO.length} verified shops — with hours, specialties, and class schedules. Hover a pin for a quick preview.</div>
              </div>
              <div className="mapsec">
                <div style={{marginBottom:16}}>
                  <USMap shops={SHOPS_GEO} />
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <span style={{fontSize:13,color:T.warmGray}}>
                    {shopQ ? `${SHOPS_GEO.filter(s=>{const q=shopQ.toLowerCase();const stName=STATE_NAMES[s.state]||'';return s.city.toLowerCase().includes(q)||s.state.toLowerCase().includes(q)||stName.includes(q)||s.name.toLowerCase().includes(q);}).length} results` : `${SHOPS_GEO.length} shops`}
                    {' · '}<span style={{color:T.navy,cursor:'pointer'}}>Is your shop missing? Add it &#x2192;</span>
                  </span>
                  <input
                    className="sinput"
                    style={{maxWidth:280}}
                    placeholder="Search by city, state, or shop name…"
                    value={shopQ}
                    onChange={e=>setShopQ(e.target.value)}
                  />
                </div>
                <div className="lnsgrid">
                  {SHOPS_GEO
                    .filter(s=>{
                      if(!shopQ) return true;
                      const q=shopQ.toLowerCase();
                      const stName=STATE_NAMES[s.state]||'';
                      return s.city.toLowerCase().includes(q)||s.state.toLowerCase().includes(q)||stName.includes(q)||s.name.toLowerCase().includes(q);
                    })
                    .map((s,i)=>(
                    <div key={i} className="lnscard">
                      <div className="lnsname">{s.name}</div>
                      <div className="lnscity">{s.city}, {s.state}</div>
                      {s.hours&&<div className="lnsrow">&#x23F0; {s.hours}</div>}
                      {s.phone&&<div className="lnsrow">&#x1F4DE; {s.phone}</div>}
                      <div style={{display:'flex',gap:6,marginTop:10,alignItems:'center'}}>
                        {s.url
                          ? <a href={s.url} target="_blank" rel="noreferrer" className="btn btn-s" style={{fontSize:11,padding:'5px 11px',textDecoration:'none'}}>Visit Website &#x2192;</a>
                          : <button className="btn btn-s" style={{fontSize:11,padding:'5px 11px'}}>View Shop</button>
                        }
                        <button className="btn btn-p" style={{fontSize:11,padding:'5px 11px'}}>Classes &#x2192;</button>
                        {s.ig&&<a href={s.ig} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,borderRadius:'50%',border:'1.5px solid #DDE3E9',textDecoration:'none',flexShrink:0,transition:'border-color 0.15s'}} title="Instagram"
                          onMouseOver={e=>e.currentTarget.style.borderColor='#E07060'}
                          onMouseOut={e=>e.currentTarget.style.borderColor='#DDE3E9'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A6370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <circle cx="12" cy="12" r="4"/>
                            <circle cx="17.5" cy="6.5" r="1" fill="#5A6370" stroke="none"/>
                          </svg>
                        </a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ FINISHING ══ */}
          {tab==='finishing'&&(
            <div className="fadein">
              {/* Booking Modal */}
              {bookingFinisher&&(
                <div style={{position:'fixed',inset:0,background:'rgba(28,20,16,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}
                  onClick={()=>{setBookingFinisher(null);setBookingStep(1);}}>
                  <div style={{background:T.cream,borderRadius:14,padding:'30px 32px',maxWidth:460,width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
                    {bookingStep===1&&(
                      <>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.navy,marginBottom:3}}>{bookingFinisher.name}</div>
                        <div style={{fontSize:12,color:T.sandGray,marginBottom:18}}>Request a finishing slot</div>
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',color:T.sandGray,fontWeight:600,marginBottom:5}}>Canvas</div>
                          <select className="fsel" style={{width:'100%'}} value={bookingCanvas} onChange={e=>setBookingCanvas(e.target.value)}>
                            <option value="">Select canvas from your stash…</option>
                            {INIT_CANVASES.map(c=><option key={c.id} value={c.title}>{c.title}</option>)}
                            <option value="other">Other (describe below)</option>
                          </select>
                        </div>
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',color:T.sandGray,fontWeight:600,marginBottom:5}}>Service Type</div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            {bookingFinisher.svcs.map(sv=>(
                              <button key={sv} onClick={()=>setBookingService(sv)}
                                style={{padding:'6px 12px',borderRadius:7,fontSize:12,border:`1.5px solid ${bookingService===sv?T.navy:'#D0C4B8'}`,background:bookingService===sv?T.linen:'transparent',color:bookingService===sv?T.navy:T.warmGray,cursor:'pointer',fontWeight:bookingService===sv?600:400,transition:'all 0.12s'}}>
                                {sv}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{background:T.linen,borderRadius:8,padding:'12px 14px',marginBottom:18,border:`1px solid #E8DDD0`}}>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:T.warmGray,marginBottom:4}}>
                            <span>Estimated wait</span><span style={{fontWeight:700,color:wc(bookingFinisher.wait)}}>{bookingFinisher.wait} months</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:T.warmGray}}>
                            <span>Slot availability</span><span style={{fontWeight:700,color:bookingFinisher.slots==='Open'?T.sage:T.caramel}}>{bookingFinisher.slots}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn-p" style={{flex:1}} onClick={()=>bookingCanvas&&bookingService?setBookingStep(2):null}
                            disabled={!bookingCanvas||!bookingService}>
                            Continue →
                          </button>
                          <button className="btn btn-s" onClick={()=>{setBookingFinisher(null);setBookingStep(1);}}>Cancel</button>
                        </div>
                      </>
                    )}
                    {bookingStep===2&&(
                      <>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.navy,marginBottom:3}}>Confirm Booking Request</div>
                        <div style={{fontSize:12,color:T.sandGray,marginBottom:18}}>Review your details before submitting</div>
                        <div style={{background:T.linen,borderRadius:9,padding:'14px 16px',marginBottom:18,border:`1.5px solid #E8DDD0`}}>
                          {[['Finisher',bookingFinisher.name],['Canvas',bookingCanvas],['Service',bookingService],['Est. Wait',`${bookingFinisher.wait} months`]].map(([l,v])=>(
                            <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8}}>
                              <span style={{color:T.sandGray}}>{l}</span><span style={{color:T.navy,fontWeight:600}}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{background:T.palePeach,borderRadius:8,padding:'10px 14px',marginBottom:18,border:`1px solid ${T.beeswax}`,fontSize:12,color:T.navy,lineHeight:1.5}}>
                          📬 The finisher will review your request and confirm availability within 48 hours. You'll receive a notification when confirmed.
                        </div>
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn-p" style={{flex:1}} onClick={()=>{setBookingConfirmed(b=>({...b,[bookingFinisher.name]:true}));setBookingFinisher(null);setBookingStep(1);}}>
                            Submit Request ✓
                          </button>
                          <button className="btn btn-s" onClick={()=>setBookingStep(1)}>← Back</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="sec-head">
                <div className="sec-title">Finishing Directory</div>
                <div className="sec-sub">Find and book professional finishers — real wait times, verified portfolios, and direct slot booking.</div>
                <div className="sbar">
                  <input className="sinput" placeholder="Search by location or service type…"/>
                  {['All','Open Slots','Short Wait','Pillows','Stockings','Ornaments'].map(f=>(
                    <button key={f} className="chip">{f}</button>
                  ))}
                </div>
              </div>
              <div style={{padding:'0 40px 8px',display:'flex',alignItems:'center',gap:14}}>
                {[{c:T.sage,l:'Short wait (≤3 mo)'},{c:T.caramel,l:'Moderate (4–6 mo)'},{c:T.terracotta,l:'Long wait (7+ mo)'}].map(b=>(
                  <div key={b.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:13}}>
                    <div style={{width:12,height:12,borderRadius:2,background:b.c}}/><span style={{color:T.warmGray}}>{b.l}</span>
                  </div>
                ))}
              </div>
              <div className="fingrid">
                {finishers.map((f,i)=>(
                  <div key={i} className="fincard">
                    {bookingConfirmed[f.name]&&(
                      <div style={{background:T.paleGreen,borderRadius:6,padding:'5px 10px',marginBottom:10,fontSize:12,color:T.fern,fontWeight:600}}>
                        ✓ Booking request sent — awaiting confirmation
                      </div>
                    )}
                    <div className="finname">{f.name}</div>
                    <div className="finloc">📍 {f.loc}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontSize:12,color:T.warmGray}}>Current wait</span>
                      <span style={{fontSize:13,fontWeight:700,color:wc(f.wait)}}>{f.wait} months</span>
                    </div>
                    <div className="waitbar">
                      <div className="waitfill" style={{width:`${(f.wait/12)*100}%`,background:wc(f.wait)}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:T.sandGray,marginBottom:10}}>
                      <span>★ {f.rating} ({f.reviews} reviews)</span>
                      <span style={{color:f.slots==='Open'?T.sage:T.caramel,fontWeight:600}}>{f.slots}</span>
                    </div>
                    <div className="ftags">{f.svcs.map(sv=><span key={sv} className="ftag">{sv}</span>)}</div>
                    <div style={{display:'flex',gap:7,marginTop:13}}>
                      <button className="btn btn-p" style={{flex:1,fontSize:12}} onClick={()=>{setBookingFinisher(f);setBookingCanvas('');setBookingService('');setBookingStep(1);}}>
                        {bookingConfirmed[f.name]?'Request Again':'Book Slot'}
                      </button>
                      <button className="btn btn-s" style={{fontSize:12}}>View Work</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* White Glove Concierge Upsell */}
              <div style={{padding:'0 40px 20px'}}>
                <div style={{background:`linear-gradient(135deg,${T.navy},${T.navy})`,borderRadius:12,padding:'24px 28px',boxShadow:`0 4px 20px rgba(74,46,26,0.2)`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,flexWrap:'wrap'}}>
                    <div>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.beeswax,marginBottom:4}}>✦ White Glove Concierge</div>
                      <div style={{fontSize:13,color:T.sandGray,lineHeight:1.6,maxWidth:480}}>
                        Don't want to manage finishing yourself? We'll match you with the perfect finisher, handle all intake paperwork, track your canvas, and send you photo updates — start to finish.
                      </div>
                      <div style={{display:'flex',gap:16,marginTop:12}}>
                        {['Finisher matching & vetting','Full intake handling','Progress photo updates','Delivery coordination'].map(f=>(
                          <div key={f} style={{fontSize:12,color:T.honey,display:'flex',alignItems:'center',gap:5}}>
                            <span style={{color:T.caramel}}>✓</span>{f}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{textAlign:'center',flexShrink:0}}>
                      <div style={{fontSize:26,fontFamily:"'Fraunces',serif",color:T.beeswax,marginBottom:2}}>$199</div>
                      <div style={{fontSize:11,color:T.sandGray,marginBottom:10}}>flat fee / summer</div>
                      <button className="btn btn-g" style={{padding:'10px 22px',fontSize:13}}>Get Concierge →</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{padding:'0 40px 32px'}}>
                <div style={{background:T.navy,borderRadius:12,padding:'22px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:`0 4px 20px rgba(74,46,26,0.2)`}}>
                  <div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:T.beeswax,marginBottom:3}}>Are you a finisher?</div>
                    <div style={{fontSize:13,color:T.sandGray}}>Join the directory, manage your queue digitally, and connect with thousands of stitchers.</div>
                  </div>
                  <button className="btn btn-g" style={{flexShrink:0,marginLeft:20}}>List My Services →</button>
                </div>
              </div>
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {tab==='profile'&&(
            <div className="profwrap fadein">
              <div className="profsidebar">
                <div style={{padding:'0 22px 20px',borderBottom:'1px solid rgba(232,192,128,0.1)',marginBottom:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:44,height:44,borderRadius:'50%',background:T.caramel,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:T.navy,border:`2px solid ${T.honey}`}}>SL</div>
                    <div>
                      <div style={{color:T.beeswax,fontSize:14,fontWeight:600}}>Sarah L.</div>
                      <div style={{color:'rgba(232,192,128,0.45)',fontSize:12}}>Intermediate stitcher</div>
                    </div>
                  </div>
                </div>
                {[
                  {id:'notes',icon:'📖',label:'Project Notes'},
                  {id:'closet',icon:'🧵',label:'Craft Closet'},
                  {id:'wishlist',icon:'♡',label:'Canvas Wishlist'},
                  {id:'stats',icon:'📊',label:'Stitching Stats'},
                  {id:'alerts',icon:'🔔',label:'Drop Alerts'},
                ].map(item=>(
                  <div key={item.id} className={`profnavitem ${profTab===item.id?'on':''}`} onClick={()=>setProfTab(item.id)}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="profcontent">

                {profTab==='notes'&&(
                  <div>
                    <div className="profname">Project Notes</div>
                    <p style={{fontSize:13,color:T.warmGray,marginBottom:12}}>Your personal stitching diary — thread choices, dye lots, stitch decisions, and progress notes for every canvas.</p>
                    <div className="profstats">
                      <div className="stat"><div className="statnum">3</div><div className="statlabel">Active WIPs</div></div>
                      <div className="stat"><div className="statnum">12</div><div className="statlabel">Completed</div></div>
                      <div className="stat"><div className="statnum">8</div><div className="statlabel">In Stash</div></div>
                      <div className="stat"><div className="statnum">2</div><div className="statlabel">At Finisher</div></div>
                    </div>

                    {/* Share success toast */}
                    {sharedProject&&(
                      <div style={{background:T.paleGreen,border:`1.5px solid ${T.sage}`,borderRadius:8,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontSize:13,color:T.fern}}>&#x2713; <strong>"{sharedProject}"</strong> is now on your public profile — other stitchers can discover and admire it!</span>
                        <button onClick={()=>setSharedProject(null)} style={{background:'none',border:'none',color:T.sandGray,cursor:'pointer',fontSize:16,lineHeight:1,padding:'0 2px'}}>&#x00D7;</button>
                      </div>
                    )}

                    {/* Pre-project planning panel */}
                    {planMode?(
                      <div style={{background:T.cream,borderRadius:10,border:`1.5px solid ${T.honey}`,padding:'20px',marginBottom:18,boxShadow:`0 2px 12px rgba(192,120,64,0.08)`}}>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:17,color:T.navy,marginBottom:2}}>Plan a New Project</div>
                        <p style={{fontSize:12,color:T.warmGray,marginBottom:14,lineHeight:1.5}}>Map out your canvas and thread needs before you start stitching. We'll check what's already in your Craft Closet.</p>
                        <div className="frow">
                          <div className="fgrp" style={{flex:2}}>
                            <label className="flabel">Canvas</label>
                            <select className="fsel" value={planCanvas} onChange={e=>setPlanCanvas(e.target.value)}>
                              <option value="">Choose from your stash…</option>
                              {INIT_CANVASES.map(c=><option key={c.id} value={c.title}>{c.title}</option>)}
                            </select>
                          </div>
                          <div className="fgrp">
                            <label className="flabel">Target Start</label>
                            <input className="finput" placeholder="e.g. April 2026"/>
                          </div>
                        </div>
                        <div style={{marginBottom:10}}>
                          <div className="flabel" style={{marginBottom:7}}>Planned Threads</div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            {[
                              {name:'Vineyard Silk V45',hex:'#5A8888',inCloset:true},
                              {name:'Silk & Ivory 001',hex:'#F8F0DC',inCloset:false},
                              {name:'DMC 3750',hex:'#2A4A5A',inCloset:true},
                              {name:'Rainbow Gallery PS02',hex:'#C8A830',inCloset:true},
                            ].map(th=>(
                              <div key={th.name} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:7,fontSize:12,border:`1.5px solid ${th.inCloset?T.sage:'#D0C4B8'}`,background:th.inCloset?T.paleGreen:T.linen,color:th.inCloset?T.fern:T.warmGray}}>
                                <div style={{width:10,height:10,borderRadius:2,background:th.hex,border:'1px solid rgba(0,0,0,0.1)',flexShrink:0}}/>
                                {th.name}
                                <span style={{fontSize:10,fontWeight:700}}>{th.inCloset?'in closet':'need to buy'}</span>
                              </div>
                            ))}
                          </div>
                          <p style={{fontSize:11,color:T.sandGray,marginTop:8,fontStyle:'italic'}}>Green = already in your Craft Closet. Need to purchase 1 thread before starting.</p>
                        </div>
                        <div style={{display:'flex',gap:8,marginTop:14}}>
                          <button className="btn btn-p" onClick={()=>setPlanMode(false)}>Create Project &#x2192;</button>
                          <button className="btn btn-s" onClick={()=>setPlanMode(false)}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <div style={{display:'flex',gap:8,marginBottom:16}}>
                        <button className="btn btn-p" style={{fontSize:12}} onClick={()=>setPlanMode(true)}>Plan New Project</button>
                        <button className="btn btn-s" style={{fontSize:12}}>+ New Project</button>
                      </div>
                    )}

                    {INIT_PROJECTS.map(proj=>(
                      <div key={proj.id} className="projcard">
                        <div className="projhead" onClick={()=>setExpProj(expProj===proj.id?null:proj.id)}>
                          <div style={{flex:1}}>
                            <div className="projcanvas">{proj.canvas}</div>
                            <div className="projtitle">{proj.title}</div>
                            <div style={{fontSize:12,color:T.sandGray,marginTop:3}}>Started {proj.startDate}</div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                            <span className="pill" style={{background:T.paleGreen,color:T.fern}}>In Progress</span>
                            <button
                              onClick={e=>{e.stopPropagation();setSharedProject(proj.title);}}
                              style={{padding:'4px 10px',borderRadius:6,fontSize:11,border:`1px solid #D0C4B8`,background:'transparent',color:T.warmGray,cursor:'pointer',fontWeight:600,transition:'all 0.15s',whiteSpace:'nowrap'}}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.navy;e.currentTarget.style.color=T.navy;}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor='#D0C4B8';e.currentTarget.style.color=T.warmGray;}}>
                              Share &#x2197;
                            </button>
                            <span style={{color:T.sandGray,fontSize:18,lineHeight:1}}>{expProj===proj.id?'&#x2191;':'&#x2193;'}</span>
                          </div>
                        </div>
                        {expProj===proj.id&&(
                          <div className="entries">
                            {proj.entries.map((e,i)=>(
                              <div key={i} className="entry">
                                <div className="entdate">{e.date}</div>
                                <div className="entnote">{e.note}</div>
                                <div className="entthreads">{e.threads.map(t=><span key={t} className="etag">{t}</span>)}</div>
                              </div>
                            ))}
                            <button className="btn btn-s" style={{fontSize:12,width:'100%',marginTop:7}}>+ Add Journal Entry</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {profTab==='closet'&&(
                  <div>
                    <div className="profname">Craft Closet</div>
                    <p style={{fontSize:13,color:T.warmGray,marginBottom:14}}>Your complete thread and canvas stash — searchable, organized, and always with you at the shop.</p>
                    <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap'}}>
                      <div className="closettabs">
                        <button className={`ctab ${closetTab==='threads'?'on':''}`} onClick={()=>setClosetTab('threads')}>🧵 Threads ({threads.length})</button>
                        <button className={`ctab ${closetTab==='canvases'?'on':''}`} onClick={()=>setClosetTab('canvases')}>🖼 Canvases ({INIT_CANVASES.length})</button>
                      </div>
                    </div>

                    {closetTab==='threads'&&(
                      <>
                        <AddThreadForm onAdd={t=>setThreads(p=>[...p,{...t,id:Date.now()}])}/>
                        <div className="sbar" style={{marginBottom:14}}>
                          <input className="sinput" placeholder="Search threads — try 'green', 'DMC', 'silk', 'teal', 'gold'…" value={threadQ} onChange={e=>setThreadQ(e.target.value)}/>
                          {threads.length>0&&<span style={{fontSize:12,color:T.sandGray,whiteSpace:'nowrap'}}>{filtThreads.length} of {threads.length}</span>}
                        </div>
                        <div className="tgrid">
                          {filtThreads.map(t=>(
                            <div key={t.id} className="tcard">
                              <div className="tswatch" style={{background:t.hex}}/>
                              <div style={{flex:1,minWidth:0}}>
                                <div className="tbrand">{t.brand}</div>
                                <div className="tname">{t.name}</div>
                                <div className="tmeta">#{t.num} · {t.size}</div>
                                {t.dyelot&&<div className="tmeta">Lot: {t.dyelot}</div>}
                                <div className="tqty">{t.qty} {t.unit}</div>
                              </div>
                            </div>
                          ))}
                          {filtThreads.length===0&&threadQ&&(
                            <div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px 20px',color:T.sandGray}}>
                              <div style={{fontSize:28,marginBottom:8}}>🧵</div>
                              <div style={{fontSize:14,marginBottom:4}}>No threads matching "{threadQ}"</div>
                              <div style={{fontSize:12,opacity:0.7}}>Try "green", "DMC", "teal", or a color number</div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {closetTab==='canvases'&&(
                      <div className="cvgrid">
                        {INIT_CANVASES.map(c=>(
                          <div key={c.id} className="cvcard">
                            <div className="cvthumb">
                              <svg width="100%" height="110" viewBox="0 0 200 110">
                                <rect width="200" height="110" fill={CV_COLORS[c.id%CV_COLORS.length]} opacity="0.18"/>
                                <text x="100" y="50" textAnchor="middle" fill={T.warmGray} fontSize="10" fontFamily="Lora,serif" fontStyle="italic">{c.designer}</text>
                                <text x="100" y="66" textAnchor="middle" fill={T.navy} fontSize="10" fontFamily="Inter,sans-serif">{c.mesh} mesh · {c.dims}</text>
                              </svg>
                            </div>
                            <div className="cvbody">
                              <div className="cvtitle">{c.title}</div>
                              <div className="cvdesigner">{c.designer}</div>
                              <div className="cvmeta">
                                <span>{c.mesh} mesh</span>
                                <span>{c.dims}</span>
                                <span style={{color:T.caramel,fontWeight:700}}>${c.price}</span>
                              </div>
                              {c.notes&&<div className="cvnotes">{c.notes}</div>}
                              <div className="cvstatus pill" style={{background:c.status==='wip'?T.paleGreen:T.parchment,color:c.status==='wip'?T.fern:T.warmGray}}>
                                {c.status==='wip'?'🪡 In Progress':'📦 In Stash'}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div style={{border:`2px dashed #D0C4B8`,borderRadius:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:180,cursor:'pointer',color:T.sandGray,gap:6,transition:'all 0.15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.honey;e.currentTarget.style.color=T.navy;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='#D0C4B8';e.currentTarget.style.color=T.sandGray;}}>
                          <span style={{fontSize:26}}>+</span>
                          <span style={{fontSize:12,fontWeight:600}}>Add Canvas</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {profTab==='wishlist'&&(
                  <div>
                    <div className="profname">Canvas Wishlist</div>
                    <p style={{fontSize:13,color:T.warmGray,marginBottom:16}}>Canvases you've saved from Designs — tap the heart on any canvas to add it here.</p>
                    {Object.keys(wishlisted).filter(k=>wishlisted[k]).length===0?(
                      <div style={{textAlign:'center',padding:'60px 20px',color:T.sandGray}}>
                        <div style={{fontSize:36,marginBottom:10}}>&#x2661;</div>
                        <div style={{fontSize:15,marginBottom:6,color:T.warmGray}}>Your wishlist is empty</div>
                        <div style={{fontSize:13,marginBottom:16,opacity:0.7}}>Browse Designs and tap &#x2661; to save canvases you love</div>
                        <button className="btn btn-p" onClick={()=>setTab('discover')}>Browse Canvases &#x2192;</button>
                      </div>
                    ):(
                      <>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                          <span style={{fontSize:13,color:T.warmGray}}>{Object.keys(wishlisted).filter(k=>wishlisted[k]).length} saved canvases</span>
                          <button className="btn btn-s" style={{fontSize:12,padding:'5px 12px'}} onClick={()=>setTab('discover')}>+ Browse More &#x2192;</button>
                        </div>
                        <div className="cvgrid">
                          {canvasData.map((c,i)=>wishlisted[i]&&(
                            <div key={i} className="cvcard">
                              <div className="cvthumb">
                                <svg width="100%" height="110" viewBox="0 0 200 110">
                                  <rect width="200" height="110" fill={CV_COLORS[i%CV_COLORS.length]} opacity="0.18"/>
                                  <rect x="20" y="20" width="160" height="70" rx="4" fill={CV_COLORS[i%CV_COLORS.length]} opacity="0.22"/>
                                  <text x="100" y="52" textAnchor="middle" fill={T.warmGray} fontSize="10" fontFamily="Lora,serif" fontStyle="italic">{c.d}</text>
                                  <text x="100" y="68" textAnchor="middle" fill={T.navy} fontSize="10" fontFamily="Inter,sans-serif">{c.m} mesh</text>
                                </svg>
                                <button onClick={()=>setWishlisted(w=>({...w,[i]:false}))}
                                  style={{position:'absolute',top:8,right:8,background:T.caramel,border:'none',borderRadius:'50%',width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13,color:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}>
                                  &#x2665;
                                </button>
                                <div style={{position:'absolute',bottom:8,left:8,background:c.st==='In Stock'?T.sage:T.caramel,color:'white',fontSize:9,padding:'2px 6px',borderRadius:6,fontWeight:700}}>{c.st}</div>
                              </div>
                              <div className="cvbody">
                                <div className="cvtitle">{c.t}</div>
                                <div className="cvdesigner">{c.d}</div>
                                <div className="cvmeta">
                                  <span>{c.m} mesh</span>
                                  <span>{c.lns}</span>
                                  <span style={{color:T.caramel,fontWeight:700}}>${c.p}</span>
                                </div>
                                <div style={{display:'flex',gap:6,marginTop:10}}>
                                  <button className="btn btn-p" style={{flex:1,fontSize:11,padding:'5px 10px'}}>View at Shop &#x2192;</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}


                {profTab==='stats'&&(()=>{
                  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  const monthlyFinished=[0,1,0,2,1,0,1,0,1,2,0,1];
                  const maxVal=Math.max(...monthlyFinished,1);
                  return (
                  <div>
                    <div className="profname">Stitching Stats</div>
                    {/* Top stat cards */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:14,marginBottom:28}}>
                      {[
                        {label:'Projects Finished',value:9,icon:'✅',sub:'all time'},
                        {label:'Finished This Year',value:4,icon:'🏆',sub:'2026'},
                        {label:'Currently In Progress',value:3,icon:'🪡',sub:'WIPs'},
                        {label:'Canvases Wishlisted',value:Object.values({2:true,5:true}).length,icon:'♥',sub:'saved'},
                        {label:'Stitch Guides Owned',value:2,icon:'📖',sub:'purchased'},
                        {label:'Years Stitching',value:6,icon:'🌟',sub:'since 2020'},
                      ].map((s,i)=>(
                        <div key={i} style={{background:T.cream,borderRadius:12,border:`1.5px solid #E8DDD0`,padding:'16px 18px',textAlign:'center'}}>
                          <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:600,color:T.navy,lineHeight:1}}>{s.value}</div>
                          <div style={{fontSize:12,fontWeight:600,color:T.warmGray,marginTop:4}}>{s.label}</div>
                          <div style={{fontSize:11,color:T.sandGray,marginTop:2}}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Monthly bar chart */}
                    <div style={{background:T.cream,borderRadius:12,border:`1.5px solid #E8DDD0`,padding:'20px 24px',marginBottom:20}}>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:T.navy,marginBottom:4}}>Projects Finished This Year</div>
                      <div style={{fontSize:12,color:T.sandGray,marginBottom:20}}>4 canvases completed in 2026</div>
                      <div style={{display:'flex',alignItems:'flex-end',gap:8,height:100}}>
                        {monthlyFinished.map((v,i)=>(
                          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                            <div style={{fontSize:10,color:v>0?T.navy:'transparent',fontWeight:600}}>{v||''}</div>
                            <div style={{
                              width:'100%',borderRadius:'4px 4px 0 0',
                              background:v>0?`linear-gradient(180deg,${T.honey},${T.caramel})`:'#E8DDD0',
                              height:v>0?`${(v/maxVal)*72}px`:'4px',
                              transition:'height 0.3s',minHeight:4
                            }}/>
                            <div style={{fontSize:9,color:T.sandGray,textTransform:'uppercase',letterSpacing:'0.04em'}}>{MONTHS[i].slice(0,1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent finishes timeline */}
                    <div style={{background:T.cream,borderRadius:12,border:`1.5px solid #E8DDD0`,padding:'20px 24px'}}>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:T.navy,marginBottom:16}}>Recent Finishes</div>
                      {[
                        {title:'Harvest Pumpkin Stocking',designer:'Melissa Shirley',finished:'Oct 2025',type:'Stocking',emoji:'🎃'},
                        {title:'White Hydrangea Pillow',designer:'Penny Linn',finished:'Aug 2025',type:'Pillow',emoji:'🌸'},
                        {title:'Labrador Portrait',designer:"Julia's Needlework",finished:'May 2025',type:'Framed',emoji:'🐾'},
                        {title:'BOO, Signed',designer:'2Busy Needlepointing',finished:'Feb 2026',type:'Ornament',emoji:'👻'},
                      ].map((p,i,arr)=>(
                        <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',paddingBottom:i<arr.length-1?16:0,marginBottom:i<arr.length-1?16:0,borderBottom:i<arr.length-1?`1px solid #E8DDD0`:'none'}}>
                          <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${T.parchment},${T.palePeach})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{p.emoji}</div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:500,color:T.navy}}>{p.title}</div>
                            <div style={{fontSize:12,color:T.caramel,marginBottom:2}}>{p.designer}</div>
                            <div style={{fontSize:11,color:T.sandGray}}>{p.type} &nbsp;·&nbsp; Finished {p.finished}</div>
                          </div>
                          <div style={{flexShrink:0}}>
                            <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:T.paleGreen,color:T.fern,fontWeight:700}}>✓ Done</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })()}

                {profTab==='alerts'&&(
                  <div>
                    <div className="profname">Drop Alerts</div>
                    <p style={{fontSize:13,color:T.warmGray,marginBottom:20}}>Manage notifications for new design drops, shop sales, and community events.</p>
                    <div style={{background:T.cream,borderRadius:10,border:`1.5px solid #E8DDD0`,overflow:'hidden'}}>
                      {[
                        {label:'New design drops from followed designers',on:true},
                        {label:'Trunk show announcements at your saved shops',on:true},
                        {label:'Finishing slot availability alerts',on:false},
                        {label:'Stitch club meetups near you',on:true},
                        {label:'Class openings at saved shops',on:false},
                      ].map((item,i)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',borderBottom:i<4?`1px solid #E8DDD0`:'none'}}>
                          <span style={{fontSize:14,color:T.softBlack}}>{item.label}</span>
                          <div style={{width:40,height:22,borderRadius:11,background:item.on?T.fern:'#D0C4B8',cursor:'pointer',position:'relative',flexShrink:0}}>
                            <div style={{width:16,height:16,borderRadius:'50%',background:'white',position:'absolute',top:3,left:item.on?20:4,transition:'left 0.15s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
