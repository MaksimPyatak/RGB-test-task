document.addEventListener('DOMContentLoaded', function () {
   const form = document.querySelector("#form");
   const nameInput = document.querySelector("#username");
   const nameError = document.querySelector("#username-error");
   const telInput = document.querySelector("#tel");
   const telCodeInput = document.querySelector(".iti__selected-dial-code");
   console.log(telCodeInput);
   const telError = document.querySelector("#tel-error");
   const emailInput = document.querySelector("#email");
   const emailError = document.querySelector("#email-error");

   const iti = window.intlTelInput(telInput, {
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.1.0/build/js/utils.js',
      initialCountry: "auto",
      geoIpLookup: callback => {
         fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(data => callback(data.country_code))
            .catch(() => callback("us"));
      },
      separateDialCode: true,
      strictMode: true,
      utilsScript: "/intl-tel-input/js/utils.js?1716383386062"
   });

   function toggleErrorDisplay(errorElement, inputElement, message, isError) {
      inputElement.classList.toggle("form-block__input_error", isError);
      errorElement.textContent = message;
      errorElement.classList.toggle("form-block__error_show", isError);
   }

   function validateName() {
      const name = nameInput.value.trim();
      if (name === '') {
         displayError(nameError, nameInput, 'Ім\'я не введено', validateName);
         return false;
      }
      if (name.length < 3 || name.length > 25) {
         displayError(nameError, nameInput, "Ім'я повинно бути довше ніж 3 і коротше ніж 25 символів", validateName);
         return false;
      }
      toggleErrorDisplay(nameError, nameInput, "", false);
      return true;
   }

   function displayError(errorElement, inputElement, message, validationFunc) {
      toggleErrorDisplay(errorElement, inputElement, message, true);
      inputElement.removeEventListener('input', validationFunc);
      inputElement.addEventListener('input', validationFunc);
   }

   function restrictPhoneInput() {
      const telPattern = /^[0-9]{0,9}$/;
      if (!telPattern.test(telInput.value)) {
         telInput.value = telInput.value.slice(0, -1);
      }
   }

   function validateTel() {
      const tel = telInput.value;
      if (tel.length < 9) {
         displayError(telError, telInput, 'Введено менше 9 цифр.', validateTel);
         return false;
      }
      toggleErrorDisplay(telError, telInput, "", false);
      return true;
   }

   function validateEmail() {
      const email = emailInput.value;
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
         displayError(emailError, emailInput, 'Введено не коректний email.', validateEmail);
         return false;
      }
      toggleErrorDisplay(emailError, emailInput, "", false);
      return true;
   }

   function handleFormSubmit(event) {
      event.preventDefault();

      const isNameValid = validateName();
      const isPhoneValid = validateTel();
      const isEmailValid = validateEmail();

      if (isNameValid && isPhoneValid && isEmailValid) {
         const name = nameInput.value.trim();
         const tel = telInput.value;
         const email = emailInput.value;

         const countryData = iti.getSelectedCountryData();
         const countryCode = countryData.dialCode;

         const telegramToken = '7078886929:AAGuWow1nXrmjogw4WB8Wnn4q9WvQrGMRzs';
         const chatId = '1525791524';
         const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

         const text = `Ім'я: ${name}\nТелефон: ${countryCode}${tel}\nEmail: ${email}`;

         fetch(telegramUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               chat_id: chatId,
               text: text
            }),
         })
            .then(response => response.json())
            .then(data => {
               if (data.ok) {
                  alert('Повідомлення відправлено!');
                  form.reset();
               } else {
                  alert('Помилка при відправці повідомлення.');
               }
            })
            .catch((error) => {
               console.error('Помилка:', error);
               alert('Сталася помилка при відправці повідомлення.');
            });
      }
   }

   nameInput.addEventListener('blur', validateName);
   telInput.addEventListener('input', restrictPhoneInput);
   telInput.addEventListener('blur', validateTel);
   emailInput.addEventListener('blur', validateEmail);
   form.addEventListener('submit', handleFormSubmit);

});
