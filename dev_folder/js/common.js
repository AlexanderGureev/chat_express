window.addEventListener("DOMContentLoaded", function () {
     
    if(document.querySelector("p.msgError")){
        var errorTooltip = $(".tooltipError").tooltipster({
            theme: ["tooltipster-noir", "tooltipster-noir-customized", "tooltipster-error"],
            animation: "grow",
            animationDuration: 500,
            timer: 10000
        });
        setTimeout(() => errorTooltip.tooltipster("open"), 2500);
    }

    new WOW().init();
    
    document.querySelector(".toggle-menu").addEventListener("click", function (e) {
        this.firstElementChild.classList.toggle("focus");
        document.querySelector(".collapsed").classList.toggle("show");
        document.querySelector(".top-line").classList.toggle("show");
        document.querySelector(".minilogo").classList.toggle("hide");

        raf(function(){
            document.querySelector(".collapsed").classList.toggle("enter");
        });
        
    });

    function toggleForms(...arrayBtn) {
        arrayBtn.forEach(btn => {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                $('.tooltipstered').tooltipster('close');

                if (btn.id == "btnRegister") {
                    document.querySelector(".register-container").classList.remove("hide");
                    document.querySelector(".auth-container").classList.remove("show");
                } else {
                    document.querySelector(".register-container").classList.add("hide");
                    document.querySelector(".auth-container").classList.add("show");
                }
            });
        });
    }

    var btnAuth = document.querySelector("#btnAuth");
    var btnReg = document.querySelector("#btnRegister");

    if (btnAuth && btnReg) {
        toggleForms(btnAuth, btnReg);
    }

    (function initEvents(validator) {
        var inputsReg = document.querySelectorAll(".register .form-group input");
        var inputsAuth = document.querySelectorAll(".auth .form-group input");
        var inputsForgot = document.querySelectorAll(".forgot .form-group input");
        var inputsReset = document.querySelectorAll(".reset .form-group input");
        var inputsChange = document.querySelectorAll(".change .form-group input");

        var submitReg = document.querySelector(".form-group button.reg");
        var submitAuth = document.querySelector(".form-group button.auth");
        var submitForgot = document.querySelector(".form-group button.forgot");
        var submitReset = document.querySelector(".form-group button.reset");
        var submitChange = document.querySelector(".form-group button.change");

        if(submitAuth && submitReg){
            addEventsForForms(submitAuth, inputsAuth, validator);
            addEventsForForms(submitReg, inputsReg, validator);
        }
        if(submitForgot) {
            addEventsForForms(submitForgot, inputsForgot, validator);
        }
        if(submitReset){
            addEventsForForms(submitReset, inputsReset, validator);
        }
        if(submitChange){
            addEventsForForms(submitChange, inputsChange, validator);
        }
        
        if(inputsReg && inputsAuth){
            addEventsForInputs(inputsReg, validator);
            addEventsForInputs(inputsAuth, validator);
        }
        if(inputsForgot) {
            addEventsForInputs(inputsForgot, validator);
        }
        if(inputsReset){
            addEventsForInputs(inputsReset, validator);
        } 
        if(inputsChange) {
            addEventsForInputs(inputsChange, validator);
        }
    }(new Validator()));

});

function raf(func) {
    window.requestAnimationFrame(function() {
        func();
    });
}

(function addClickEffectBtn(){
    var btn = document.getElementsByClassName("button-ex");

    Array.prototype.forEach.call(btn, item => {
        item.addEventListener("click", (e) => {
            var coords = item.getBoundingClientRect();
            var max = Math.max(item.offsetWidth, item.offsetHeight);
            var div = document.createElement("div");
            div.className = "ps";
            div.style.width = max + "px";
            div.style.height = max + "px";

            div.style.left = e.clientX - coords.left - max / 2 + "px";
            div.style.top = e.clientY - coords.top - max / 2 + "px";

            item.appendChild(div);

            setTimeout(function () {
                div.remove();
            }, 600);
        });
    });
}());

window.addEventListener("scroll", function() {
    if(this.pageYOffset) {
        document.querySelector(".top-line").classList.add("scrolling");
    }
    else {
        document.querySelector(".top-line").classList.remove("scrolling");
    }
});

$(window).on("load", function () {
    $(".preloader").delay(1200).fadeOut("slow");
});

function addEventsForForms(btn, inputsValidate, validator) {
    btn.addEventListener("click", function (e) {
        var stopSending = false;

        for (var i = 0; i < inputsValidate.length; i++) {
            if(!validator.validate(inputsValidate[i], e)){
                stopSending = true;
            }
        }

        if (stopSending == true) {
            e.preventDefault();
        } else {
            e.preventDefault();
            sendForm(`${btn.form.action}`, this.form);
        }
    });
};

function addEventsForInputs(inputs, validator) {
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("input", function (e) {
            if(/\s/.test(this.value)){
                this.value = this.value.replace(/\s/g, "");
            }
            else {
                validator.validate(this, e);
            }
        });
    }
};

function sendForm(url, form) {
    var spin = document.querySelector("button i.fas");

    var toolTipForm = $(form).tooltipster({
        theme: ['tooltipster-noir', 'tooltipster-noir-customized'],
        animation: 'grow',
        multiple: true,
        side: 'top',
        trigger: "custom",
        timer: 10000
    });
    var formData = {};

    if(form.classList.contains("register")){
        formData = JSON.stringify({
            email: form.emailReg.value,
            username: form.loginReg.value,
            password: form.passReg.value
        });
    }
    else if(form.classList.contains("auth")) {
        formData = JSON.stringify({
            username: form.loginAuth.value,
            password: form.passAuth.value
        });
    }
    else if(form.classList.contains("forgot")) {
        formData = JSON.stringify({
            email: form.emailForgot.value
        });
    } 
    else if (form.classList.contains("reset")) {
        formData = JSON.stringify({
            password: form.passNew.value,
            passwordConfirm: form.passConfirm.value
        });
    } 
    else if(form.classList.contains("change")) {
        formData = JSON.stringify({
            password: form.passNew.value,
            passwordConfirm: form.passConfirm.value
        });
    }

    var token = form._csrf.value;
    spin.style.display = "inline-block";

    configureRequest(url, formData, token)
        .then((data) => {
            spin.style.display = "none";
            if (data.type == "ok") {
                document.location.href = data.msg;
            } else {
                toolTipForm.tooltipster('content', `${data.msg}`).tooltipster("open");
            }
        })
        .catch((error) => {
            spin.style.display = "none";
            console.log(error);
        });
}

function configureRequest(url, data, token){
    return new Promise((resolve, reject) => {

        var request = new XMLHttpRequest();

        request.open("POST", url);
        request.setRequestHeader("Content-type", "application/json; charset=utf-8");
        request.setRequestHeader("X-CSRF-Token", `${token}`);

        request.onload = function() {
            try {
                if(this.status === 200){
                    resolve(JSON.parse(this.response));   
                }
                else {
                    reject(this.status + " " + this.statusText);
                }
            }
            catch(e) {
                reject(e.message);
            }
        };

        request.onerror = function() {
            reject(this.status + " " + this.statusText);
        };
        request.send(data);
    });
}