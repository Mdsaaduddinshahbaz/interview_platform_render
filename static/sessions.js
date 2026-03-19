const recognition = new webkitSpeechRecognition();
const userResponse = document.getElementById("userresponse")
const person1Container = document.getElementById("container");
const dialogue_container=document.getElementById("dialogue")
function generateUserID() {
    return crypto.randomUUID();
}
// const recognition = new webkitSpeechRecognition();

// recognition.onresult = function(event) {
//     const transcript = event.results[0][0].transcript;
//     sendToBackend(transcript);
// };

// recognition.start();
const socket = io();
const meet_id = window.location.pathname.split("/").pop();
let joined=false;
socket.on("connect", async () => {
    user_id = localStorage.getItem("userId")
    username=localStorage.getItem("username")
    // const res = await fetch(`/validate_meet`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ "participants": [user_id] }),
    // });
    // const data = await res.json();
    // //console.log(data.success)
    // if(data.success){
    //     //console.log(data.meet_id)
    // }
    // else {
    //     alert("theres some problem")
    //     window.location.href="/home"
    // }
    if (!joined) {
        socket.emit("join", {meet_id: meet_id,userid: user_id,username: username});
        joined = true;
    }
    // socket.emit("join", { meet_id: meet_id, userid: user_id ,username:username});
});
socket.on("receive_message", function (data) {
    const container = document.createElement("container");
    container.className = "userresponsecontainer"
    const div = document.createElement("div");
    currentUserId = localStorage.getItem("userId")
    //console.log("currentid"+" "+currentUserId)
    //console.log("userid"+" "+data.userId)
    if (currentUserId === data.userId) {
        div.className = "userresponse";
        div.className = "right"
        div.innerText = "You" + ": " + data.message;
        container.appendChild(div);
        document.body.append(container)
    }
    else {
        div.className = "userresponse";
        div.className = "left"
        div.innerText = "Interviewer" + ": " + data.message;
        container.appendChild(div);
        document.body.append(container)
    }
    dialogue_container.style.marginTop="10px"
    // container.appendChild(div);
});
// recognition.onresult = function(event) {
//     const transcript = event.results[0][0].transcript;
//     socket.emit("send_message", {
//         meet_id: meet_id,
//         sender: "User",
//         message: transcript
//     });
// };
//console.log("button clicked")
// let userId = localStorage.getItem("userId");

// if (!userId) {
//     userId = generateUserID();
//     localStorage.setItem("userId", userId);
// }
recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    console.log(transcript);

    // const container = document.createElement("person1");
    // const divs = document.createElement("div");
    // divs.className = "userresponse";
    // container.className="person1"
    // divs.innerText = transcript;

    // container.appendChild(divs);
    // document.body.appendChild(container)
    userId = localStorage.getItem("userId");
    //console.log(userId)

    socket.emit("send_message", {
        meet_id: meet_id,
        userId: userId,
        sender: "User",
        message: transcript
    });
};
// recognition.onresult = function(event) {
//     const transcript = event.results[0][0].transcript;
//     //console.log(transcript)
//     // userResponse.innerText += transcript;
//     const divs=document.createElement("div")
//     divs.className = "userresponse";
//     divs.innerText+=transcript

//     container.appendChild(divs);
// };
document.addEventListener("DOMContentLoaded", () => {
    const speech = document.getElementById("speech")

    speech.addEventListener("click", () => {
        recognition.start();
    })
})
