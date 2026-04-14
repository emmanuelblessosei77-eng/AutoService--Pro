// Run this in the browser console or include temporarily in your app to clear all auth/user data
localStorage.clear();
sessionStorage.clear();
console.log('localStorage and sessionStorage cleared. Reloading...');
window.location.reload();