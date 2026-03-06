document.addEventListener("DOMContentLoaded", async () => {
    const startInterview = document.getElementById("startInterview")
    const sidebar = document.getElementById("list_previous_chats")
    const message_container = document.getElementById("chat_message")
    userid = localStorage.getItem("userId")
    const res = await fetch(`/list_meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "userid": userid }),
    });

    const data = await res.json();
    console.log(data.success)
    if (data.success) {
        data.results.forEach(res => {
            let meeting_container = document.createElement('div')
            let meeting = document.createElement('button')
            meeting.className = "meets"
            meeting_container.className = "meet_container"
            meeting.innerText = res.meet_id
            meeting_container.appendChild(meeting)
            // sidebar.appendChild(meeting)
            sidebar.appendChild(meeting_container)
        });
    }
    else {
        let meeting = document.createElement('div')
        meeting.innerText = "ERROR WHILE LOADING CHATS"
        sidebar.appendChild(meeting)
    }
    // const meet_btn=document.getElementsByClassName("meetsssss")
    sidebar.addEventListener("click", async (e) => {
        if (e.target.classList.contains("meets")) {
            message_container.innerHTML = "";
            console.log("Meeting clicked:", e.target.innerText);
            const res = await fetch(`/list_messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "meetid": e.target.innerText }),
            });
            const data = await res.json();
            console.log(data.success)
            if (data.success) {
                console.log(data.results)
                currentUserId = localStorage.getItem("userId")
                console.log("currentid" + " " + currentUserId)
                data.results.forEach(res=>{
                    const container = document.createElement("container");
                    container.className = "userresponsecontainer"
                    const div = document.createElement("div");
                    console.log("userid" + " " + res.sender_id)
                    if (currentUserId === res.sender_id) {
                    div.className = "userresponse";
                    div.className = "right"
                    div.innerText = "You" + ": " + res.text;
                    container.appendChild(div);
                    // document.body.append(container)
                }
                else {
                    div.className = "userresponse";
                    div.className = "left"
                    div.innerText = "Others" + ": " + res.text;
                    container.appendChild(div);
                    // document.body.append(container)
                }
                message_container.appendChild(container)
                })
                // if (currentUserId === data.sender_id) {
                //     div.className = "userresponse";
                //     div.className = "right"
                //     div.innerText = "You" + ": " + data.text;
                //     container.appendChild(div);
                //     // document.body.append(container)
                // }
                // else {
                //     div.className = "userresponse";
                //     div.className = "left"
                //     div.innerText = "Others" + ": " + data.text;
                //     container.appendChild(div);
                //     // document.body.append(container)
                // }
                // message_container.appendChild(container)
            }
            else {
                alert("Failed fetching chats")
            }
        }
    });
    startInterview.addEventListener("click", async () => {
        console.log("clicked")
        user_id = localStorage.getItem("userId")
        const res = await fetch(`/validate_meet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "participants": [user_id] }),
        });
        const data = await res.json();
        console.log(data.success)
        if (data.success) {
            console.log(data.meet_id)
            // socket.emit("join", { meet_id: data.meet_id, userid: user_id });
            window.location.href = `/meet/${data.meet_id}`;
        }
        else {
            alert("theres some problem")
            window.location.href = "/home"
        }
        // window.location.href = "/meet";
    })
})