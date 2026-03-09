document.addEventListener("DOMContentLoaded", async () => {
    const startInterview = document.getElementById("startInterview")
    const sidebar = document.getElementById("list_previous_chats")
    const message_container = document.getElementById("chat_message")
    const evaluate_response = document.getElementById("triggerEvaluation")
    const overview_container = document.getElementById("overviewContainer")
    const Mistakes = document.getElementById("Mistakes")
    const Rating = document.getElementById("Rating")
    const Areas_to_Improve = document.getElementById("Areas_to_Improve")
    const Feedback = document.getElementById("Feedback")
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
            document.querySelectorAll(".inserted").forEach(div => {
                div.innerText = "";
            });
            // overview_container.innerHTML="";
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
                data.results.forEach(res => {
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
    evaluate_response.addEventListener("click", async () => {
        overview_container.style.visibility="visible"
        const messages = message_container.children
        const ls = [];
        
        let currentQA = {};

        for (let msg of messages) {

            const [speaker, text] = msg.innerText.split(": ");

            if (speaker === "Others") {
                // currentQA = { question: text };
                if (!currentQA.question) {
                    currentQA.question = text;
                } else {
                    if (currentQA.answer) {
                        ls.push(currentQA);
                        currentQA = {};
                        currentQA.question = text;
                    }
                    else
                        currentQA.question += "\n" + text;
                }
            } else {
                if (currentQA.question) {
                    if (!currentQA.answer) {
                        currentQA.answer = text;
                    } else {
                        currentQA.answer += "\n" + text;
                    }
                    // ls.push(currentQA);
                    // currentQA = {};
                }
            }

        }
        if (currentQA.question && currentQA.answer) {
            ls.push(currentQA);
        }
        api_key = localStorage.getItem("Gemini_api")
        console.log(ls);
        const res = await fetch(`/llm_call`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "user_chats": ls, "api": api_key }),
        });
        const data = await res.json();
        console.log(data.success)
        if (data.success) {
            console.log(data.result)
            ds = data.result[0]
            console.log(ds)
            Mistake = ds["Mistakes"]
            Areas_to_Improve_data = ds["Areas_to_Improve"]
            Rating_data = ds["Rating"]
            Feedback_data = ds["Feedback"]
            console.log(Mistake)
            console.log(Areas_to_Improve_data)
            console.log(Rating_data)
            console.log(Feedback_data)
            for (let msg of Mistake) {
                const div = document.createElement("div")
                div.className = "inserted"
                div.innerText += msg
                Mistakes.appendChild(div)
            }
            // rating
            const ratinng = document.createElement("div")
            ratinng.className = "inserted"
            ratinng.innerText = Rating_data + "/10"
            Rating.appendChild(ratinng)
            // Areas to Improve
            for (let msg of Areas_to_Improve_data) {
                const span = document.createElement("div")
                span.className = "inserted"
                span.innerText += msg
                Areas_to_Improve.appendChild(span)
            }
            //Feedback
            const Feedbacks = document.createElement("div")
            Feedbacks.classList.add("Feedback")
            Feedbacks.classList.add("inserted")
            Feedbacks.innerText = Feedback_data
            Feedback.appendChild(Feedbacks)
        }
        else {
            alert("Error Evaluating Responses")
        }
    })
})