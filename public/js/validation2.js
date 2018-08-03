window.addEventListener("DOMContentLoaded", function () {

    function CustomValidate() {
        this.errorList = [];
        this.checkList = [];
    }

    CustomValidate.prototype = {
        addError: function (errorMessage) {
            this.errorList.push(errorMessage);
        },
        getErrorList: function () {
            console.log(this.errorList.join(". \n"));
            return this.errorList.join(". \n");

        },
        getHtmlErrorList: function () {
            return `${this.errorList.join(". \n")}`;
        },
        checkValidate: function (input) {
            for (var i = 0; i < input.customValidate.checkList.length; i++) {
                var res = input.customValidate.checkList[i].isValid(input);
                if (res) {
                    this.addError(input.customValidate.checkList[i].errorMessage);
                }
            }
        }
    }

    // Validation method
    var checkingUserName = [{
            isValid: (input) => {
                return input.value.length < 4;
            },
            errorMessage: "Имя пользователя должно содержать не меньше 4 символов"
        },
        {
            isValid: (input) => {
                var res = /[^а-яёa-z0-9]/i.test(input.value);
                return res;
            },
            errorMessage: "Имя пользователя не должно содержать спец. символы"
        },
        {
            isValid: (input) => {
                var res = input.value.length == 0;
                return res;
            },
            errorMessage: "Поле не может быть пустым"
        }
    ];
    var checkingEmail = [{
            isValid: (input) => {
                return !/.+\@.+\..+/.test(input.value);
            },
            errorMessage: "Введите корректный email (например, email@email.com)"
        },
        {
            isValid: (input) => {
                var res = /[^а-яёa-z0-9@.]/i.test(input.value);
                return res;
            },
            errorMessage: "Имя почтового ящика не должно содержать спец. символы"
        },
        {
            isValid: (input) => {
                var res = input.value.length == 0;
                return res;
            },
            errorMessage: "Поле не может быть пустым"
        }
    ];
    var checkingPassword = [{
            isValid: (input) => {
                return input.value.length < 4;
            },
            errorMessage: "Пароль должен содержать не меньше 4 символов"
        },
        {
            isValid: (input) => {
                var res = input.value.length == 0;
                return res;
            },
            errorMessage: "Поле не может быть пустым"
        }
    ];

    var stopSending = false;
    var eventTarget;

    function initializeValidate(input, e) {

        input.customValidate.errorList = [];
        input.customValidate.checkValidate(input);
        var el = input.nextElementSibling;
        var toolTip = $(el).tooltipster({
            theme: ['tooltipster-noir', 'tooltipster-noir-customized'],
            animation: 'grow',
            multiple: true,
            timer: 10000
        });

        if(eventTarget != e.target) {
            $('.tooltipstered').tooltipster('close');
            eventTarget = e.target;
        }

        if (input.customValidate.errorList.length == 0 && input.value != "") {
            input.previousElementSibling.classList.remove("invalid");
            input.previousElementSibling.classList.add("valid");

            toolTip.tooltipster('close');
            
        } else {
            stopSending = true;
            var listError = input.customValidate.getHtmlErrorList();

            if(input.value.length > 4 && operaFix == 1){
                toolTip.tooltipster('content', `${listError}`).tooltipster('open');
            }

            input.previousElementSibling.classList.remove("valid");
            input.previousElementSibling.classList.add("invalid");
        }
    }

    var userNameInput = document.querySelectorAll("input[id^=login]");
    var passwordInput = document.querySelectorAll("input[id^=pass]");
    var emailInput = document.querySelectorAll("input[id^=email]");

    for (let i = 0; i < userNameInput.length; i++) {
        userNameInput[i].customValidate = new CustomValidate();
        userNameInput[i].customValidate.checkList = checkingUserName;
    }
    for (let i = 0; i < passwordInput.length; i++) {
        passwordInput[i].customValidate = new CustomValidate();
        passwordInput[i].customValidate.checkList = checkingPassword;
    }
    for (let i = 0; i < emailInput.length; i++) {
        emailInput[i].customValidate = new CustomValidate();
        emailInput[i].customValidate.checkList = checkingEmail;
    }


    var inputsReg = document.querySelectorAll(".register .form-group input");
    var inputsAuth = document.querySelectorAll(".auth .form-group input");
    var inputsForgot = document.querySelector(".forgot .form-group input");
    var inputsReset = document.querySelectorAll(".reset .form-group input");


    var submitReg = document.querySelector(".form-group button.reg");
    var submitAuth = document.querySelector(".form-group button.auth");
    var submitForgot = document.querySelector(".form-group button.forgot");
    var submitReset = document.querySelector(".form-group button.reset");

    (function addEventsForInputs() {
        for (var i = 0; i < inputsReg.length; i++) {
            inputsReg[i].addEventListener("input", function (e) {
                if(/\s/.test(this.value)){
                    this.value = this.value.replace(/\s/g, "");
                }
                else {
                    initializeValidate(this, e);
                }
            });
        }
    
        for (var i = 0; i < inputsAuth.length; i++) {
            inputsAuth[i].addEventListener("input", function (e) {
                if(/\s/.test(this.value)){
                    this.value = this.value.replace(/\s/g, "");
                }
                else {
                    initializeValidate(this, e);
                }
            });
        }

        // inputsForgot.addEventListener("input", function (e) {
        //     if(/\s/.test(this.value)){
        //         this.value = this.value.replace(/\s/g, "");
        //     }
        //     else {
        //         initializeValidate(this, e);
        //     }
        // });

        // for (var i = 0; i < inputsAuth.length; i++) {
        //     inputsReset[i].addEventListener("input", function (e) {
        //         if(/\s/.test(this.value)){
        //             this.value = this.value.replace(/\s/g, "");
        //         }
        //         else {
        //             initializeValidate(this, e);
        //         }
        //     });
        // }

    }());

    //fix opera tooltipser
    var operaFix = 0;
    function fixOpera() { operaFix = 1; window.removeEventListener("click", fixOpera); }
    window.addEventListener("click", fixOpera);
 

    function addEventsForForms(...btns) {
        btns.forEach(btn => {
            btn.addEventListener("click", function (e) {
                stopSending = false;

                if (btn === submitAuth) {
                    for (var i = 0; i < inputsAuth.length; i++) {
                        initializeValidate(inputsAuth[i], e);
                    }
                } else if(btn === submitReg) {
                    for (var i = 0; i < inputsReg.length; i++) {
                        initializeValidate(inputsReg[i], e);
                    }
                } else if(btn === submitForgot){
                    initializeValidate(inputsForgot, e);
                } else {
                    for (var i = 0; i < inputsReg.length; i++) {
                        initializeValidate(inputsReset[i], e);
                    }
                }

                if (stopSending == true) {
                    e.preventDefault();
                } else {
                    e.preventDefault();

                    if(btn === submitAuth){
                        sendForm("/auth", this.form);
                    } else if(btn === submitReg) {
                        sendForm("/register", this.form);
                    } else if(btn === submitForgot){
                        sendForm("/forgot", this.form);
                    } else { 
                        sendForm("/reset", this.form);
                    }
                }
            });
        });
    }

    if(submitAuth && submitReg){
        addEventsForForms(submitAuth, submitReg);
    } else if(submitForgot) {
        addEventsForForms(submitForgot);
    } else {
        addEventsForForms(submitReset);
    }

});