;(function(){
  function inTyping(el){
    var id = el && el.id;
    return id !== 'center-console' && id !== 'page-type';
  }
  function bindInputFocus(){
    var inputs = document.querySelectorAll('input, textarea');
    for(var i=0;i<inputs.length;i++){
      var el = inputs[i];
      if(!inTyping(el)) continue;
      el.addEventListener('focus', function(){
        try{ window.anzhiyu_intype = true }catch(e){}
      });
      el.addEventListener('blur', function(){
        try{ window.anzhiyu_intype = false }catch(e){}
      });
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindInputFocus);
  }else{
    bindInputFocus();
  }
})();