function validateForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Username and password are required');
        return false;
    }
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return false;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return false;
    }

    const permissions = [
        'delete_vehicle', 'edit_vehicle', 'add_vehicle',
        'delete_equipment', 'edit_equipment', 'add_equipment'
    ];
    
    const hasPermission = permissions.some(p => document.getElementById(p).checked);
    
    if (!hasPermission) {
        alert('At least one permission must be selected');
        return false;
    }
    
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

function openLogoutModal() {
    const logoutModal = document.getElementById('logoutModal')
    const logoutModalcontent = document.getElementById('logoutModalcontent')
    
    logoutModal.classList.add("active");
    logoutModalcontent.classList.remove("hide");
}

function closeLogoutModal() {
    const logoutModal = document.getElementById('logoutModal')
    const logoutModalcontent = document.getElementById('logoutModalcontent')

    logoutModalcontent.classList.add("hide")
    logoutModalcontent.addEventListener('animationend', () => {
        logoutModal.classList.remove("active")
    },{once: true})
}           

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');

    mobileMenuButton.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});