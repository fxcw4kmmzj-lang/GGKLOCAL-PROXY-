// API Configuration
const API_BASE = window.location.origin + '/api';

// State
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let currentSession = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        loadUser();
    } else {
        showAuthModal();
    }

    setupEventListeners();
    startPolling();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('createProxyForm').addEventListener('submit', handleCreateProxy);
}

// Handle Authentication - Auto Register + Login
async function handleAuth(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    hideAuthMessages();
    
    const button = document.getElementById('authButton');
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="spinner mx-auto"></div>';
    button.disabled = true;
    
    try {
        // Try to login first
        let response = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        let data = await response.json();
        
        // If login fails, try to register
        if (!data.success) {
            response = await fetch(API_BASE + '/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            data = await response.json();
            
            // If registration successful, login automatically
            if (data.success) {
                response = await fetch(API_BASE + '/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                data = await response.json();
            }
        }
        
        // If we have a token, proceed
        if (data.success && data.token) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            hideAuthModal();
            loadMainApp();
            showToast('✅ Welcome!', 'success');
        } else {
            showAuthError(data.error || 'Failed to authenticate');
        }
    } catch (error) {
        showAuthError('Connection error. Please try again.');
        console.error('Auth error:', error);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Load User
async function loadUser() {
    try {
        const response = await fetch(API_BASE + '/analytics/overview', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            hideAuthModal();
            loadMainApp();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            showAuthModal();
        }
    } catch (error) {
        console.error('Load user error:', error);
        showAuthModal();
    }
}

// Show/Hide Modals
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function hideAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

// Auth Messages
function showAuthError(message) {
    const errorEl = document.getElementById('authError');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideAuthMessages() {
    document.getElementById('authError').classList.add('hidden');
}

// Load Main App
function loadMainApp() {
    loadStats();
    loadSessions();
    loadHistory();
    
    // Show username if available
    if (currentUser) {
        document.getElementById('currentUsername').textContent = currentUser.username;
    }
}

// Load Stats
async function loadStats() {
    try {
        const response = await fetch(API_BASE + '/analytics/stats', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('availablePorts').textContent = data.stats.availablePorts;
        }
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// Load Active Sessions
async function loadSessions() {
    try {
        const response = await fetch(API_BASE + '/sessions/my-sessions', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('activeSessions').textContent = data.sessions.length;
            
            if (data.sessions.length > 0) {
                const session = data.sessions[0];
                currentSession = session;
                showActiveProxy(session);
            } else {
                hideActiveProxy();
            }
        }
    } catch (error) {
        console.error('Load sessions error:', error);
    }
}

// Load Session History
async function loadHistory() {
    try {
        const response = await fetch(API_BASE + '/analytics/history', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalSessions').textContent = data.history.length;
            displayHistory(data.history);
        }
    } catch (error) {
        console.error('Load history error:', error);
    }
}

// Display Session History
function displayHistory(sessions) {
    const container = document.getElementById('sessionHistory');
    
    if (sessions.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">No sessions yet</p>';
        return;
    }
    
    container.innerHTML = sessions.slice(0, 10).map(session => `
        <div class="session-card bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="text-white font-mono text-sm">${session.target_ip}:${session.target_port}</p>
                    <p class="text-gray-400 text-xs mt-1">Port: ${session.proxy_port}</p>
                </div>
                <div class="text-right">
                    <span class="px-2 py-1 rounded text-xs ${session.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-gray-500 bg-opacity-20 text-gray-400'}">
                        ${session.status}
                    </span>
                    <p class="text-gray-500 text-xs mt-1">${formatDate(session.created_at)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Create Proxy Session
async function handleCreateProxy(e) {
    e.preventDefault();
    
    const targetIp = document.getElementById('targetIp').value.trim();
    const targetPort = parseInt(document.getElementById('targetPort').value);
    
    hideProxyError();
    
    const button = document.getElementById('createButton');
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="spinner mx-auto"></div>';
    button.disabled = true;
    
    try {
        const response = await fetch(API_BASE + '/sessions/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ targetIp, targetPort })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentSession = data.session;
            showActiveProxy(data.session);
            document.getElementById('createProxyForm').reset();
            loadStats();
            loadSessions();
            showToast('✅ Proxy created successfully!', 'success');
        } else {
            showProxyError(data.error);
        }
    } catch (error) {
        showProxyError('Failed to create proxy. Please try again.');
        console.error('Create proxy error:', error);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Show Active Proxy
function showActiveProxy(session) {
    document.getElementById('activeProxySection').classList.remove('hidden');
    document.getElementById('proxyIp').textContent = session.proxyIp || window.location.hostname;
    document.getElementById('proxyPort').textContent = session.proxyPort;
    document.getElementById('targetServer').textContent = `${session.targetIp}:${session.targetPort}`;
}

// Hide Active Proxy
function hideActiveProxy() {
    document.getElementById('activeProxySection').classList.add('hidden');
    currentSession = null;
}

// End Current Session
async function endCurrentSession() {
    if (!currentSession) return;
    
    if (!confirm('Are you sure you want to end this proxy session?')) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE + `/sessions/end/${currentSession.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            hideActiveProxy();
            loadStats();
            loadSessions();
            loadHistory();
            showToast('Session ended', 'info');
        } else {
            showToast('Failed to end session', 'error');
        }
    } catch (error) {
        console.error('End session error:', error);
        showToast('Connection error', 'error');
    }
}

// Copy to Clipboard
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('📋 Copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
    
    document.body.removeChild(textarea);
}

// Show/Hide Errors
function showProxyError(message) {
    const errorEl = document.getElementById('proxyError');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideProxyError() {
    document.getElementById('proxyError').classList.add('hidden');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const colors = {
        success: 'border-green-500 text-green-300',
        error: 'border-red-500 text-red-300',
        info: 'border-blue-500 text-blue-300'
    };
    
    toast.classList.add(colors[type] || colors.info);
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        authToken = null;
        currentUser = null;
        currentSession = null;
        location.reload();
    }
}

// Polling for Updates
function startPolling() {
    setInterval(() => {
        if (authToken && !document.getElementById('mainApp').classList.contains('hidden')) {
            loadStats();
            loadSessions();
        }
    }, 10000); // Poll every 10 seconds
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}