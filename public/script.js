(function () {
    const loginRegisterFormNickName = [
        '<div class="enter-nickname">',
        '<input type="text" id="nickname" placeholder="NickName" />',
        "</div>",
    ].join("");

    const loginRegisterFormPassword = [
        '<div class="enter-nickname">',
        '<input type="password" id="password" placeholder="Password" />',
        "</div>",
    ].join("");

    const nextButton = [
        '<div class="next">',
        '<input type="button" id="next" value="Next" />',
        "</div>",
    ].join("");
    const submitButton = [
        '<div class="next">',
        '<input type="button" id="submit" value="Submit" />',
        "</div>",
    ].join("");

    const chat = [
        '<div class="main">',
        '<div class="users">',
        '<div id="active-users">',
        "</div>",
        "</div>",
        '<div class="container">',
        "<div>",
        '<div class="chat">',
        '<div id="chat-body"></div>',
        "</div>",
        '<div class="new-message">',
        '<div class="message-input">',
        '<div id="messageTextbox" contenteditable="true" class="message-textbox"></div>',
        "</div>",
        '<div class="send-message-btn">',
        '<div class="send-btn" id="send-btn"><i class="fa fa-send"></i></div>',
        "</div>",
        "</div>",
        "</div>",
        "</div>",
        "</div>",
    ].join("");

    const authUser = () => {
        document.body.innerHTML = chat;

        let myScript = document.createElement("script");
        myScript.setAttribute("src", `http://${location.host}/chat.js`);
        myScript.setAttribute("async", "false");

        let head = document.head;
        head.insertBefore(myScript, head.firstElementChild);
    };

    let jwt = window.localStorage.getItem("jwt");
    if (!!jwt) {
        authUser();
        return;
    }
    window.localStorage.clear();
    const data = {};
    const mainDiv = document.createElement("div");
    mainDiv.id = "main";
    document.body.appendChild(mainDiv);
    mainDiv.innerHTML = loginRegisterFormNickName + nextButton;
    document.getElementById("next").addEventListener("click", function () {
        let nickname = document.getElementById("nickname").value;
        if (!nickname) {
            alert("Enter Nickname");
            return;
        }
        data.nickname = nickname;
        mainDiv.innerHTML = loginRegisterFormPassword + submitButton;
        document.getElementById("submit").addEventListener("click", function () {
            let password = document.getElementById("password").value;
            if (!password) {
                alert("Enter Password");
                return;
            }
            data.password = password;
            document.body.innerHTML = "";
            const url = "http://localhost:8080/login-or-register";
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((res) => res.json())
                .then((resjson) => {
                    if (resjson.status === 200) {
                        authUser();
                        window.localStorage.setItem("nickname", resjson.user.nickname);
                        window.localStorage.setItem("userId", resjson.user.id);
                        window.localStorage.setItem("jwt", resjson.user.jwt);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    alert("Something Went Wrong");
                });
        });
    });
})();
