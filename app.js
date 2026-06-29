/* ==========================================================================
   THE PHOTO CHRONICLE - MAIN LOGIC (UPGRADED EDITORIAL SUITE)
   ========================================================================== */

// Base Editorial Stories with EXIF Camera settings
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

// Headlines to cycle in the ticker tape feed
const TICKER_HEADLINES = [
    "Ares VII successfully deployed first satellite array into orbit",
    "Arcadia eco-district reports zero fossil-fuel reliance for Q2",
    "Mariana Trench expedition catalogs four new bioluminescent species",
    "Wire Service: Independent photojournalists invited to submit field records",
    "Global Press Syndicate launches real-time digital print portal",
    "Urban planners approve Arcadia Phase 2 expansion for late 2026",
    "Oceanography Council recognizes Dr. Webb for deep-sea mapping contributions"
];

// Set of camera configurations to assign to user uploads
const USER_MOCK_EXIFS = [
    "Leica M11 • Summilux 35mm • f/1.4 • 1/250s • ISO 64",
    "Sony A7R V • FE 24-70mm GM II • f/2.8 • 1/800s • ISO 100",
    "Hasselblad X2D 100C • XCD 55mm f/2.5 • f/4.0 • 1/125s • ISO 64",
    "Fujifilm GFX100 II • GF 80mm f/1.7 • f/2.0 • 1/500s • ISO 200",
    "Canon EOS R3 • RF 50mm f/1.2 • f/1.2 • 1/2000s • ISO 100"
];

// App State
let stories = [];
let currentCategoryFilter = "all";
let currentSearchQuery = "";
let uploadedPhotosArray = [];

// DOM Elements
const galleryGrid = document.getElementById("news-gallery-grid");
const searchInput = document.getElementById("news-search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const filterTabs = document.querySelectorAll(".filter-tab");
const resultsMeta = document.getElementById("results-meta");
const resultsCountText = document.getElementById("results-count-text");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const tickerFeed = document.getElementById("ticker-feed");

// Header elements
const headerDate = document.getElementById("header-date");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

// Modals elements
const uploadModal = document.getElementById("upload-modal");
const openUploadBtn = document.getElementById("open-upload-btn");
const closeUploadBtn = document.getElementById("close-upload-btn");
const cancelUploadBtn = document.getElementById("cancel-upload-btn");
const uploadForm = document.getElementById("upload-form");
const charCounter = document.getElementById("char-counter");
const textareaDescription = document.getElementById("textarea-description");

// Drop Zone Elements
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const dropZonePrompt = document.getElementById("drop-zone-prompt");
const dropZonePreview = document.getElementById("drop-zone-preview");
const imagePreview = document.getElementById("image-preview");
const removePreviewBtn = document.getElementById("remove-preview-btn");

// Lightbox Elements
const lightboxModal = document.getElementById("lightbox-modal");
const closeLightboxBtn = document.getElementById("close-lightbox-btn");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCategory = document.getElementById("lightbox-category");
const lightboxDate = document.getElementById("lightbox-date");
const lightboxHeadline = document.getElementById("lightbox-headline");
const lightboxPhotographer = document.getElementById("lightbox-photographer");
const lightboxLocation = document.getElementById("lightbox-location");
const lightboxExif = document.getElementById("lightbox-exif");
const lightboxDescription = document.getElementById("lightbox-description");
const downloadPhotoBtn = document.getElementById("download-photo-btn");
const sharePhotoBtn = document.getElementById("share-photo-btn");
const deletePhotoBtn = document.getElementById("delete-photo-btn");

// Toast elements
const toast = document.getElementById("toast-notification");
const toastTitle = document.getElementById("toast-title");
const toastBody = document.getElementById("toast-body");
const toastIcon = document.getElementById("toast-icon");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    setHeaderDate();
    initTheme();
    loadStories();
    initTickerFeed();
    setupEventListeners();
    renderGallery();
});

// Set current date in editorial newspaper format
function setHeaderDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    headerDate.textContent = today.toLocaleDateString('en-US', options);
}

