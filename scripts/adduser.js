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