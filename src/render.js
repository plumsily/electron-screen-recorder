//Record and save video
let mediaRecorder;
let recordedChunks = [];

//Buttons
const videoElement = document.querySelector("video");

const startBtn = document.getElementById("startBtn");
startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Recording";
  recordedChunks = [];
};

const stopBtn = document.getElementById("stopBtn");
stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};

const videoSelectBtn = document.getElementById("videoSelectBtn");

//Event handling
videoSelectBtn.onclick = getVideoSources;

//Get the video sources / windows
async function getVideoSources() {
  electron.getSources();

  // const videoOptionsMenu = menu.buildFromTemplate(inputSources);

  // menu.setApplicationMenu(videoOptionsMenu);
  // // console.log(videoOptionsMenu);

  // videoOptionsMenu.popup();
}

//Handle command from main
ipcRenderer.on("select-source", async ({ id, name }) => {
  videoSelectBtn.innerText = name;
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: id,
      },
    },
  };
  // Create a Stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  //Create the media recorder
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);

  //Register event handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
});

//Captures all recorded chunks
const handleDataAvailable = (e) => {
  console.log("Video data available!");
  recordedChunks.push(e.data);
};

//Saves the video file on stop
const handleStop = async (e) => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  const buffer = await Buffer.from(await blob.arrayBuffer());
  console.log(buffer);

  // ipcRenderer.send("save-dialog");
  const filePath = await electron.getFilePath();

  // const { filePath } = await dialog.showSaveDialog({
  //   buttonLabel: 'Save video',
  //   defaultPath: `vid-${Date.now()}.webm`
  // });

  if (filePath) {
    fs.writePath(filePath, buffer);
  }
};
