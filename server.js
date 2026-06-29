const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Path to store uploaded stories
const DB_FILE = path.join(__dirname, 'db.json');

// Base Editorial Stories
const INITIAL_STORIES = [
    {
        id: "story-space-launch",
        title: "Deep Space Exploration: Ares VII Mission Launches Into the Dusk",
        category: "space",
        image: "assets/images/space_launch.jpg",
        date: "June 29, 2026",
        photographer: "Marcus Vance",
        location: "Cape Canaveral, USA",
        exif: "Leica M11 • Summilux 35mm • f/1.4 • 1/250s • ISO 64",
        description: "In a historic display of aerospace engineering, the Ares VII rocket successfully lifted off from Pad 39B at Cape Canaveral at 19:42 UTC. The mission aims to deploy a network of deep-space communications satellites that will form the backbone of future crewed Martian voyages. Over 10,000 spectators gathered along the coast to witness the dramatic ascent as the launch vehicle pierced the twilight sky."
    },
    {
        id: "story-smart-city",
        title: "The Green Renaissance: Arcadia District Redefines Sustainable Urbanism",
        category: "urbanism",
        image: "assets/images/smart_city.jpg",
        date: "June 28, 2026",
        photographer: "Elena Rostova",
        location: "Arcadia Metro",
        exif: "Sony A7R V • FE 24-70mm GM II • f/5.6 • 1/160s • ISO 100",
        description: "Spanning over 200 hectares of high-density mixed-use development, the newly completed Arcadia District has officially achieved net-zero carbon operations. Integrating vertical forests, integrated wind-microturbines, and an autonomous magnetic transit network, the district demonstrates a revolutionary model of modern coexistence between nature and human density. Municipal planners predict a 40% reduction in heating costs and zero reliance on fossil fuels."
    },
    {
        id: "story-deep-sea",
        title: "Bioluminescent Marvels: New Species Discovered in the Mariana Trench",
        category: "science",
        image: "assets/images/deep_sea_discovery.jpg",
        date: "June 25, 2026",
        photographer: "Dr. Alistair Webb",
        location: "Mariana Trench, Pacific",
        exif: "Hasselblad X2D • XCD 38mm f/2.5 • f/2.8 • 1/60s • ISO 800",
        description: "Operating at a depth of 6,400 meters, the ROV Hercules captured high-definition footage of an undocumented genus of Bathykorus jellyfish. Exhibiting a spectacular magenta-blue bioluminescence, the organism uses complex light patterns to communicate or attract prey in the eternal darkness of the abyssal zone. The discovery is expected to provide key insights into deep-sea evolutionary biology and chemical adaptations."
    }
];

// Configure Express to handle large Base64 payloads (multiple high-res uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper to read database file
function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error("Database read error, resetting:", err);
        return [];
    }
}

// Helper to write database file
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Database write error:", err);
    }
}

// Serve static assets & frontend files
app.use(express.static(__dirname));

// API: Get all stories (initial + user uploaded)
app.get('/api/stories', (req, res) => {
    const dbStories = readDatabase();
    // Return database stories (newest first) merged with initial stories
    res.json([...dbStories, ...INITIAL_STORIES]);
});

// API: Upload multiple stories
app.post('/api/stories', (req, res) => {
    const { headline, photographer, category, location, password, description, photos } = req.body;
    
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({ error: "Missing photos" });
    }
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const dbStories = readDatabase();
    
    // Choose Exif setups randomly
    const USER_MOCK_EXIFS = [
        "Leica M11 • Summilux 35mm • f/1.4 • 1/250s • ISO 64",
        "Sony A7R V • FE 24-70mm GM II • f/2.8 • 1/800s • ISO 100",
        "Hasselblad X2D 100C • XCD 55mm f/2.5 • f/4.0 • 1/125s • ISO 64",
        "Fujifilm GFX100 II • GF 80mm f/1.7 • f/2.0 • 1/500s • ISO 200",
        "Canon EOS R3 • RF 50mm f/1.2 • f/1.2 • 1/2000s • ISO 100"
    ];
    
    const newCreatedStories = [];
    
    photos.forEach((photoBase64, idx) => {
        const titleSuffix = photos.length > 1 ? ` - Frame ${idx + 1}` : '';
        const storyId = `story-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
        const randomExif = USER_MOCK_EXIFS[Math.floor(Math.random() * USER_MOCK_EXIFS.length)];
        
        const newStory = {
            id: storyId,
            title: `${headline}${titleSuffix}`,
            category: category,
            image: photoBase64,
            date: formattedDate,
            photographer: photographer,
            location: location,
            exif: randomExif,
            description: description,
            deletePassword: password,
            isUploaded: true
        };
        
        dbStories.unshift(newStory); // prepend to DB
        newCreatedStories.push(newStory);
    });
    
    writeDatabase(dbStories);
    res.status(201).json({ success: true, count: newCreatedStories.length });
});

// API: Retract/Delete story with password validation
app.post('/api/stories/delete', (req, res) => {
    const { id, password } = req.body;
    
    if (!id) {
        return res.status(400).json({ error: "Missing story ID" });
    }
    
    let dbStories = readDatabase();
    const storyToDelete = dbStories.find(s => s.id === id);
    
    if (!storyToDelete) {
        return res.status(404).json({ error: "Story not found in database" });
    }
    
    // Check password
    if (storyToDelete.deletePassword && storyToDelete.deletePassword !== password) {
        return res.status(403).json({ error: "Incorrect retraction password" });
    }
    
    // Filter out the story
    dbStories = dbStories.filter(s => s.id !== id);
    writeDatabase(dbStories);
    
    res.json({ success: true });
});

// Redirect all unhandled page requests to index.html (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`The Photo Chronicle Server running on port ${PORT}`);
});
