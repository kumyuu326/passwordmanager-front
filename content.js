window.onload = function(){
    console.log('ページが完全に読み込まれました');
    const pageHTMl = document.documentElement.outerHTML;

    const parser = new DOMParser();
    const doc = parser.parseFromString(pageHTMl, 'text/html');
    const passwordInputs = doc.querySelectorAll('input[type="password"]');
    const Inputs = document.querySelectorAll('input[type="password"]');
    const signup_form = doc.querySelector('form');
    const signup = document.querySelector('form');

    //パスワード入力欄の存在確認
    if (
      window.location.href.includes('signup') ||
      (document.querySelector('input[type="submit"]') &&
      document.querySelector('input[type="submit"]').value.includes('signup')) ||
      (document.querySelector('input[type="submit"]') &&
      document.querySelector('input[type="submit"]').id.includes('signup'))
  ){
      if (passwordInputs.length > 0){
          console.log('パスワード入力欄が存在します');
          Inputs.forEach(function(input){
              input.addEventListener('click', function(e){
                  e.stopPropagation();
                  if (!passwordGenerated) {
                      getPassword(12);
                      passwordGenerated = true;
                  }
                  showTooltip(e.target, '推奨パスワード  ' + pwd);
              });
          });
      }else{
          console.log('パスワード入力欄が存在しません');
      };
   }else{
     console.log('サインアップページではありません')
   };


    chrome.storage.local.get(["key"], function(result) {
      var id = result.key;
      if (!id) {
        fetch('http://127.0.0.1:5000/api/user_id')
          .then(response => {
            if (!response.ok) {
              throw new Error('サーバーエラー');
            }
            return response.json();
          })
          .then(data => {
            var user_id = data.user_id;
            console.log(user_id);
            chrome.storage.local.set({ key: user_id }, () => {
              console.log('idがセットされました');
            });
          });
      }
    });
    
    //ユーザー情報を取得して、データ送信（改善）
    if (
      window.location.href.includes('signup') ||
      (document.querySelector('input[type="submit"]') &&
      document.querySelector('input[type="submit"]').value.includes('signup')) ||
      (document.querySelector('input[type="submit"]') &&
      document.querySelector('input[type="submit"]').id.includes('signup'))
  ){
      if(passwordInputs.length>0){
        if (signup_form) {
          signup.addEventListener("submit", function(event) {
            event.preventDefault();
            var currentHostname = window.location.hostname
            const searchString1 = "username";
            const searchString2 = "email";
            
            var formData = new FormData();
            chrome.storage.local.get(["key"], (result) => {
              var id = result.key;
              console.log(id);
              
              if (id) {
                formData.append("user_id", id);
                formData.append("hostname", currentHostname);
                formData.append("email", document.querySelector(`[id*="${searchString2}"]`).value);
                formData.append("password", document.querySelector('input[type="password"]').value);
            
                fetch("http://127.0.0.1:5000/data", {
                  method: "POST",
                  body: formData
                })
                  .then(response => {
                    if (!response.ok) {
                      console.error('サーバーエラー');
                    }
                  })
                  .catch(error => {
                    console.error('通信に失敗しました', error);
                  });
              } else {
                console.log('ユーザーIDが見つかりません');
              }
            });
          });
        } else {
          console.log('フォームが存在しません');
        }
      }
    }

}

pwd = "";
let passwordGenerated = false;
let currentTooltip = null;

//ツールチップ作成の関数
function showTooltip(element, message) {
    if (currentTooltip !== null) {
        currentTooltip.remove();
    }
    var tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'tooltip';
    tooltip.innerHTML = message;
    tooltip.style.position = 'absolute';
    tooltip.style.top = element.offsetTop + element.offsetHeight + 'px';
    tooltip.style.left = element.offsetLeft + 'px';
    tooltip.style.backgroundColor = 'rgb(235, 235, 235)';
    tooltip.style.height = '50px';
    element.parentElement.appendChild(tooltip);
    currentTooltip = tooltip;

    //ツールチップをクリックした時にinputに生成したパスワードを入力
    tooltip.addEventListener('click', function() {
        const Inputs = document.querySelectorAll('input[type="password"]');
        Inputs.forEach(function(input){
            input.value = pwd;
        });
        currentTooltip.remove();
        currentTooltip = null;
    });
  }

//パスワード生成の関数
function getPassword(len){
    let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&=~/*-+";

    let password = "";
    for(let i = 0; i < len; i++){
        password += str.charAt(Math.floor(Math.random() * str.length))
    }
    pwd = password;
}

  document.addEventListener('click', function(e) {
    if (currentTooltip !== null && !currentTooltip.contains(e.target)) {
      currentTooltip.remove();
      currentTooltip = null;
      passwordGenerated = false;
    }
  });
  