// Build ticker content with looped scrolling data
function initTickerFeed() {
    // Duplicate the news list so that it flows infinitely without gaps
    const doubleHeadlines = [...TICKER_HEADLINES, ...TICKER_HEADLINES];
    tickerFeed.innerHTML = doubleHeadlines.map(headline => `
        <span>${headline}</span>
    `).join("");
}

// ==========================================================================
// STATE MANAGEMENT & DATA PERSISTENCE
// ==========================================================================

function loadStories() {
    const localUploads = localStorage.getItem("photo_chronicle_uploads");
    const parsedUploads = localUploads ? JSON.parse(localUploads) : [];
    
    // Combine base files and community uploads
    // Uploaded stories go first (newest updates first)
    stories = [...parsedUploads, ...INITIAL_STORIES];
}

function saveUploadToStorage(newStory) {
    const localUploads = localStorage.getItem("photo_chronicle_uploads");
    const parsedUploads = localUploads ? JSON.parse(localUploads) : [];
    parsedUploads.unshift(newStory); // prepend to community uploads
    localStorage.setItem("photo_chronicle_uploads", JSON.stringify(parsedUploads));
}

function deleteStoryFromStorage(id) {
    const localUploads = localStorage.getItem("photo_chronicle_uploads");
    if (!localUploads) return;
    
    let parsedUploads = JSON.parse(localUploads);
    parsedUploads = parsedUploads.filter(story => story.id !== id);
    localStorage.setItem("photo_chronicle_uploads", JSON.stringify(parsedUploads));
    
    loadStories();
    renderGallery();
    showToast("Story Retracted", "The news card has been archived and removed from the press feed.", false);
}

// ==========================================================================
// GALLERY RENDER LOGIC
// ==========================================================================

function renderGallery() {
    // Clear grid
    galleryGrid.innerHTML = "";
    
    // Filter and Search Stories
    const filteredStories = stories.filter(story => {
        // Category Filter logic
        const matchesCategory = 
            currentCategoryFilter === "all" || 
            (currentCategoryFilter === "uploaded" && story.isUploaded) ||
            story.category === currentCategoryFilter;
            
        // Search Filter logic (Headline, journalist, location, category)
        const query = currentSearchQuery.toLowerCase().trim();
        const matchesSearch = 
            !query ||
            story.title.toLowerCase().includes(query) ||
            story.photographer.toLowerCase().includes(query) ||
            story.location.toLowerCase().includes(query) ||
            story.description.toLowerCase().includes(query) ||
            story.category.toLowerCase().includes(query);
            
        return matchesCategory && matchesSearch;
    });

    // Update Results Summary Bar
    updateResultsMeta(filteredStories.length);

    if (filteredStories.length === 0) {
        renderEmptyState();
        return;
    }

    // Render Cards
    filteredStories.forEach((story, index) => {
        const card = document.createElement("article");
        
        // Define hierarchy: index 0 (the latest/first card in list) is ALWAYS the Hero Card
        let cardHierarchyClass = "standard-card";
        let isHero = false;
        
        if (index === 0 && currentCategoryFilter === "all" && !currentSearchQuery) {
            cardHierarchyClass = "hero-card";
            isHero = true;
        } else if (index === 1 && currentCategoryFilter === "all" && !currentSearchQuery) {
            // Give the second item a sidebar class for newspaper grid aesthetic
            cardHierarchyClass = "sidebar-card";
        }
        
        card.className = `news-card ${cardHierarchyClass}`;
        card.setAttribute("data-id", story.id);
        
        // Format category name for readability
        const readableCategory = getReadableCategory(story.category);
        
        // Dynamic stamp markup for Hero Story
        const stampMarkup = isHero ? `<div class="stamp-sticker">Editor's Choice</div>` : '';
        
        card.innerHTML = `
            ${stampMarkup}
            <div class="card-img-wrapper">
                <span class="card-category-badge">${readableCategory}</span>
                <img src="${story.image}" alt="${story.title}" loading="lazy">
                <span class="exif-meta-tag"><i class="fa-solid fa-camera"></i> ${story.exif}</span>
            </div>
            <div class="card-meta-top">
                <span class="card-date">${story.date}</span>
                <span class="card-location"><i class="fa-solid fa-location-dot"></i> ${story.location}</span>
            </div>
            <h3 class="card-headline">${story.title}</h3>
            <p class="card-excerpt">${story.description}</p>
            <div class="card-meta-bottom">
                <div class="card-photographer">Reported by: <span>${story.photographer}</span></div>
                <div class="card-read-more">Read Story <i class="fa-solid fa-arrow-right"></i></div>
            </div>
        `;
        
        // Add click events to zoom-trigger areas
        const triggers = card.querySelectorAll(".card-img-wrapper, .card-headline, .card-read-more");
        triggers.forEach(el => {
            el.addEventListener("click", () => openLightbox(story));
        });
        
        galleryGrid.appendChild(card);
    });
}

