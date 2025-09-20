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
