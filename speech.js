// const recognition = new webkitSpeechRecognition();

// recognition.onresult = function(event) {
//     const transcript = event.results[0][0].transcript;
//     sendToBackend(transcript);
// };

// recognition.start();

document.addEventListener("DOMContentLoaded",()=>{
    const speech=document.getElementById("speech")

    speech.addEventListener("click",()=>{
        console.log("button clicked")
    })
})