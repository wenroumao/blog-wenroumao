var posts=["posts/36236/","posts/55248/","posts/2284d265/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };