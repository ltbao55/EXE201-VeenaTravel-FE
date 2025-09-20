// VeenaTravel - Simple UI interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // Modal functionality
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const closeBtn = document.querySelector('.close');
    const registerBtn = document.querySelector('.btn-register');

    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function switchToLogin() {
        if (loginForm && registerForm) {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        }
    }

    function switchToRegister() {
        if (loginForm && registerForm) {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    // Make functions global for HTML onclick
    window.switchToLogin = switchToLogin;
    window.switchToRegister = switchToRegister;

    // Register button click
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
            switchToRegister();
        });
    }

    // Close modal events
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Form submissions (just UI feedback)
    document.querySelectorAll('.auth-form form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const isLogin = form.closest('#loginForm') !== null;
            alert(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
            closeModal();
            form.reset();
        });
    });

    // Other button handlers
    document.querySelectorAll('.btn-google').forEach(function(btn) {
        btn.addEventListener('click', function() {
            alert('Tính năng đăng nhập Google sẽ được triển khai sớm!');
        });
    });

    document.querySelectorAll('.btn-book').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Tính năng đặt tour sẽ được triển khai sớm!');
        });
    });

    const premiumBtn = document.querySelector('.btn-premium');
    if (premiumBtn) {
        premiumBtn.addEventListener('click', function() {
            alert('Tính năng đăng ký Premium sẽ được triển khai sớm!');
        });
    }

    console.log('VeenaTravel website loaded successfully!');
});

// Page Navigation Functions
function showChatPage() {
    document.getElementById('chatPage').style.display = 'block';
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.services').style.display = 'none';
    document.querySelector('.discovery-section').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';

    // Initialize map when entering chat page
    setTimeout(() => {
        if (typeof switchTab === 'function') {
            switchTab('chat');
        }
    }, 100);
}

function showHomePage() {
    document.getElementById('chatPage').style.display = 'none';
    document.querySelector('.header').style.display = 'block';
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.services').style.display = 'block';
    document.querySelector('.discovery-section').style.display = 'block';
    document.querySelector('.footer').style.display = 'block';
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        // Add user message to chat
        addUserMessage(message);
        input.value = '';

        // Simulate bot response
        setTimeout(() => {
            addBotMessage("Cảm ơn bạn đã gửi tin nhắn! Tôi đang xử lý yêu cầu của bạn...");
        }, 1000);
    }
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#2D3748"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FF4D85"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
