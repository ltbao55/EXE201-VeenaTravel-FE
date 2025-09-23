// Chat functionality
let currentTab = 'chat';
let chatMap;
let chatMarkers = [];

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat map on page load
    setTimeout(() => {
        initChatMap();
    }, 100);
});

// Tab switching functionality
function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide content based on tab
    const chatContent = document.querySelector('.chat-content');
    const mapContainer = document.querySelector('.map-container');

    if (tabName === 'chat') {
        // Show both chat and map
        chatContent.style.display = 'flex';
        mapContainer.style.display = 'block';
        // Initialize map if not already done or refresh size
        if (!chatMap) {
            setTimeout(() => {
                initChatMap();
            }, 200);
        } else {
            setTimeout(() => {
                chatMap.invalidateSize();
            }, 100);
        }
    } else if (tabName === 'map') {
        // Show only map (fullscreen)
        chatContent.style.display = 'none';
        mapContainer.style.display = 'block';
        // Initialize map if not already done or refresh size
        if (!chatMap) {
            setTimeout(() => {
                initChatMap();
            }, 200);
        } else {
            setTimeout(() => {
                chatMap.invalidateSize();
            }, 100);
        }
    } else {
        // For other tabs, show chat content with map
        chatContent.style.display = 'flex';
        mapContainer.style.display = 'block';
        // Initialize map if not already done or refresh size
        if (!chatMap) {
            setTimeout(() => {
                initChatMap();
            }, 200);
        } else {
            setTimeout(() => {
                chatMap.invalidateSize();
            }, 100);
        }
    }
}

// Initialize chat map
function initChatMap() {
    // Check if map already exists
    if (chatMap) {
        chatMap.remove();
        chatMap = null;
    }

    // Wait for container to be visible
    const mapContainer = document.getElementById('chat-map');
    if (!mapContainer || mapContainer.offsetWidth === 0) {
        setTimeout(() => initChatMap(), 100);
        return;
    }

    // Center on Ho Chi Minh City
    chatMap = L.map('chat-map').setView([10.7769, 106.6951], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(chatMap);

    // Force map to recalculate size
    setTimeout(() => {
        if (chatMap) {
            chatMap.invalidateSize();
        }
    }, 100);

    // Add sample markers for popular destinations
    addChatMapMarkers();
}

// Add markers to chat map
function addChatMapMarkers() {
    const destinations = [
        {
            name: "Nhà thờ Đức Bà Sài Gòn",
            lat: 10.7797,
            lng: 106.6990,
            description: "Công trình kiến trúc Gothic nổi tiếng"
        },
        {
            name: "Chợ Bến Thành",
            lat: 10.7720,
            lng: 106.6980,
            description: "Chợ truyền thống lâu đời nhất Sài Gòn"
        },
        {
            name: "Dinh Độc Lập",
            lat: 10.7770,
            lng: 106.6958,
            description: "Cung điện lịch sử quan trọng"
        },
        {
            name: "Bưu điện Trung tâm",
            lat: 10.7798,
            lng: 106.6991,
            description: "Kiến trúc Pháp cổ điển đẹp mắt"
        },
        {
            name: "Phố đi bộ Nguyễn Huệ",
            lat: 10.7743,
            lng: 106.7018,
            description: "Không gian văn hóa sôi động"
        },
        {
            name: "Bảo tàng Chứng tích Chiến tranh",
            lat: 10.7794,
            lng: 106.6918,
            description: "Bảo tàng lịch sử quan trọng"
        },
        {
            name: "Chùa Jade Emperor",
            lat: 10.7922,
            lng: 106.6958,
            description: "Ngôi chùa cổ kính linh thiêng"
        },
        {
            name: "Landmark 81",
            lat: 10.7953,
            lng: 106.7218,
            description: "Tòa nhà cao nhất Việt Nam"
        }
    ];
    
    destinations.forEach(dest => {
        const marker = L.marker([dest.lat, dest.lng])
            .addTo(chatMap)
            .bindPopup(`
                <div style="text-align: center; min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: #FF4D85; font-size: 16px;">${dest.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">${dest.description}</p>
                    <button onclick="addToItinerary('${dest.name}')" style="
                        margin-top: 10px;
                        background: linear-gradient(135deg, #FF4D85 0%, #FF6B9D 100%);
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 15px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Thêm vào lịch trình</button>
                </div>
            `);
        
        chatMarkers.push({
            marker: marker,
            name: dest.name,
            lat: dest.lat,
            lng: dest.lng
        });
    });
}

// Add destination to itinerary
function addToItinerary(placeName) {
    // Add message to chat showing the place was added
    const chatMessages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>Đã thêm <strong>${placeName}</strong> vào lịch trình của bạn! 📍</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Switch back to chat tab
    switchTab('chat');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up tab click handlers
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Initialize chat functionality
    initChatInterface();
});

// Chat interface functionality
function initChatInterface() {
    const sendBtn = document.querySelector('.send-btn');
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.querySelector('.chat-messages');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.querySelector('.chat-messages');
    const message = chatInput.value.trim();
    
    if (message) {
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
        chatMessages.appendChild(userMessageDiv);
        
        // Clear input
        chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            botMessageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Cảm ơn bạn đã nhắn tin! Tôi đang xử lý yêu cầu của bạn. Bạn có thể xem các địa điểm du lịch trên bản đồ bằng cách chuyển sang tab "Bản đồ".</p>
                </div>
            `;
            chatMessages.appendChild(botMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
