function playRecording() {
    var audio = document.getElementById("audio");
    var dropdownContent = document.getElementById("dropdown-content");

    audio.onended = function () {
        recordingButton.className = "fas fa-play fa-2x";
    };

    if (!dropdownContent.classList.contains("show")) {
        var recordingButton = document.getElementById("recording-button");
        if (recordingButton.className == "fas fa-play fa-2x") {
            audio.play();
            recordingButton.className = "fas fa-pause fa-2x";
        } else if (recordingButton.className == "fas fa-pause fa-2x") {
            recordingButton.className = "fas fa-play fa-2x";
            audio.pause();
        }
    } else {
        var recordingButtonDropdown = document.getElementById("dropdown-recording-button");
        if (recordingButtonDropdown.className == "fas fa-play fa-2x") {
            audio.play();
            recordingButtonDropdown.className = "fas fa-pause fa-2x";
        } else if (recordingButtonDropdown.className == "fas fa-pause fa-2x") {
            recordingButtonDropdown.className = "fas fa-play fa-2x";
            audio.pause();
        }
    }
}

function showDropdown() {
    var dropdownContent = document.getElementById("dropdown-content");

    if (dropdownContent.classList.contains("hide")) {
        dropdownContent.classList.remove("hide")
        dropdownContent.classList.add("show")
    } else {
        dropdownContent.classList.remove("show")
        dropdownContent.classList.add("hide")
    }
}