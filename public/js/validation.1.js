
function Validator() {

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

    var eventTarget;

    this.validate = function(input, e) {

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
            return true;
            
        } else {
            var listError = input.customValidate.getHtmlErrorList();

            if(input.value.length > 4 && operaFix == 1){
                toolTip.tooltipster('content', `${listError}`).tooltipster('open');
            }

            input.previousElementSibling.classList.remove("valid");
            input.previousElementSibling.classList.add("invalid");

            return false;
        }
    }

    function addValidateMethod() {
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
    }
    addValidateMethod();
}
    