function getReadableCategory(cat) {
    switch (cat) {
        case "space": return "Space Exploration";
        case "urbanism": return "Urbanism & Eco";
        case "science": return "Science";
        default: return cat;
    }
}

function renderEmptyState() {
    galleryGrid.innerHTML = `
        <div class="news-empty-state">
            <div class="empty-icon"><i class="fa-solid fa-newspaper"></i></div>
            <h3 class="empty-heading">No Stories Available</h3>
            <p class="empty-desc">We couldn't find any photojournalism records fitting your filter criteria or search queries.</p>
            <button id="empty-reset-btn" class="utility-btn btn-primary">Clear Filters & Search</button>
        </div>
    `;
    
    document.getElementById("empty-reset-btn").addEventListener("click", resetAllFilters);
}

function updateResultsMeta(count) {
    if (currentSearchQuery || currentCategoryFilter !== "all") {
        resultsMeta.classList.remove("hidden");
        let filterLabel = "";
        if (currentCategoryFilter !== "all") {
            filterLabel = ` in '${getReadableCategory(currentCategoryFilter)}'`;
        }
        
        if (currentSearchQuery) {
            resultsCountText.textContent = `Found ${count} ${count === 1 ? 'story' : 'stories'} matching "${currentSearchQuery}"${filterLabel}.`;
        } else {
            resultsCountText.textContent = `Showing ${count} ${count === 1 ? 'story' : 'stories'}${filterLabel}.`;
        }
    } else {
        resultsMeta.classList.add("hidden");
    }
}

