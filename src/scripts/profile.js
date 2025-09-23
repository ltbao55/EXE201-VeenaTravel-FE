// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const profileSections = document.querySelectorAll('.profile-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all sidebar items
            sidebarItems.forEach(sidebarItem => {
                sidebarItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            profileSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const targetSection = document.getElementById(sectionId + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Form handling
    const saveBtn = document.querySelector('.btn-save');
    const cancelBtn = document.querySelector('.btn-cancel');
    const formInputs = document.querySelectorAll('.profile-form input, .profile-form textarea');

    // Save form data
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const formData = {};
            
            formInputs.forEach(input => {
                formData[input.id] = input.value;
            });
            
            // Save to localStorage (in a real app, this would be sent to a server)
            localStorage.setItem('profileData', JSON.stringify(formData));
            
            // Show success message
            showNotification('Thông tin đã được lưu thành công!', 'success');
        });
    }

    // Cancel form changes
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            loadProfileData();
            showNotification('Đã hủy các thay đổi', 'info');
        });
    }

    // Load saved profile data
    function loadProfileData() {
        const savedData = localStorage.getItem('profileData');
        if (savedData) {
            const profileData = JSON.parse(savedData);
            
            formInputs.forEach(input => {
                if (profileData[input.id]) {
                    input.value = profileData[input.id];
                }
            });
        }
    }

    // Initialize with saved data
    loadProfileData();

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 15px 20px;
            color: white;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            min-width: 300px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Handle other buttons
    const changePasswordBtn = document.querySelector('.btn-secondary');
    const deleteAccountBtn = document.querySelector('.btn-danger');

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            showNotification('Chức năng đổi mật khẩu sẽ được triển khai sớm', 'info');
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
                showNotification('Chức năng xóa tài khoản sẽ được triển khai sớm', 'warning');
            }
        });
    }

    // Handle preference checkboxes
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const preferences = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.parentNode.textContent.trim());
            
            localStorage.setItem('travelPreferences', JSON.stringify(preferences));
        });
    });

    // Load saved preferences
    const savedPreferences = localStorage.getItem('travelPreferences');
    if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentNode.textContent.trim();
            if (preferences.includes(label)) {
                checkbox.checked = true;
            }
        });
    }

    // Handle notification toggles
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const notificationSettings = {};
            toggles.forEach(t => {
                const settingName = t.closest('.notification-item').querySelector('h3').textContent;
                notificationSettings[settingName] = t.checked;
            });
            
            localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
            showNotification('Cài đặt thông báo đã được cập nhật', 'success');
        });
    });

    // Load saved notification settings
    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    if (savedNotificationSettings) {
        const settings = JSON.parse(savedNotificationSettings);
        toggles.forEach(toggle => {
            const settingName = toggle.closest('.notification-item').querySelector('h3').textContent;
            if (settings.hasOwnProperty(settingName)) {
                toggle.checked = settings[settingName];
            }
        });
    }

    // Handle budget preference
    const budgetSelect = document.querySelector('.form-select');
    if (budgetSelect) {
        budgetSelect.addEventListener('change', function() {
            localStorage.setItem('budgetPreference', this.value);
            showNotification('Sở thích ngân sách đã được cập nhật', 'success');
        });

        // Load saved budget preference
        const savedBudget = localStorage.getItem('budgetPreference');
        if (savedBudget) {
            budgetSelect.value = savedBudget;
        }
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
