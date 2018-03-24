const $id = function(id) {
  return document.getElementById(id);
};

const streamConnectForm = $id("streamConnectForm");
streamConnectForm.addEventListener("submit", function(e) {
  e.preventDefault();
});

const o = $id("output");
window.print = (s = "") => {
  o.innerHTML = s.replace(/\n/g, "<br>").replace(/\s/g, "&nbsp;");
};

$id("runButton").addEventListener("click", () => {
  try {
    eval(window.editor.getValue());
  } catch (err) {
    console.error(err);
  }
});

window.cb = (m) => {
  console.log(m);
};

window.onPriceUpdate = (h) => (window.cb = h);

const streamConnectButton = $id("streamConnectButton");

const renderStreamConnectButton = () => {
  const isOpen = ws.readyState === ws.OPEN;
  streamConnectButton.innerText = isOpen ? "Connected" : "Disconnected";
  streamConnectButton.className = `btn btn-${isOpen ? "success" : "danger"} my-2 my-sm-0`;
};

const ws = new WebSocket(`ws://${location.hostname}:${parseInt(location.port) + 1}`);
ws.addEventListener("open", renderStreamConnectButton);
ws.addEventListener("message", (m) => {
  // console.log(m);
  requestAnimationFrame(() => {
    // try {
    window.cb(JSON.parse(m.data));
    // }
    // catch (err) { }
    // })
  });
});
// ws.close();
