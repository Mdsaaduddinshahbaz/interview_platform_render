document.addEventListener("DOMContentLoaded", () => {
    const startInterview = document.getElementById("startInterview")
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