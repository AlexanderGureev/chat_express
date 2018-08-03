window.addEventListener("DOMContentLoaded", function () {
    (function () {

        var inpAva = document.querySelector("#avatar");
        var fileName = document.querySelector(".fileName");

        var avaBox = document.querySelector(".avatarBox");
        var btnSendAva = document.querySelector(".btnSend");
        var clearBtn = document.querySelector("a.clear");
        var deleteAva = document.querySelector("a.delete");

        var formProfile = document.querySelector(".uploadAvatar");
        var formStatus = document.querySelector(".statusForm");


        var toolTip = $(formProfile).tooltipster({
            theme: ['tooltipster-noir', 'tooltipster-noir-customized'],
            animation: 'grow',
            multiple: true,
            side: 'top',
            trigger: "custom",
            timer: 10000
        });

        if(formProfile){
            setAvatar();

            addEffect(document.querySelector(".list"), document.querySelector(".toggle"), 
                     "fa-active-list", "fa-disabled-list");

            addEffect(document.querySelector(".form-change-status"), document.querySelector("a.open-form"),
                     "fa-active-status", "fa-disabled-status");

            formProfile.addEventListener("submit", function (e) {
                e.preventDefault();
                uploadAvatar(this);
            })

            formStatus.addEventListener("submit", function (e) {
                e.preventDefault();
                setStatus(this);
            })

        }
        
        function clearAvaBox() {
            inpAva.value = "";
            fileName.textContent = "";
            avaBox.classList.add("upd");
            btnSendAva.style.display = "none";
            clearBtn.style.display = "none";
            avaBox.classList.remove("send");
        }

        function setAvatar() {
            inpAva.addEventListener("change", function (e) {
                var file = this.value.split("\\");
                fileName.textContent = file[file.length - 1];

                if (this.value != "") {
                    avaBox.classList.remove("upd");
                    avaBox.classList.add("send");
                    btnSendAva.style.display = "block";
                    clearBtn.style.display = "block";
                } else {
                    avaBox.classList.add("upd");
                    avaBox.classList.remove("send");
                    btnSendAva.style.display = "none";
                    clearBtn.style.display = "none";
                }
            });

            clearBtn.addEventListener("click", function (e) {
                e.preventDefault();
                clearAvaBox();
            });

            deleteAva.addEventListener("click", function (e) {
                e.preventDefault();
                deleteAvatar(formProfile);
            });
        }

        function setStatus(form) {
            var token = form._csrf.value;
            var data = JSON.stringify({
                status: form.statusText.value
            });

            configureRequest(form.action, data, token)
                .then(res => {
                    if (res.type == "ok") {
                        document.querySelector("a.open-form").textContent = `${res.msg}`;
                        form.parentElement.classList.remove("fa-active-status");
                        form.parentElement.classList.add("fa-disabled-status");
                    } else {
                        toolTip.tooltipster('content', `${res.msg}`).tooltipster("open");
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }

        function initRequest(url, data, token) {
            return new Promise((resolve, reject) => {

                var request = new XMLHttpRequest();
                request.open("POST", url);
                request.setRequestHeader("X-CSRF-Token", `${token}`);

                request.onload = function () {
                    try {
                        if (this.status === 200) {
                            resolve(JSON.parse(this.response));
                        } else {
                            reject(this.status + " " + this.statusText);
                        }
                    } catch (e) {
                        reject(e.message);
                    }
                };

                request.onerror = function () {
                    reject(this.status + " " + this.statusText);
                };

                if (data) {
                    request.send(data);
                } else {
                    request.send();
                }

            });
        }

        function deleteAvatar(form) {
            var token = form._csrf.value;

            initRequest("/profile/avatar/del", null, token)
                .then(res => {
                    avaBox.style.backgroundImage = `url(${res.avatarPath})`;
                    deleteAva.classList.remove("show");
                    clearAvaBox();
                })
                .catch(err => {
                    console.log(err);
                });
        }

        function uploadAvatar(form) {

            var formData = new FormData();
            var file = inpAva.files[0];
            var token = form._csrf.value;

            formData.append("avatar", file);

            initRequest("/profile/avatar/add", formData, token)
                .then(res => {
                    if (res.type == "ok") {
                        avaBox.style.backgroundImage = `url(${res.avatarPath})`;
                        if (!deleteAva.classList.contains("show")) {
                            deleteAva.classList.add("show");
                        }
                    } else {
                        toolTip.tooltipster('content', `${res.msg}`).tooltipster("open");
                    }
                    clearAvaBox();
                })
                .catch(err => {
                    console.log(err);
                });
        }

        function addEffect(animateElement, btn, activeClass, disabledClass) {

            animateElement.addEventListener("webkitAnimationEnd", function (e) {
                if (this.classList.contains(disabledClass)) {
                    animateElement.style.display = "none";
                }
            });

            btn.addEventListener("click", function (e) {
                e.preventDefault();
                if (animateElement.classList.contains(activeClass)) {
                    animateElement.classList.remove(activeClass);
                    animateElement.classList.add(disabledClass);

                } else {
                    animateElement.style.display = "block";
                    raf(() => {
                        animateElement.classList.add(activeClass);
                        animateElement.classList.remove(disabledClass);
                    });
                }
            });

            window.addEventListener("click", function (e) {
                if (!animateElement.contains(e.target)) {
                    animateElement.classList.remove(activeClass);
                    animateElement.classList.add(disabledClass);
                }
            });
        }

    }());
});