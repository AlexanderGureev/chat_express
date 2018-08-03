window.addEventListener("DOMContentLoaded", function () {

    var toggle = document.querySelector(".toggle");
    var nav = document.querySelector(".left-side-bar");
    var collapseNav = document.querySelector("#left-bar");
    var mainChat = document.querySelector(".main-chat");
    var sideBar = document.querySelector(".right-side-bar");
    var close = document.querySelector(".closes");
    //var sWidth = window.outerHeight;

    function setEventMenu(elem, event) {
        elem.addEventListener(event, function(e) {
            if (event == "mouseup" || event == "touchend") {
                if (e.target != collapseNav && e.target.parentNode != collapseNav && e.target.previousElementSibling != collapseNav) {
                    nav.classList.remove("active");
                    toggle.classList.remove("hide");
                }
            }
            else {
                nav.classList.toggle("active");
                toggle.classList.toggle("hide");
            }
        });
    }

      setEventMenu(toggle, "click");
      setEventMenu(close, "click");
      setEventMenu(window, "mouseup");
      setEventMenu(window, "touchend");

    function throttle(func, delay) {

        var isThrottled = false,
            saveThis,
            saveArgs;

        function wrapper() {
            if (isThrottled) {
                saveThis = this;
                saveArgs = arguments;
                return;
            }

            func(); //вызов функции когда делаем первый раз resize
            isThrottled = true;

            setTimeout(function () {
                isThrottled = false;
                if (saveArgs) {
                    func.apply(saveThis, saveArgs); //вызов на последнем действии (resize)
                    saveThis = saveArgs = null;
                }
            }, delay);
        }
        return wrapper;
    }

    //window.addEventListener("resize", throttle(showHideMenu, 300));



    function addModalWindow() {
        var li_users = document.querySelectorAll(".right-side-bar ul li");

        for (var i = 0; i < li_users.length; i++) {
            // $(li_users[i]).tooltipster({
            //     content: `${li_users[i].textContent}`,
            //     side: 'top',
            //     trigger: 'click',
            //     interactive: true
            // });

            // $(li_users[i]).tooltipster({
            //     content: `${li_users[i].textContent}`,
            //     multiple: true,
            //     side: 'bottom',
            //     trigger: 'click',
            //     interactive: true
            // });

            var template = document.createElement("div");
            var span = document.createElement("span");

            span.setAttribute("id", `tooltip_content${i+1}`);
            template.className = "tooltip_templates";

            var createSpan = template.appendChild(span);
            li_users[i].appendChild(template);


            createSpan.innerHTML = `<div class="header">
                                        <img src="img/ava.png" alt="">
                                        <strong>${li_users[i].textContent}</strong>
                                    </div>
                                    <div class="content"> 
                                        <ul> 
                                            <li><a href="#">Настройки</a></li>
                                            <li><a href="#">Друзья</a></li>
                                            <li><a href="#">Личные сообщения</a></li>
                                        </ul>
                                    </div>`;

            $(li_users[i]).tooltipster({
                theme: ['tooltipster-profile', 'tooltipster-profile-customized'],
                side: 'left',
                maxWidth: 300,
                trigger: "custom",
                triggerOpen: {
                    click: true,
                    tap: true
                },
                triggerClose: {
                    click: true,
                    tap: true
                },
                interactive: true,
                content: $(`#tooltip_content${i+1}`),
            });

        }


    }

    addModalWindow();


});

$(window).on("load", function () {
    $(".preloader").delay(1200).fadeOut("slow");
});