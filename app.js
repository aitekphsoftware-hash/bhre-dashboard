// Global state
let isAuthenticated = false;
let currentUser = null;
let tokens = 0;
let isSidebarCollapsed = false;
let avatars = [];
let isDarkMode = true;

// Mock avatar data
const mockAvatars = [
    {
        id: "avatar_1",
        name: "Sarah",
        gender: "female",
        streamable: true,
        preview: "https://clips-presenters.d-id.com/v2/sarah/preview.mp4",
        talking_preview: "https://clips-presenters.d-id.com/v2/sarah/talking.mp4",
        thumb: "https://clips-presenters.d-id.com/v2/sarah/thumb.png",
        image: "https://clips-presenters.d-id.com/v2/sarah/image.png"
    },
    {
        id: "avatar_2",
        name: "Mike",
        gender: "male",
        streamable: true,
        preview: "https://clips-presenters.d-id.com/v2/mike/preview.mp4",
        talking_preview: "https://clips-presenters.d-id.com/v2/mike/talking.mp4",
        thumb: "https://clips-presenters.d-id.com/v2/mike/thumb.png",
        image: "https://clips-presenters.d-id.com/v2/mike/image.png"
    },
    {
        id: "avatar_3",
        name: "Alex",
        gender: "other",
        streamable: false,
        preview: "https://clips-presenters.d-id.com/v2/alex/preview.mp4",
        talking_preview: "https://clips-presenters.d-id.com/v2/alex/talking.mp4",
        thumb: "https://clips-presenters.d-id.com/v2/alex/thumb.png",
        image: "https://clips-presenters.d-id.com/v2/alex/image.png"
    },
    {
        id: "avatar_4",
        name: "Emma",
        gender: "female",
        streamable: true,
        preview: "https://clips-presenters.d-id.com/v2/emma/preview.mp4",
        talking_preview: "https://clips-presenters.d-id.com/v2/emma/talking.mp4",
        thumb: "https://clips-presenters.d-id.com/v2/emma/thumb.png",
        image: "https://clips-presenters.d-id.com/v2/emma/image.png"
    },
    {
        id: "avatar_5",
        name: "James",
        gender: "male",
        streamable: true,
        preview: "https://clips-presenters.d-id.com/v2/james/preview.mp4",
        talking_preview: "https://clips-presenters.d-id.com/v2/james/talking.mp4",
        thumb: "https://clips-presenters.d-id.com/v2/james/thumb.png",
        image: "https://clips-presenters.d-id.com/v2/james/image.png"
    },
    {
        id: "avatar_6",
        name: "Riley",
        gender: "other",
        streamable: false,
        preview: "https://clips-presenters.d-id.com/v2/riley/preview.mp4",
        talking_preview: "https://clips-presenters.d-id.com/v2/riley/talking.mp4",
        thumb: "https://clips-presenters.d-id.com/v2/riley/thumb.png",
        image: "https://clips-presenters.d-id.com/v2/riley/image.png"
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeLucide();
    initializeSidebar();
    initializeAuth();
    initializeFilters();
    initializeTheme();
    loadAvatars();
    
    // Load saved sidebar state
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed === 'true') {
        toggleSidebar();
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        toggleTheme();
    }
});

function initializeLucide() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    logoutBtn.addEventListener('click', handleLogout);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarTitle = document.getElementById('sidebar-title');
    const navLabels = document.querySelectorAll('.nav-label');
    
    isSidebarCollapsed = !isSidebarCollapsed;
    
    if (isSidebarCollapsed) {
        sidebar.classList.remove('expanded');
        sidebar.classList.add('collapsed');
        mainContent.classList.remove('sidebar-expanded');
        mainContent.classList.add('sidebar-collapsed');
        sidebarTitle.style.display = 'none';
        navLabels.forEach(label => label.style.display = 'none');
    } else {
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('expanded');
        mainContent.classList.remove('sidebar-collapsed');
        mainContent.classList.add('sidebar-expanded');
        sidebarTitle.style.display = 'block';
        navLabels.forEach(label => label.style.display = 'inline');
    }
    
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
    
    // Force layout recalculation
    setTimeout(() => {
        const mainContent = document.getElementById('main-content');
        const grid = document.getElementById('avatar-grid');
        if (mainContent && grid) {
            // Trigger reflow by forcing style recalculation
            mainContent.style.width = isSidebarCollapsed ? 'calc(100vw - 4rem)' : 'calc(100vw - 16rem)';
            grid.style.display = 'none';
            grid.offsetHeight; // Force reflow
            grid.style.display = 'grid';
        }
    }, 100);
}

function initializeAuth() {
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');
    const guestLogin = document.getElementById('guest-login');
    
    authBtn.addEventListener('click', () => {
        if (isAuthenticated) {
            handleLogout();
        } else {
            authModal.classList.remove('hidden');
        }
    });
    
    closeModal.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });
    
    guestLogin.addEventListener('click', handleGuestLogin);
    
    // Initialize Firebase auth state listener
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged(window.firebaseAuth.auth, (user) => {
            updateAuthState(user);
        });
    }
}

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
}

// Email authentication is now handled in separate pages