function resetAllFilters() {
    currentCategoryFilter = "all";
    currentSearchQuery = "";
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    
    filterTabs.forEach(tab => {
        if (tab.getAttribute("data-category") === "all") {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    
    renderGallery();
}

// ==========================================================================
// DRAG AND DROP PHOTO UPLOAD ZONE
// ==========================================================================

function handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    const fileList = Array.from(files);
    
    // Process files sequentially
    fileList.forEach(file => {
        // Validate type
        if (!file.type.startsWith("image/")) {
            showToast("Invalid File Type", `File "${file.name}" is not a valid image.`, true);
            return;
        }
        
        // Validate size (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast("File Too Large", `File "${file.name}" exceeds the 5MB size limit.`, true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            // Avoid duplicates
            if (!uploadedPhotosArray.includes(base64)) {
                uploadedPhotosArray.push(base64);
                renderThumbnails();
            }
        };
        reader.readAsDataURL(file);
    });
}

function renderThumbnails() {
    const thumbnailsPreviewList = document.getElementById("thumbnails-preview-list");
    thumbnailsPreviewList.innerHTML = "";
    
    if (uploadedPhotosArray.length === 0) {
        clearPhotoSelection();
        return;
    }
    
    uploadedPhotosArray.forEach((photoBase64, index) => {
        const thumbWrapper = document.createElement("div");
        thumbWrapper.className = "preview-thumbnail-wrapper";
        
        thumbWrapper.innerHTML = `
            <img src="${photoBase64}" alt="Preview thumbnail">
            <button type="button" class="remove-single-thumb" data-index="${index}" aria-label="Remove photo">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        
        // Add click handler to delete a single thumbnail
        thumbWrapper.querySelector(".remove-single-thumb").onclick = (e) => {
            e.stopPropagation();
            removeSinglePhoto(index);
        };
        
        thumbnailsPreviewList.appendChild(thumbWrapper);
    });
    
    dropZonePrompt.classList.add("hidden");
    dropZonePreview.classList.remove("hidden");
    dropZone.style.borderStyle = "solid";
}

function removeSinglePhoto(index) {
    uploadedPhotosArray.splice(index, 1);
    renderThumbnails();
}

function clearPhotoSelection() {
    uploadedPhotosArray = [];
    fileInput.value = "";
    const thumbnailsPreviewList = document.getElementById("thumbnails-preview-list");
    if (thumbnailsPreviewList) thumbnailsPreviewList.innerHTML = "";
    dropZonePrompt.classList.remove("hidden");
    dropZonePreview.classList.add("hidden");
    dropZone.style.borderStyle = "dashed";
    dropZone.classList.remove("dragover");
}

// ==========================================================================
// LIGHTBOX DIALOG VIEWER
// ==========================================================================

function openLightbox(story) {
    // Populate items
    lightboxImg.src = story.image;
    lightboxImg.alt = story.title;
    lightboxCategory.textContent = getReadableCategory(story.category);
    lightboxDate.textContent = story.date;
    lightboxHeadline.textContent = story.title;
    lightboxPhotographer.textContent = story.photographer;
    lightboxLocation.textContent = story.location;
    lightboxExif.textContent = story.exif;
    lightboxDescription.textContent = story.description;
    
    // Download link setting
    downloadPhotoBtn.href = story.image;
    downloadPhotoBtn.setAttribute("download", `Chronicle_${story.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`);
    
    // Show/hide delete button depending on if user uploaded it
    if (story.isUploaded) {
        deletePhotoBtn.classList.remove("hidden");
        deletePhotoBtn.onclick = () => {
            const enteredPassword = prompt("Please enter the Retraction Password to delete this story:");
            if (enteredPassword === null) return; // user clicked Cancel
            
            // Allow delete if matches OR if uploader has no password set (legacy protection)
            if (!story.deletePassword) {
                if (confirm("No retraction password is set for this archive record. Proceed to delete permanently?")) {
                    closeLightbox();
                    deleteStoryFromStorage(story.id);
                }
            } else if (enteredPassword === story.deletePassword) {
                closeLightbox();
                deleteStoryFromStorage(story.id);
            } else {
                showToast("Access Denied", "Incorrect retraction password. Story retraction rejected.", true);
            }
        };
    } else {
        deletePhotoBtn.classList.add("hidden");
    }

    // Share button mapping
    sharePhotoBtn.onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: story.title,
                text: `Read this news photostory on The Photo Chronicle: "${story.title}"`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: Copy dummy share link to clipboard
            const dummyLink = `${window.location.origin}/story/${story.id}`;
            navigator.clipboard.writeText(dummyLink).then(() => {
                showToast("Link Copied", "A news clipping link was copied to your clipboard.", false);
            }).catch(() => {
                showToast("Error", "Could not copy link to clipboard.", true);
            });
        }
    };
    
    // Open lightbox
    lightboxModal.classList.add("active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // disable body scrolling
}

function closeLightbox() {
    lightboxModal.classList.remove("active");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // restore scrolling
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================

let toastTimeout;
function showToast(title, message, isError = false) {
    // Reset timeout if already running
    clearTimeout(toastTimeout);
    
    toastTitle.textContent = title;
    toastBody.textContent = message;
    
    if (isError) {
        toast.querySelector(".toast-card").style.borderLeftColor = "#ef4444";
        toastIcon.className = "fa-solid fa-triangle-exclamation";
        toastIcon.parentElement.style.color = "#ef4444";
        toastIcon.parentElement.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
    } else {
        toast.querySelector(".toast-card").style.borderLeftColor = "var(--accent)";
        toastIcon.className = "fa-solid fa-check";
        toastIcon.parentElement.style.color = "var(--accent)";
        toastIcon.parentElement.style.backgroundColor = "var(--accent-light)";
    }
    
    toast.classList.remove("hidden");
    
    // Hide toast after 4 seconds
    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}

// ==========================================================================
// THEME SWITCHER
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem("photo_chronicle_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("photo_chronicle_theme", newTheme);
    updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
    const icon = themeToggleBtn.querySelector("i");
    const text = themeToggleBtn.querySelector(".btn-text");
    
    if (theme === "dark") {
        icon.className = "fa-solid fa-sun";
        text.textContent = "Light Mode";
    } else {
        icon.className = "fa-solid fa-moon";
        text.textContent = "Dark Mode";
    }
}

// ==========================================================================
// FORM SUBMISSION (PUBLISH FLOW)
// ==========================================================================

function openUploadModal() {
    uploadModal.classList.add("active");
    uploadModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeUploadModal() {
    uploadModal.classList.remove("active");
    uploadModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    uploadForm.reset();
    clearPhotoSelection();
    charCounter.textContent = "0";
}

function getRandomExif() {
    const randomIndex = Math.floor(Math.random() * USER_MOCK_EXIFS.length);
    return USER_MOCK_EXIFS[randomIndex];
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (uploadedPhotosArray.length === 0) {
        showToast("Photo Missing", "Please select or drop at least one image for your news article.", true);
        return;
    }
    
    const headline = document.getElementById("input-headline").value.trim();
    const photographer = document.getElementById("input-photographer").value.trim();
    const category = document.getElementById("select-category").value;
    const location = document.getElementById("input-location").value.trim();
    const password = document.getElementById("input-password").value;
    const description = textareaDescription.value.trim();
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Loop through all uploaded photos and create a separate news card for each
    uploadedPhotosArray.forEach((photoBase64, idx) => {
        const titleSuffix = uploadedPhotosArray.length > 1 ? ` - Frame ${idx + 1}` : '';
        const storyId = `story-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
        
        const newStory = {
            id: storyId,
            title: `${headline}${titleSuffix}`,
            category: category,
            image: photoBase64,
            date: formattedDate,
            photographer: photographer,
            location: location,
            exif: getRandomExif(),
            description: description,
            deletePassword: password,
            isUploaded: true
        };
        
        saveUploadToStorage(newStory);
    });
    
    // Reload state
    loadStories();
    
    // Re-render gallery
    renderGallery();
    
    // Close modal & Notify
    closeUploadModal();
    
    const msg = uploadedPhotosArray.length > 1 
        ? `${uploadedPhotosArray.length} headlines published successfully to the newspaper feed.` 
        : `"${headline}" has been published to the newspaper feed.`;
    showToast("Press Published", msg, false);
}

// ==========================================================================
// EVENT LISTENERS MANAGEMENT
// ==========================================================================

function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener("click", toggleTheme);
    
    // Upload Modal Toggle
    openUploadBtn.addEventListener("click", openUploadModal);
    closeUploadBtn.addEventListener("click", closeUploadModal);
    cancelUploadBtn.addEventListener("click", closeUploadModal);
    
    // Lightbox modal close triggers
    closeLightboxBtn.addEventListener("click", closeLightbox);
    
    // Close modals on clicking background backdrop
    window.addEventListener("click", (e) => {
        if (e.target === uploadModal) closeUploadModal();
        if (e.target === lightboxModal) closeLightbox();
    });

    // Close modals on Escape keypress
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeUploadModal();
            closeLightbox();
        }
    });
    
    // Category Tabs Filter click
    filterTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            // Set active class
            filterTabs.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            
            // Set state filter and re-render
            currentCategoryFilter = e.target.getAttribute("data-category");
            renderGallery();
        });
    });
    
    // Search inputs change
    searchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value;
        if (currentSearchQuery.length > 0) {
            clearSearchBtn.style.display = "flex";
        } else {
            clearSearchBtn.style.display = "none";
        }
        renderGallery();
    });
    
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        currentSearchQuery = "";
        clearSearchBtn.style.display = "none";
        renderGallery();
    });
    
    resetFiltersBtn.addEventListener("click", resetAllFilters);
    
    // Form textarea description length character counter
    textareaDescription.addEventListener("input", (e) => {
        charCounter.textContent = e.target.value.length;
    });
    
    // Form Submission
    uploadForm.addEventListener("submit", handleFormSubmit);
    
    // --- File Drag & Drop triggers ---
    // Trigger file selection on click
    dropZone.addEventListener("click", (e) => {
        // Prevent trigger if clicking on remove button
        if (e.target.closest("#remove-preview-btn")) return;
        fileInput.click();
    });
    
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files);
        }
    });
    
    removePreviewBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent triggering fileInput click
        clearPhotoSelection();
    });
    
    // Drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelection(files);
        }
    }, false);
}
