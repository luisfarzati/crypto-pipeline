const noop = () => {};

const $id = function(id) {
  return document.getElementById(id);
};

$id("streamConnectForm").addEventListener("submit", function(e) {
  e.preventDefault();
});

let isRunning = false;
let errored = false;

const runButton = $id("runButton");
runButton.addEventListener("click", () => {
  if (isRunning) {
    window.cb = noop;
    isRunning = false;
    renderRunButton();
    return;
  }

  try {
    isRunning = true;
    errored = false;
    renderRunButton();
    eval(window.editor.getValue());
  } catch (err) {
    console.error(err);
  }
});

const renderRunButton = () => {
  runButton.innerText = isRunning ? "Stop" : "Run";
  runButton.className = `btn btn-${isRunning ? "danger" : "primary"}`;
};

$id("saveButton").addEventListener("click", () => {
  try {
    localStorage.setItem("editorValue", window.editor.getValue());
  } catch (error) {
    console.error(error);
  }
});

$id("cleanButton").addEventListener("click", () => {
  try {
    // localStorage.removeItem("editorValue");
    window.editor.setValue("onPriceUpdate((data) => {\n};");
  } catch (error) {
    console.error(error);
  }
});

const streamConnectButton = $id("streamConnectButton");

const renderStreamConnectButton = () => {
  const isOpen = ws.readyState === ws.OPEN;
  streamConnectButton.innerText = isOpen ? "Connected" : "Disconnected";
  streamConnectButton.className = `btn btn-${isOpen ? "success" : "danger"} my-2 my-sm-0`;
};

const o = $id("printContainer");
window.print = (s = "") => {
  o.textContent = o.textContent.concat(s);
};
window.clear = () => {
  o.textContent = "";
};

window.cb = noop;

window.onPriceUpdate = (h) => (window.cb = h);

// auto-connect
const ws = new WebSocket(`ws://${location.hostname}:${parseInt(location.port) + 1}`);
ws.addEventListener("open", renderStreamConnectButton);
ws.addEventListener("message", (m) => {
  if (errored) return;

  requestAnimationFrame(() => {
    try {
      window.cb(JSON.parse(m.data));
    } catch (err) {
      errored = true;
      isRunning = false;
      renderRunButton();
      console.error(err);
      console.log(m.data);
    }
  });
});