function handleGuestLogin() {
    if (window.firebaseAuth) {
        window.firebaseAuth.signInAnonymously(window.firebaseAuth.auth)
            .then(() => {
                showToast('Logged in as guest!', 'success');
                document.getElementById('auth-modal').classList.add('hidden');
            })
            .catch((error) => {
                showToast(error.message, 'error');
            });
    }
}

function handleLogout() {
    if (window.firebaseAuth && isAuthenticated) {
        window.firebaseAuth.signOut(window.firebaseAuth.auth)
            .then(() => {
                showToast('Logged out successfully', 'success');
            })
            .catch((error) => {
                showToast(error.message, 'error');
            });
    }
}

function updateAuthState(user) {
    currentUser = user;
    isAuthenticated = !!user;
    
    const authBtn = document.getElementById('auth-btn');
    const tokenBalance = document.getElementById('token-balance');
    
    if (isAuthenticated) {
        tokens = user.isAnonymous ? 100 : 1000;
        authBtn.innerHTML = `
            <i data-lucide="log-out"></i>
            <span>${user.isAnonymous ? 'Sign Up' : 'Logout'}</span>
        `;
    } else {
        tokens = 0;
        authBtn.innerHTML = `
            <i data-lucide="user"></i>
            <span>Login</span>
        `;
    }
    
    tokenBalance.textContent = `Tokens: ${tokens.toLocaleString()}`;
    initializeLucide();
}

function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    const genderFilter = document.getElementById('gender-filter');
    const streamFilter = document.getElementById('stream-filter');
    
    searchInput.addEventListener('input', filterAvatars);
    genderFilter.addEventListener('change', filterAvatars);
    streamFilter.addEventListener('change', filterAvatars);
}

function loadAvatars() {
    avatars = [...mockAvatars];
    renderAvatars(avatars);
}

function filterAvatars() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const genderFilter = document.getElementById('gender-filter').value;
    const streamFilter = document.getElementById('stream-filter').value;
    
    const filtered = avatars.filter(avatar => {
        const matchesSearch = !searchQuery || 
            avatar.name.toLowerCase().includes(searchQuery) ||
            avatar.id.toLowerCase().includes(searchQuery);
        
        const matchesGender = genderFilter === 'all' || avatar.gender === genderFilter;
        
        const matchesStream = streamFilter === 'all' || 
            (streamFilter === 'true' && avatar.streamable) ||
            (streamFilter === 'false' && !avatar.streamable);
        
        return matchesSearch && matchesGender && matchesStream;
    });
    
    renderAvatars(filtered);
}

function renderAvatars(avatarsToRender) {
    const grid = document.getElementById('avatar-grid');
    
    if (avatarsToRender.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-slate-400 py-8">No avatars found</div>';
        return;
    }
    
    grid.innerHTML = avatarsToRender.map(avatar => `
        <div class="avatar-card" onmouseenter="showPreview('${avatar.id}')" onmouseleave="hidePreview('${avatar.id}')">
            <div class="relative bg-slate-900 rounded-xl overflow-hidden">
                <img id="thumb-${avatar.id}" class="card-media" src="${avatar.thumb}" alt="${avatar.name}" />
                <video id="video-${avatar.id}" class="card-media hidden" src="${avatar.talking_preview}" autoplay muted loop playsinline></video>
            </div>
            
            <div class="mt-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="font-semibold text-white">${avatar.name}</div>
                        <div class="text-xs text-slate-400 capitalize">${avatar.gender}</div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-outline text-xs" onclick="openPreview('${avatar.id}')">Preview</button>
                        <button class="btn btn-primary text-xs" onclick="selectAvatar('${avatar.id}')">Select</button>
                    </div>
                </div>
                
                <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400">ID: ${avatar.id}</span>
                    <span class="px-2 py-1 rounded-full text-xs ${avatar.streamable ? 'bg-green-600' : 'bg-slate-600'}">
                        ${avatar.streamable ? 'Streamable' : 'Static'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function showPreview(avatarId) {
    const thumb = document.getElementById(`thumb-${avatarId}`);
    const video = document.getElementById(`video-${avatarId}`);
    
    if (thumb && video) {
        thumb.classList.add('hidden');
        video.classList.remove('hidden');
        video.play();
    }
}

function hidePreview(avatarId) {
    const thumb = document.getElementById(`thumb-${avatarId}`);
    const video = document.getElementById(`video-${avatarId}`);
    
    if (thumb && video) {
        video.classList.add('hidden');
        thumb.classList.remove('hidden');
        video.pause();
    }
}

function openPreview(avatarId) {
    const avatar = avatars.find(a => a.id === avatarId);
    if (avatar) {
        window.open(`data:text/html,<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;"><video autoplay muted loop controls style="max-width:100%;max-height:100%;"><source src="${avatar.preview}" type="video/mp4"></video></body></html>`, '_blank');
    }
}

function selectAvatar(avatarId) {
    const avatar = avatars.find(a => a.id === avatarId);
    if (avatar) {
        showToast(`Selected avatar: ${avatar.name}`, 'success');
        // Here you would typically open a wizard or configuration modal
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (isDarkMode) {
        body.classList.remove('light');
        themeToggle.innerHTML = '<i data-lucide="moon"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light');
        themeToggle.innerHTML = '<i data-lucide="sun"></i>';
        localStorage.setItem('theme', 'light');
    }
    
    // Re-initialize Lucide icons
    initializeLucide();
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}