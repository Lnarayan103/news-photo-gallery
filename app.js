/* ==========================================================================
   THE PHOTO CHRONICLE - MAIN LOGIC (UPGRADED EDITORIAL SUITE WITH BACKEND)
   ========================================================================== */

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
    loadStories(); // Async fetch and render
    initTickerFeed();
    setupEventListeners();
});

// Set current date in editorial newspaper format
function setHeaderDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    headerDate.textContent = today.toLocaleDateString('en-US', options);
}

// Build ticker content with looped scrolling data
function initTickerFeed() {
    const doubleHeadlines = [...TICKER_HEADLINES, ...TICKER_HEADLINES];
    tickerFeed.innerHTML = doubleHeadlines.map(headline => `
        <span>${headline}</span>
    `).join("");
}

// ==========================================================================
// BACKEND API CLIENT
// ==========================================================================

async function loadStories() {
    try {
        const response = await fetch('/api/stories');
        if (!response.ok) throw new Error("HTTP error " + response.status);
        stories = await response.json();
        renderGallery();
    } catch (err) {
        console.error("Failed to load stories from server:", err);
        showToast("Press Feed Offline", "Could not fetch the latest news from the server.", true);
    }
}

async function deleteStoryFromServer(id, password) {
    try {
        const response = await fetch('/api/stories/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            await loadStories();
            showToast("Story Retracted", "The news card has been archived and removed from the press feed.", false);
        } else {
            throw new Error(result.error || "Retraction rejected");
        }
    } catch (err) {
        console.error("Retraction error:", err);
        showToast("Retraction Failed", err.message, true);
    }
}

// ==========================================================================
// GALLERY RENDER LOGIC
// ==========================================================================

function renderGallery() {
    // Clear grid
    galleryGrid.innerHTML = "";
    
    // Filter and Search Stories
    const filteredStories = stories.filter(story => {
        const matchesCategory = 
            currentCategoryFilter === "all" || 
            (currentCategoryFilter === "uploaded" && story.isUploaded) ||
            story.category === currentCategoryFilter;
            
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

    updateResultsMeta(filteredStories.length);

    if (filteredStories.length === 0) {
        renderEmptyState();
        return;
    }

    // Render Cards
    filteredStories.forEach((story, index) => {
        const card = document.createElement("article");
        
        let cardHierarchyClass = "standard-card";
        let isHero = false;
        
        if (index === 0 && currentCategoryFilter === "all" && !currentSearchQuery) {
            cardHierarchyClass = "hero-card";
            isHero = true;
        } else if (index === 1 && currentCategoryFilter === "all" && !currentSearchQuery) {
            cardHierarchyClass = "sidebar-card";
        }
        
        card.className = `news-card ${cardHierarchyClass}`;
        card.setAttribute("data-id", story.id);
        
        const readableCategory = getReadableCategory(story.category);
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
    
    fileList.forEach(file => {
        if (!file.type.startsWith("image/")) {
            showToast("Invalid File Type", `File "${file.name}" is not a valid image.`, true);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showToast("File Too Large", `File "${file.name}" exceeds the 5MB size limit.`, true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
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
    lightboxImg.src = story.image;
    lightboxImg.alt = story.title;
    lightboxCategory.textContent = getReadableCategory(story.category);
    lightboxDate.textContent = story.date;
    lightboxHeadline.textContent = story.title;
    lightboxPhotographer.textContent = story.photographer;
    lightboxLocation.textContent = story.location;
    lightboxExif.textContent = story.exif;
    lightboxDescription.textContent = story.description;
    
    downloadPhotoBtn.href = story.image;
    downloadPhotoBtn.setAttribute("download", `Chronicle_${story.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`);
    
    if (story.isUploaded) {
        deletePhotoBtn.classList.remove("hidden");
        deletePhotoBtn.onclick = () => {
            const enteredPassword = prompt("Please enter the Retraction Password to delete this story:");
            if (enteredPassword === null) return;
            
            if (!story.deletePassword) {
                if (confirm("No retraction password is set for this archive record. Proceed to delete permanently?")) {
                    closeLightbox();
                    deleteStoryFromServer(story.id, "");
                }
            } else {
                closeLightbox();
                deleteStoryFromServer(story.id, enteredPassword);
            }
        };
    } else {
        deletePhotoBtn.classList.add("hidden");
    }

    sharePhotoBtn.onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: story.title,
                text: `Read this news photostory on The Photo Chronicle: "${story.title}"`,
                url: window.location.href
            }).catch(console.error);
        } else {
            const dummyLink = `${window.location.origin}/story/${story.id}`;
            navigator.clipboard.writeText(dummyLink).then(() => {
                showToast("Link Copied", "A news clipping link was copied to your clipboard.", false);
            }).catch(() => {
                showToast("Error", "Could not copy link to clipboard.", true);
            });
        }
    };
    
    lightboxModal.classList.add("active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightboxModal.classList.remove("active");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================

let toastTimeout;
function showToast(title, message, isError = false) {
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
// FORM SUBMISSION (PUBLISH FLOW TO BACKEND)
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

async function handleFormSubmit(e) {
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
    
    const submitBtn = document.getElementById("submit-btn");
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Publishing...`;
    
    try {
        const response = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                headline,
                photographer,
                category,
                location,
                password,
                description,
                photos: uploadedPhotosArray
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            await loadStories(); // Refresh stories list
            closeUploadModal();
            
            const msg = uploadedPhotosArray.length > 1 
                ? `${uploadedPhotosArray.length} headlines published successfully to the global feed.` 
                : `"${headline}" has been published to the global feed.`;
            showToast("Press Published", msg, false);
        } else {
            throw new Error(result.error || "Failed to publish");
        }
    } catch (err) {
        console.error("Publish error:", err);
        showToast("Publish Failed", err.message, true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    }
}

// ==========================================================================
// EVENT LISTENERS MANAGEMENT
// ==========================================================================

function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);
    
    openUploadBtn.addEventListener("click", openUploadModal);
    closeUploadBtn.addEventListener("click", closeUploadModal);
    cancelUploadBtn.addEventListener("click", closeUploadModal);
    
    closeLightboxBtn.addEventListener("click", closeLightbox);
    
    window.addEventListener("click", (e) => {
        if (e.target === uploadModal) closeUploadModal();
        if (e.target === lightboxModal) closeLightbox();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeUploadModal();
            closeLightbox();
        }
    });
    
    filterTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            filterTabs.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            
            currentCategoryFilter = e.target.getAttribute("data-category");
            renderGallery();
        });
    });
    
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
    
    textareaDescription.addEventListener("input", (e) => {
        charCounter.textContent = e.target.value.length;
    });
    
    uploadForm.addEventListener("submit", handleFormSubmit);
    
    dropZone.addEventListener("click", (e) => {
        if (e.target.closest("#remove-preview-btn") || e.target.closest(".remove-single-thumb")) return;
        fileInput.click();
    });
    
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files);
        }
    });
    
    removePreviewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearPhotoSelection();
    });
    
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
