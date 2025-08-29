document.addEventListener('DOMContentLoaded', async () => {
    const loginView = document.getElementById('login-view');
    const profileView = document.getElementById('profile-view');
    const googleLoginBtn = document.getElementById('google-login-btn');

    try {
        // Check the authentication status from the backend, ensuring cookies are sent
        const res = await fetch('/auth/status', { credentials: 'include' });
        const data = await res.json();

        if (data.loggedIn) {
            // User is logged in, show profile view
            loginView.style.display = 'none';
            profileView.style.display = 'block';

            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');
            const userImage = document.getElementById('user-image');

            userName.textContent = data.user.displayName;
            userEmail.textContent = data.user.email;
            userImage.src = data.user.image;

        } else {
            // User is not logged in, show login view
            loginView.style.display = 'block';
            profileView.style.display = 'none';

            // Add event listener to the Google login button
            if (googleLoginBtn) {
                googleLoginBtn.addEventListener('click', () => {
                    // Redirect to the Google auth route on the backend
                    window.location.href = '/auth/google';
                });
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Show login view by default if there is an error
        loginView.style.display = 'block';
        profileView.style.display = 'none';
    }
    
    // I'm disabling the default form submission as we are using Google Login
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('الرجاء استخدام تسجيل الدخول عبر جوجل');
        });
    }
});
