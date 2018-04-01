const $id = function (id) {
  return document.getElementById(id);
};

const streamConnectForm = $id("streamConnectForm");
streamConnectForm.addEventListener("submit", function (e) {
  e.preventDefault();
});

const o = $id("printContainer");
window.print = (s = "") => {
  o.textContent = o.textContent.concat(s);
};
window.clear = () => {
  o.textContent = "";
};

$id("runButton").addEventListener("click", () => {
  try {
    eval(window.editor.getValue());
  } catch (err) {
    console.error(err);
  }
});

$id("saveButton").addEventListener("click", () => {
  try {
    localStorage.setItem("editorValue", window.editor.getValue());
  } catch (error) {
    console.error(error)
  }
});

$id("loadButton").addEventListener("click", () => {
  try {
    window.editor.setValue(localStorage.getItem("editorValue"));
  } catch (error) {
    console.error(error)
  }
});

$id("cleanButton").addEventListener("click", () => {
  try {
    localStorage.removeItem("editorValue");
  } catch (error) {
    console.error(error)
  }
});

window.cb = (m) => {
  clear();
  print(JSON.stringify(m));
};

window.onPriceUpdate = (h) => (window.cb = h);

const streamConnectButton = $id("streamConnectButton");

const renderStreamConnectButton = () => {
  const isOpen = ws.readyState === ws.OPEN;
  streamConnectButton.innerText = isOpen ? "Connected" : "Disconnected";
  streamConnectButton.className = `btn btn-${isOpen ? "success" : "danger"} my-2 my-sm-0`;
};

let errored = false;

// auto-connect
const ws = new WebSocket(`ws://${location.hostname}:${parseInt(location.port) + 1}`);
ws.addEventListener("open", renderStreamConnectButton);
ws.addEventListener("message", (m) => {
  // console.log(m);
  requestAnimationFrame(() => {
    try {
      errored || window.cb(JSON.parse(m.data));
    } catch (err) {
      errored = true;
      console.error(err);
      console.log(m.data);
    }
  });
});
// ws.close();
