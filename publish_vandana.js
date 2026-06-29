const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '/storage/emulated/0/Download/vandana';
const DB_FILE = path.join(__dirname, 'db.json');

// Mock Exifs to randomize
const MOCK_EXIFS = [
    "Leica M11 • Summilux 35mm • f/2.0 • 1/250s • ISO 64",
    "Sony A7R V • FE 24-70mm GM II • f/2.8 • 1/400s • ISO 100",
    "Hasselblad X2D • XCD 38mm f/2.5 • f/4.0 • 1/160s • ISO 64",
    "Fujifilm GFX100 II • GF 80mm f/1.7 • f/2.8 • 1/500s • ISO 200"
];

function publishVandanaPhotos() {
    console.log("Reading source folder:", SOURCE_DIR);
    
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error("Source directory does not exist!");
        return;
    }
    
    const files = fs.readdirSync(SOURCE_DIR).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    });
    
    console.log(`Found ${files.length} images to publish.`);
    
    if (files.length === 0) return;
    
    // Load existing database stories
    let dbStories = [];
    if (fs.existsSync(DB_FILE)) {
        try {
            dbStories = JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
        } catch (e) {
            console.error("Error parsing db.json, starting fresh.");
        }
    }
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let successCount = 0;
    
    // Reverse files so they sort in order of appearance
    files.forEach((file, idx) => {
        try {
            const filePath = path.join(SOURCE_DIR, file);
            const fileData = fs.readFileSync(filePath);
            const base64Image = `data:image/jpeg;base64,${fileData.toString('base64')}`;
            
            const randomExif = MOCK_EXIFS[Math.floor(Math.random() * MOCK_EXIFS.length)];
            const indexNumber = idx + 1;
            
            const storyId = `story-vandana-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
            const storyTitle = `Vandana Archive: Documenting Frame #${indexNumber}`;
            
            const newStory = {
                id: storyId,
                title: storyTitle,
                category: "urbanism", // assign to urbanism category
                image: base64Image,
                date: formattedDate,
                photographer: "Vandana",
                location: "Vandana Studio",
                exif: randomExif,
                description: `A documentary record cataloged as part of the public Vandana portfolio collection. Photo ID: ${file}. Certified Press Release.`,
                deletePassword: "Vandana123",
                isUploaded: true
            };
            
            dbStories.unshift(newStory); // prepend to DB
            successCount++;
        } catch (err) {
            console.error(`Failed to process file ${file}:`, err.message);
        }
    });
    
    // Write back to db.json
    fs.writeFileSync(DB_FILE, JSON.stringify(dbStories, null, 2));
    console.log(`Successfully published ${successCount} photos to db.json!`);
}

publishVandanaPhotos();
