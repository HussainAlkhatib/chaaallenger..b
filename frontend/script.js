document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // تمنع الإرسال الفعلي للفورم
            
            // هنا يمكنك إضافة تحقق من المدخلات
            console.log('Attempting to log in...');

            // تحاكي عملية تسجيل دخول ناجحة بالتحويل إلى صفحة التطبيق
            // في تطبيق حقيقي، سيتم هذا التحويل بعد استجابة ناجحة من الخادم
            window.location.href = 'app.html';
        });
    }
});
