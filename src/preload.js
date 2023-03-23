const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const fs = require("fs");
const path = require("path");
const Toastify = require("toastify-js");
const { Buffer } = require("buffer");

contextBridge.exposeInMainWorld("os", {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("fs", {
  writePath: (filePath, buffer) =>
    fs.writeFile(filePath, buffer, () => {
      console.log("Video saved successfullly!");
    }),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld("Toastify", {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel) => ipcRenderer.send(channel),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("electron", {
  getSources: async () => await ipcRenderer.invoke("get-sources"),
  getFilePath: async () => await ipcRenderer.invoke("save-dialog"),
});

contextBridge.exposeInMainWorld("Buffer", {
  from: async (...args) => Buffer.from(...args),
});
