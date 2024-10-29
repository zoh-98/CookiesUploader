window.onload = function() {
     function toastNotification(message) {
       var x = document.getElementById("snackbar");
       x.addEventListener("click", function() {
         x.className = x.className.replace("show", "");
       });
       x.innerHTML = message;
       x.className = "show";
       setTimeout(function() {
         x.className = x.className.replace("show", "");
       }, 3000);
     }
   
     function importFunc() {
       try {
         let textarea = document.getElementById("yourFbstate");
         let data = textarea.value;
   
         // Parse the content from the textarea
         var j = JSON.parse(data);
         if (Array.isArray(j)) {
           chrome.cookies.getAll({ domain: "facebook.com" }, async function(cookies) {
             // Remove existing Facebook cookies
             for (let i in cookies) {
               await new Promise((resolve) => {
                 chrome.cookies.remove({
                   url: `https://facebook.com${cookies[i].path}`,
                   name: cookies[i].name
                 }, resolve);
               });
             }
   
             // Set new cookies from the textarea data
             for (let i in j) {
               if (j[i].domain == "facebook.com") {
                 await new Promise((resolve) => {
                   chrome.cookies.set({
                     url: `https://facebook.com${j[i].path}`,
                     name: j[i].key,
                     value: j[i].value,
                     expirationDate: (Date.now() / 1000) + (84600 * 30), // 30 days
                     domain: ".facebook.com"
                   }, resolve);
                 });
               }
             }
   
             // Reload Facebook if it's open
             chrome.tabs.query({ active: true }, function(tabs) {
               var { host } = new URL(tabs[0].url);
               if (host.split(".")[1] == "facebook") {
                 chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
               }
             });
   
             toastNotification("Fbstate imported successfully!");
           });
         } else {
           toastNotification("Invalid Fbstate format (not an array).");
         }
       } catch (error) {
         toastNotification("Failed to parse Fbstate (malformed?).");
       }
     }
   
     function logout() {
       const result = confirm("Are you sure you want to logout?");
       if (result) {
         chrome.cookies.getAll({ domain: "facebook.com" }, function(cookies) {
           // Exclude 'sb' and 'dbln' cookies from being removed
           cookies = cookies.filter(c => c.name != "sb" && c.name != "dbln");
   
           for (let i in cookies) {
             chrome.cookies.remove({
               url: `https://facebook.com${cookies[i].path}`,
               name: cookies[i].name
             });
           }
   
           chrome.tabs.query({ active: true }, function(tabs) {
             const { host } = new URL(tabs[0].url);
             if (host.split(".")[1] == "facebook") {
               chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
             }
           });
         });
       }
     }
   
     // Bind buttons
     document.getElementById("logout").onclick = () => logout();
     document.getElementById("btnCopy").onclick = () => importFunc();
   };