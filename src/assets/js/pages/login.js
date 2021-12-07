/*! login.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Login Process JS
========================================================================== */

Dropzone.autoDiscover = false;

$(document).ready(function () {

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };
    var userPool;
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    function createCognitoUser(email) {
        email = email.toLowerCase()
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    var loginButton = $("#signin");

    var submitButtonHandler = function (e, handlerEvent) {
        console.log('clicked');
        e.preventDefault();
        handlerEvent();
    }

    loginButton.on('click',function(e) {
        submitButtonHandler(e, handleLogin);
    });

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password,
        });
        var cognitoUser = createCognitoUser(email);
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure,
        });
    }

    //  To login 
    function handleLogin() {
        var email = $('#emailInputLogin').val();
        email = email.toLowerCase()
        var password = $('#passwordInputLogin').val();
        signin(email, password,
            function signinSuccess(response) {
                const data = response.idToken.payload;
                // const authToken = response.idToken.jwtToken;

                const storageObject = {
                    email,
                    name: data.name
                }
                localStorage.setItem('loggedInUser', JSON.stringify(storageObject));
                // localStorage.setItem('authToken', JSON.stringify(authToken));
                toasts.service.success('', 'mdi mdi-progress-check', 'Welcome!', 'bottomRight', 2500);
                setTimeout(() => {
                    window.location.pathname = `/home.html`;
                }, 2000);
            }, 

            function signinError(err) {
                if (err.code === 'UserNotConfirmedException') {
                    toasts.service.error('', 'mdi mdi-progress-check', err.message, 'bottomRight', 2500);
                    localStorage.setItem("verificationEmail", email);
                    // window.location.href = `verify.html`;
                } else {
                    toasts.service.error('', 'mdi mdi-progress-check', err.message, 'bottomRight', 2500);
                }
            }
        )
    };

})