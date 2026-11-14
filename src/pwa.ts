if (typeof window !== 'undefined' && import.meta.env.PROD && 'serviceWorker' in navigator) {
 window.addEventListener('load',()=>{
  void navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{
    // Optional enhancement: the app still works as an ordinary website.
  });
 });
}
