const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  Menu,
  dialog,
} = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

//Initialize global scope for mainwindow
let mainWindow;

//Check if the platform is a mac or windows
const isMac = process.platform === "darwin";

//Check if in development or production to show devtools
const isDev = process.env.NODE_ENV !== "production";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: isDev ? 1000 : 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  await mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools if in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);

app.whenReady().then(() => {
  createWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //Remove mainwindow from memory on close
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

//Respond to ipcRenderer requests

//Get video sources
ipcMain.handle("get-sources", async () => {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      const { id, name } = source;
      return {
        label: source.name,
        click: () =>
          mainWindow.webContents.send("select-source", {
            id,
            name,
          }),
      };
    })
  );

  videoOptionsMenu.popup();
});

//Menu
const menu = [
  {
    role: "fileMenu",
  },
];

//Open save dialog
ipcMain.handle("save-dialog", async () => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: `vid-${Date.now()}.webm`,
  });
  return filePath;
  // mainWindow.webContents.send("file-path", filePath);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
