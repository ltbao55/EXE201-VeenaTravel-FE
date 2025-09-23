// Explore page functionality
let map;
let markers = [];

// Initialize the map
function initMap() {
    // Center on Ho Chi Minh City
    map = L.map('explore-map').setView([10.7769, 106.6951], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for all places
    addPlaceMarkers();
}

// Add markers for places
function addPlaceMarkers() {
    const places = document.querySelectorAll('.place-card');
    
    places.forEach((place, index) => {
        const lat = parseFloat(place.dataset.lat);
        const lng = parseFloat(place.dataset.lng);
        const title = place.querySelector('h3').textContent;
        const description = place.querySelector('p').textContent;
        
        if (lat && lng) {
            const marker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <div style="text-align: center;">
                        <h4 style="margin: 0 0 8px 0; color: #667eea;">${title}</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">${description}</p>
                    </div>
                `);
            
            markers.push({
                marker: marker,
                element: place,
                category: place.dataset.category
            });
            
            // Add click event to place card
            place.addEventListener('click', () => {
                map.setView([lat, lng], 16);
                marker.openPopup();
                
                // Highlight selected card
                places.forEach(p => p.classList.remove('selected'));
                place.classList.add('selected');
            });
        }
    });
}

// Filter functionality
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            filterPlaces(category);
        });
    });
}

// Filter places by category
function filterPlaces(category) {
    const places = document.querySelectorAll('.place-card');
    
    places.forEach(place => {
        if (category === 'all' || place.dataset.category === category) {
            place.style.display = 'block';
        } else {
            place.style.display = 'none';
        }
    });
    
    // Update map markers
    markers.forEach(item => {
        if (category === 'all' || item.category === category) {
            map.addLayer(item.marker);
        } else {
            map.removeLayer(item.marker);
        }
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const places = document.querySelectorAll('.place-card');
        
        places.forEach(place => {
            const title = place.querySelector('h3').textContent.toLowerCase();
            const description = place.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                place.style.display = 'block';
            } else {
                place.style.display = 'none';
            }
        });
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupFilters();
    setupSearch();
});

// Add CSS for selected place card
const style = document.createElement('style');
style.textContent = `
    .place-card.selected {
        background: rgba(255, 255, 255, 0.3) !important;
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(style);
