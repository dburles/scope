import './style.css';

const buffer = 1024;
const range = 500;

const svg = document.getElementById('svg');
svg.setAttribute('viewBox', `0 0 ${buffer} ${range}`);

const center = document.getElementById('center');
center.setAttribute('points', `0 ${range / 2} ${buffer} ${range / 2}`);

const fps = document.getElementById('fps');
fps.setAttribute('x', 5);
fps.setAttribute('y', range - 5);

let inputBuffer;
let initialized = false;

const handleSuccess = function (stream) {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(buffer, 1, 1);

  source.connect(processor);
  processor.connect(context.destination);

  processor.onaudioprocess = function (event) {
    inputBuffer = event.inputBuffer.getChannelData(0);
    if (!initialized) {
      initialize();
    }
  };
};

navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then(handleSuccess);

const line = document.getElementById('line');

let frames = 0;

const update = () => {
  frames += 1;
  const points = inputBuffer.map((n) => {
    return n < 0
      ? range / 2 + Math.round((Math.abs(n) * range) / 2)
      : range / 2 - Math.round((n * range) / 2);
  });

  const graph = [...points]
    .map((point, i) => {
      return `${i} ${point}`;
    })
    .join(' ');

  // if (frames % 10 === 1) {
  line.setAttribute('points', graph);
  // }

  window.requestAnimationFrame(update);
};

const initialize = () => {
  window.requestAnimationFrame(update);
  initialized = true;
};

setInterval(() => {
  fps.innerHTML = `FPS: ${frames}`;
  frames = 0;
}, 1000);
