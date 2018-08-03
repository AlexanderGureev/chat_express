window.addEventListener("DOMContentLoaded", () => {

    var socket = io();

    var form = document.querySelector("form.send-message");
    var online = document.querySelector(".online-count");
    var posts = document.querySelector(".posts");

    posts.scrollTo(0, posts.scrollHeight); //скролим страницу с постами в конец при первом заходе на страницу

    form.addEventListener("submit", function(e) {
        var message = document.querySelector("#input-message");
        if(message.value != ""){
            socket.emit("send message", {message: message.value, socket: socket.id});
            createMessage({message: message.value, id: socket.id});
            message.value = "";
        }
        else {
            alert("Введите текст сообщения");
        }
        e.preventDefault();
    });

    socket.on("message", (data) => {
        createMessage({message: data.message, id: data.id});
    });

    socket.on("updateOnline", (data) => {
        updateOnline(data);
    });

    socket.on("newUser", (data) => {
        createUser(data);
    });

    socket.on("getAllOnlineUsers", (data) => {
        createUser(data);
    });

    socket.on("userDisconnect", (id) => {
        deleteUser(id);
    });
    

    function createDivElement(elemets) {
        var results = {};

        elemets.forEach((item) => {
            results[`${item.name}`] =  document.createElement("div");
            if(item.class){
                results[`${item.name}`].className = `${item.class}`;
            }
            if(item.textContent){
                results[`${item.name}`].textContent = item.textContent;
            }
        })
        return results;
    }

    function createMessage(data) {

        var elements = createDivElement([ 
                    { name: "post", class: data.id == socket.id ? "post my-post" : "post"}, 
                    { name: "avatar", class: data.id == socket.id ? "my-avatar" : "avatar"}, 
                    { name: "message", class: "message"},
                    { name: "textMessage", class: "text", textContent: data.message},
                    { name: "footer", class: "footer"},
                    { name: "author", class: "author", textContent: data.id.substring(0,6)},
                    { name: "date", class: "date", textContent: new Date().toLocaleString() }]);

        elements.footer.appendChild(elements.author);
        elements.footer.appendChild(elements.date);

        elements.message.appendChild(elements.textMessage);
        elements.message.appendChild(elements.footer);

        elements.post.appendChild(elements.avatar);
        elements.post.appendChild(elements.message);


        if(posts.scrollTop + posts.offsetHeight == posts.scrollHeight){
            posts.appendChild(elements.post);
            posts.scrollTo(0, posts.scrollHeight);
        }
        else {
            posts.appendChild(elements.post);
        }
    }

    function createUser(data) {
        var ul = document.querySelector(".userOnline");
        var count = data.count || 1;

        for(var i = 0; i<count; i++){

            var li = document.createElement("li");
            var img = document.createElement("img");
            var span = document.createElement("span");

            img.src = "img/ava.png";
            span.classList.add("name");


            span.textContent = data.text + " " + data.id[i].substring(0, 6);
            
            li.appendChild(img);
            li.appendChild(span);
            ul.appendChild(li);
        }
    }

    function deleteUser(id) {
        var spans = document.querySelectorAll("span.name");

        var item = [];
        
        for(var i = 0; i < spans.length; i++){

            item = spans[i].textContent.split(" ");
            if(item[3] == id.substring(0,6)){
                spans[i].parentNode.remove(spans[i]);
            }
        }
    }

    function updateOnline(data) {
        online.textContent = data.online;
    }

});