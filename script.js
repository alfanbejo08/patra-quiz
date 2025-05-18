document.addEventListener('DOMContentLoaded', () => {
    // 1) Inject the signed-up display name into both spots
    const dispName = localStorage.getItem('displayName');
    if (dispName) {
      const hdr = document.getElementById('usernameDisplay');
      const wlc = document.getElementById('usernameDisplay2');
      if (hdr) hdr.textContent = dispName;
      if (wlc) wlc.textContent = dispName;
    }
  
    // 2) Your existing dashboard / quiz code (login modal stuff can stay if you still have it on this page)...
    //    (Or remove any bits that refer to elements no longer in index.html.)
  
    const loginBtn    = document.getElementById('loginBtn');
    const authModal   = document.getElementById('authModal');
    const switchAuth  = document.getElementById('switchAuth');
    const modalTitle  = document.getElementById('modalTitle');
    const authForm    = document.getElementById('authForm');
    const submitAuth  = document.getElementById('submitAuth');
    const toggleAuth  = document.getElementById('toggleAuth');
    const pointText   = document.getElementById('pointText');
    const showRankBtn = document.getElementById('showRankBtn');
    const hamburger   = document.getElementById('hamburger');
    const sidebar     = document.getElementById('sidebar');
  
    let isSignup    = false;
    let currentUser = localStorage.getItem('currentUser') || null;
  
    function loadUsers() {
      return JSON.parse(localStorage.getItem('users') || '{}');
    }
    function saveUsers(u) {
      localStorage.setItem('users', JSON.stringify(u));
    }
  
    function updatePoints() {
      if (!pointText) return;
      const users = loadUsers();
      const pts   = currentUser ? users[currentUser].points : 0;
      pointText.textContent = `Your Current Points: ${pts}`;
    }
  
    function getRank() {
      const users = loadUsers();
      const sorted = Object.entries(users)
        .sort(([,a],[,b]) => b.points - a.points);
      return sorted.findIndex(([u]) => u === currentUser) + 1;
    }
  
    // Initialize
    updatePoints();
  
    // Login modal open
    if (loginBtn && authModal) {
      loginBtn.addEventListener('click', () => {
        authModal.classList.add('active');
      });
    }
  
    // Toggle Login ⇄ Signup
    if (switchAuth) {
      switchAuth.addEventListener('click', e => {
        e.preventDefault();
        isSignup = !isSignup;
        modalTitle.textContent = isSignup ? 'Signup' : 'Login';
        submitAuth.textContent = isSignup ? 'Signup' : 'Login';
        toggleAuth.innerHTML = isSignup
          ? 'Already have an account? <a href="#" id="switchAuth">Login</a>'
          : 'Don\'t have an account? <a href="#" id="switchAuth">Signup</a>';
      });
    }
  
    // Form submit
    if (authForm) {
      authForm.addEventListener('submit', e => {
        e.preventDefault();
        const users = loadUsers();
        const user  = document.getElementById('userField').value.trim();
        const pass  = document.getElementById('passField').value;
  
        if (isSignup) {
          if (users[user]) return alert('Username already exists');
          users[user] = { password: pass, points: 0 };
          saveUsers(users);
          alert('Signup successful! Please login.');
          switchAuth.click();
        } else {
          if (!users[user] || users[user].password !== pass)
            return alert('Invalid credentials');
          currentUser = user;
          localStorage.setItem('currentUser', user);
          document.getElementById('usernameDisplay').textContent = user;
          authModal.classList.remove('active');
          updatePoints();
        }
      });
    }
  
    // Show rank
    if (showRankBtn) {
      showRankBtn.addEventListener('click', () => {
        if (!currentUser) return alert('Please login first');
        alert(`Your rank is ${getRank()}`);
      });
    }
  
    // Hamburger toggle
    if (hamburger && sidebar) {
      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  
    // Clicking outside modal closes it
    if (authModal) {
      authModal.addEventListener('click', e => {
        if (e.target === authModal) authModal.classList.remove('active');
      });
    }
  });
  