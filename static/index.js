document.addEventListener("DOMContentLoaded", async () => {
    let uid = localStorage.getItem("userId")
    if (!uid) window.location.href = "/login"
    const startInterview = document.getElementById("startInterview")
    const sidebar = document.getElementById("list_previous_chats")
    const message_container = document.getElementById("chat_message")
    const evaluate_response = document.getElementById("triggerEvaluation")
    const overview_container = document.getElementById("overviewContainer")
    const overview_heading = document.getElementById("overviewHeading")
    const save_key = document.getElementById("GeminiAPI")
    const api_value = document.getElementById("apikey")
    const api_container = document.getElementById("Gemini")
    const loading = document.getElementById("loading")
    const Mistakes = document.getElementById("Mistakes")
    const Rating = document.getElementById("Rating")
    const Areas_to_Improve = document.getElementById("Areas_to_Improve")
    const Feedback = document.getElementById("Feedback")
    const deletebtn = document.getElementById("deletebtn")
    const footer = document.getElementById("footer")
    userid = localStorage.getItem("userId")
    const res = await fetch(`/list_meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "userid": userid }),
    });

    const data = await res.json();
    //console.log(data)
    if (data.success) {
        const username = localStorage.getItem("username")
        data.results.forEach(res => {
            let meeting_container = document.createElement('div')
            let meeting = document.createElement('button')
            meeting.className = "meets"
            meeting_container.className = "meet_container"
            for (let partcipant_name of res.participants_name) {
                //console.log(partcipant_name)
                if (username !== partcipant_name) {
                    meeting.innerText = "interview with " + partcipant_name
                }
            }
            evaluate_response.setAttribute("is_evaluated", res.is_evaluated)
            meeting.setAttribute("is_evaluated", res.is_evaluated)
            meeting.setAttribute("meet_id", res.meet_id)
            // meeting.innerText = res.meet_id
            meeting_container.appendChild(meeting)
            let deletebtn = document.createElement("button")
            deletebtn.id = "deletebtn"
            deletebtn.innerHTML = "<img src='../static/delete_icon.svg'>"
            // sidebar.appendChild(meeting)
            meeting_container.appendChild(deletebtn)
            sidebar.appendChild(meeting_container)
        });
    }
    else {
        let meeting = document.createElement('div')
        meeting.innerText = "ERROR WHILE LOADING CHATS"
        sidebar.appendChild(meeting)
    }
    // const meet_btn=document.getElementsByClassName("meetsssss")
    // deletebtn.addEventListener("click", async (e) => {
    //     if (e.target.id.includes("meets")) {
    //         //console.log(e.target.innerText)
    //     }
    // })
    sidebar.addEventListener("click", async (e) => {
        if (e.target.closest("#deletebtn")) {

            const container = e.target.closest(".meet_container")
            const meetId = container.querySelector(".meets").getAttribute("meet_id")
            //console.log(meetId)
            const res = await fetch(`/delete_meeting`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "meetid": meetId }),
            });
            const data = await res.json();
            //console.log(data.success)
            if (data.success) {
                alert("meet with " + meetId + " got deleted")
                container.remove()
            }
        }
        if (e.target.classList.contains("meets")) {
            message_container.innerHTML = "";
            overview_container.style.visibility = "hidden"
            document.querySelectorAll(".inserted").forEach(div => {
                div.innerText = "";
            });
            // overview_container.innerHTML="";
            //console.log("Meeting clicked:", e.target.innerText);
            const meetid = e.target.getAttribute("meet_id");
            const is_evaluated = e.target.getAttribute("is_evaluated")
            //console.log("is_evaluated" + is_evaluated)

            const res = await fetch(`/list_messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "meetid": meetid, "is_evaluated": is_evaluated }),
            });
            const data = await res.json();
            //console.log(data.llm_results)
            if (data.success) {

                evaluate_response.setAttribute("meet_id", meetid)
                //console.log(data.results)
                currentUserId = localStorage.getItem("userId")
                //console.log("currentid" + " " + currentUserId)
                data.results.forEach(res => {
                    const container = document.createElement("container");
                    container.className = "userresponsecontainer"
                    const div = document.createElement("div");
                    //console.log("userid" + " " + res.sender_id)
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
                        div.innerText = "Interviewer" + ": " + res.text;
                        container.appendChild(div);
                        // document.body.append(container)
                    }
                    message_container.appendChild(container)
                })
                    if (is_evaluated === "true") {
                        //console.log("true")
                        // evaluate_response.style.visibility = "hidden"
                        footer.style.display = "none"
                        overview_container.style.visibility = "visible"
                        overview_heading.innerText = "Overview"
                        loading.style.visibility = "hidden"
                        // //console.log(data.result)
                        ds = data.llm_results
                        //console.log(ds)
                        Mistake = ds["mistakes"]
                        Areas_to_Improve_data = ds["Areas_to_improve"]
                        Rating_data = ds["Rating"]
                        Feedback_data = ds["Feedback"]
                        //console.log(Mistake)
                        //console.log(Areas_to_Improve_data)
                        //console.log(Rating_data)
                        //console.log(Feedback_data)
                        for (let msg of Mistake) {
                            const div = document.createElement("div")
                            div.className = "inserted"
                            div.innerText += "--> " + msg
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
                        evaluate_response.style.visibility = "visible"
                        footer.style.display = "block"
                    }
                    // message_container.appendChild(container)
                    // evaluate_response.style.visibility = "visible"
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
        //console.log("clicked")
        user_id = localStorage.getItem("userId")
        username = localStorage.getItem("username")
        //console.log(username)
        const res = await fetch(`/validate_meet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "participants_name": [username], "participants": [user_id] }),
        });
        const data = await res.json();
        //console.log(data.success)
        if (data.success) {
            //console.log(data.meet_id)
            // socket.emit("join", { meet_id: data.meet_id, userid: user_id });
            window.location.href = `/meet/${data.meet_id}`;
        }
        else {
            alert("theres some problem")
            window.location.href = "/home"
        }
        // window.location.href = "/meet";
    })
    save_key.addEventListener("click", async () => {
        const key = api_value.value
        const userid = localStorage.getItem("userId")
        //console.log(key)
        const res = await fetch("/save_key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "userid": userid, "api_key": key }),
        })
        const data = await res.json();
        //console.log(data.success)
        if (data.success) {
            localStorage.setItem("Gemini_api", key)
            alert("key saved successfully please click evaluate response button again")
            api_container.style.visibility = "hidden"
        }
        else {
            alert("some error has occured please retry")
        }

    })
    evaluate_response.addEventListener("click", async () => {

        evaluate_response.style.visibility = "hidden"
        const api = localStorage.getItem("Gemini_api")
        if (!api) {
            api_container.style.visibility = "visible"
        }
        else {
            overview_heading.innerText = "Evaluating"
            overview_container.style.visibility = "visible"
            const messages = message_container.children
            const ls = [];

            let currentQA = {};

            for (let msg of messages) {

                const [speaker, text] = msg.innerText.split(": ");
                //console.log(text)
                if (speaker === "Interviewer") {
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
            //console.log(currentQA)
            if (currentQA.question && currentQA.answer) {
                ls.push(currentQA);
            }
            api_key = localStorage.getItem("Gemini_api")
            //console.log(ls);
            const meet_id = evaluate_response.getAttribute("meet_id")
            const res = await fetch(`/llm_call`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "user_chats": ls, "api": api_key, "meetid": meet_id }),
            });
            const data = await res.json();
            //console.log(data)
            if (data.success) {
                footer.style.display="none"
                overview_heading.innerText = "Overview"
                loading.style.visibility = "hidden"
                //console.log(data.result)
                ds = data.result[0]
                //console.log(ds)
                Mistake = ds["Mistakes"]
                Areas_to_Improve_data = ds["Areas_to_Improve"]
                Rating_data = ds["Rating"]
                Feedback_data = ds["Feedback"]
                //console.log(Mistake)
                //console.log(Areas_to_Improve_data)
                //console.log(Rating_data)
                //console.log(Feedback_data)
                for (let msg of Mistake) {
                    const div = document.createElement("div")
                    div.className = "inserted"
                    div.innerText += "--> " + msg
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
                evaluate_response.style.visibility = "visible"
                footer.style.display="block"
                alert("Error Evaluating Responses")
            }
        }
    })
})
