// login.js

// 0) Make sure you’ve already loaded firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js
const auth = firebase.auth();
const db   = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  const authForm     = document.getElementById('authForm');
  const toggleLink   = document.getElementById('toggleLink');
  const formTitle    = document.getElementById('formTitle');
  const formDesc     = document.getElementById('formDesc');
  const submitBtn    = document.getElementById('submitBtn');
  const switchPrompt = document.getElementById('switchPrompt');
  const rememberMe   = document.getElementById('rememberMe');
  const nameRow      = document.getElementById('nameRow');
  const displayInput = document.getElementById('displayName');

  let isSignup = false;

  // 1) Initially hide the Name field (login mode)
  nameRow.style.display = 'none';
  displayInput.required = false;

  // 2) Toggle between Login ⇄ Signup
  toggleLink.addEventListener('click', e => {
    e.preventDefault();
    isSignup = !isSignup;

    if (isSignup) {
      nameRow.style.display      = 'block';
      displayInput.required      = true;
      formTitle.textContent      = 'Signup';
      formDesc.textContent       = 'Create your account to get started.';
      submitBtn.textContent      = 'Signup';
      switchPrompt.textContent   = 'Have an account?';
      toggleLink.textContent     = 'Login';
    } else {
      nameRow.style.display      = 'none';
      displayInput.required      = false;
      formTitle.textContent      = 'Login';
      formDesc.textContent       = 'Welcome back! Please login.';
      submitBtn.textContent      = 'Login';
      switchPrompt.textContent   = 'New User?';
      toggleLink.textContent     = 'Signup';
    }

    authForm.reset();
  });

  // 3) Handle form submission
  authForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email       = document.getElementById('username').value.trim();
    const password    = document.getElementById('password').value;
    const displayName = displayInput.value.trim();

    try {
      if (isSignup) {
        // — SIGNUP FLOW —
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName });
        await db.collection('users').doc(cred.user.uid).set({
          email,
          displayName,
          approved: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Signup successful! Awaiting admin approval.');
        toggleLink.click();
        return;
      }

      // — LOGIN FLOW —

      // 3.1) Set persistence *before* sign‐in
      await auth.setPersistence(
        rememberMe.checked
          ? firebase.auth.Auth.Persistence.LOCAL
          : firebase.auth.Auth.Persistence.SESSION
      );

      // 3.2) Sign in
      const cred = await auth.signInWithEmailAndPassword(email, password);

      // 3.3) Check Firestore approval flag
      const snap = await db.collection('users').doc(cred.user.uid).get();
      const data = snap.data() || {};
      if (!data.approved) {
        await auth.signOut();
        return alert('⏳ Your account is not yet approved by admin.');
      }

      // 3.4) Store for dashboard
      localStorage.setItem('currentUser', cred.user.uid);
      localStorage.setItem('displayName', data.displayName || '');

      // 3.5) Redirect
      window.location.href = '../index.html';

    } catch (err) {
      alert('❌ ' + err.message);
    }
  });
});
