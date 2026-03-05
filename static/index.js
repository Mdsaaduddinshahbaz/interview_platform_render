document.addEventListener("DOMContentLoaded",()=>{
    const startInterview=document.getElementById("startInterview")
    startInterview.addEventListener("click",()=>{
        console.log("clicked")
        window.location.href = "/meet";
    })
})