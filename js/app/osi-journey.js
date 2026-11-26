import { esc } from '../core/utils.js';

const LAYERS = [
  {n:7,name:'Application',pdu:'Data',color:'#8b5cf6',purpose:'Provides network services to applications.',examples:'HTTP / HTTPS, DNS, SMTP',sender:'The application creates the message and identifies the service it needs.',receiver:'The application receives the reconstructed data and presents it to the user.'},
  {n:6,name:'Presentation',pdu:'Data',color:'#0ea5e9',purpose:'Defines how application data is represented.',examples:'UTF-8, JSON, character encoding, compression, encryption formats',sender:'Data may be encoded, serialized, compressed or encrypted into a representation the receiver can understand.',receiver:'The receiver interprets the representation and, where applicable, decrypts or decompresses the content.'},
  {n:5,name:'Session',pdu:'Data',color:'#14b8a6',purpose:'Coordinates conversations and dialog between application endpoints.',examples:'Session setup, dialog control, checkpoints (conceptual OSI functions)',sender:'The communication context and dialog are coordinated. In modern TCP/IP stacks, these functions are often handled by applications or libraries.',receiver:'The conversation context is maintained so the application can continue the exchange.'},
  {n:4,name:'Transport',pdu:'Segment / Datagram',color:'#22c55e',purpose:'Provides process-to-process delivery using port numbers.',examples:'TCP, UDP',sender:'A transport header identifies source and destination ports. TCP can add sequence numbers, acknowledgements and reliability; UDP uses a smaller datagram header.',receiver:'The transport layer uses port numbers to deliver data to the correct application process. TCP also handles ordering and reliability.'},
  {n:3,name:'Network',pdu:'Packet',color:'#eab308',purpose:'Provides logical addressing and routing between networks.',examples:'IPv4, IPv6, ICMP',sender:'An IP header adds source and destination IP addresses so routers can forward the packet across networks.',receiver:'The destination host processes the IP packet and passes its payload up to the transport layer.'},
  {n:2,name:'Data Link',pdu:'Frame',color:'#f97316',purpose:'Transfers data across a local link using framing and link-layer addressing.',examples:'Ethernet, Wi-Fi (IEEE 802.11), VLAN',sender:'A link-layer header and trailer frame the packet for the next hop. A frame check sequence may detect transmission errors.',receiver:'The receiving interface checks the frame, removes link framing and passes the network-layer packet upward.'},
  {n:1,name:'Physical',pdu:'Bits',color:'#ef4444',purpose:'Moves raw bits as signals over a physical medium.',examples:'Copper, fibre, radio; Ethernet PHYs, Wi-Fi radio',sender:'The frame is represented as bits and transmitted as electrical, optical or radio signals.',receiver:'The interface detects signals and reconstructs the incoming bit stream for the data-link layer.'}
];

const PHASES = [
  ...LAYERS.map((l,i)=>({direction:'Sending',layer:7-i,title:'Encapsulation',description:l.sender})),
  ...LAYERS.slice().reverse().map((l,i)=>({direction:'Receiving',layer:l.n,title:'Decapsulation',description:l.receiver}))
];

export function renderOsiJourney(root) {
  let phase = 0;
  let selected = 7;
  let timer = null;
  let playing = false;
  const stop = () => { if (timer) clearInterval(timer); timer = null; playing = false; };
  const headerFor = (layer) => {
    const headers = {
      7:'Application message',
      6:'Representation metadata',
      5:'Session context',
      4:'TCP / UDP header',
      3:'IP header',
      2:'Ethernet / Wi-Fi header + FCS',
      1:'Signal encoding'
    };
    return headers[layer];
  };
  const stackFor = () => {
    if (phase < 7) {
      const completed = LAYERS.filter(l => l.n >= 7-phase);
      return completed.map(l => ({...l,tag:headerFor(l.n)}));
    }
    return LAYERS.map(l => ({...l,tag:headerFor(l.n)})).filter(l => l.n >= Math.max(1,14-phase));
  };
  const render = () => {
    const current = PHASES[phase];
    const layer = LAYERS.find(l=>l.n===selected);
    const stack = stackFor();
    root.innerHTML = `
      <div class="osi-journey">
        <a class="osi-back" href="#/">← Dashboard</a>
        <header class="osi-hero">
          <span class="osi-kicker">INTERACTIVE NETWORKING VISUALIZATION</span>
          <h1>Interactive OSI Layer Journey</h1>
          <p>Follow one message down the seven OSI layers at the sender, across the network, and back up the layers at the receiver.</p>
          <div class="osi-hero-tags"><span>7 layers</span><span>Encapsulation</span><span>Decapsulation</span><span>Step-by-step</span></div>
        </header>
        <section class="osi-message panel">
          <div class="osi-field"><label for="osi-message-input">Message to send</label><input id="osi-message-input" maxlength="120" value="${esc(root.dataset.osiMessage || 'Hello, BitSecure!')}" placeholder="Type a message"></div>
          <div class="osi-field"><label for="osi-destination-input">Destination</label><input id="osi-destination-input" maxlength="60" value="192.0.2.20" placeholder="Destination IP address"></div>
          <button type="button" class="btn osi-apply" data-action="apply">Apply message</button>
        </section>
        <section class="osi-progress panel">
          <div class="osi-progress-head"><div><span class="osi-kicker">MESSAGE JOURNEY</span><h2>${current.direction}: Layer ${current.layer} · ${LAYERS.find(l=>l.n===current.layer).name}</h2></div><span class="osi-step-count">Step ${phase+1} / ${PHASES.length}</span></div>
          <div class="osi-progress-track"><span style="width:${((phase+1)/PHASES.length)*100}%"></span></div>
          <div class="osi-controls">
            <button class="btn ghost" type="button" data-action="previous" ${phase===0?'disabled':''}>← Previous</button>
            <button class="btn" type="button" data-action="play">${playing?'Pause':'▶ Play journey'}</button>
            <button class="btn ghost" type="button" data-action="next" ${phase===PHASES.length-1?'disabled':''}>Next step →</button>
            <button class="btn ghost" type="button" data-action="reset">↺ Reset</button>
          </div>
        </section>
        <section class="osi-workspace">
          <div class="osi-layer-panel panel">
            <div class="osi-section-heading"><div><span class="osi-kicker">THE OSI MODEL</span><h2>Explore each layer</h2></div><small>Choose a layer</small></div>
            <div class="osi-layers" role="list">
              ${LAYERS.map(l=>`<button type="button" class="osi-layer ${l.n===current.layer?'is-current':''} ${l.n===selected?'is-selected':''}" data-layer="${l.n}" style="--layer-color:${l.color}" aria-pressed="${l.n===selected}"><span class="osi-layer-num">${l.n}</span><span class="osi-layer-copy"><b>${l.name}</b><small>${l.pdu}</small></span><span class="osi-layer-state">${l.n===current.layer?'●':''}</span></button>`).join('')}
            </div>
          </div>
          <div class="osi-detail-column">
            <article class="osi-detail panel">
              <span class="osi-kicker">LAYER INSPECTOR</span>
              <h2>Layer ${layer.n}: ${layer.name}</h2>
              <p>${layer.purpose}</p>
              <div class="osi-detail-block"><b>Common examples</b><span>${layer.examples}</span></div>
              <div class="osi-detail-block"><b>Protocol data unit</b><span>${layer.pdu}</span></div>
              <div class="osi-detail-block"><b>What happens at the sender</b><span>${layer.sender}</span></div>
              <div class="osi-detail-block"><b>What happens at the receiver</b><span>${layer.receiver}</span></div>
            </article>
            <article class="osi-live panel">
              <div class="osi-section-heading"><div><span class="osi-kicker">CURRENT STEP</span><h2>${current.title}</h2></div><span class="osi-direction">${current.direction}</span></div>
              <p>${current.description}</p>
              <div class="osi-payload"><small>ORIGINAL MESSAGE</small><code id="osi-payload-text">${esc(root.dataset.osiMessage || 'Hello, BitSecure!')}</code></div>
              <div class="osi-stack"><b>Encapsulation stack</b>${stack.length ? stack.map(l=>`<span style="--layer-color:${l.color}">${l.tag}</span>`).join('') : '<small>Application data is ready to be processed.</small>'}</div>
              <div class="osi-destination"><span>Sender</span><span class="osi-route-line"></span><span>Receiver</span></div>
            </article>
          </div>
        </section>
        <aside class="osi-note"><b>Important:</b> The OSI model is a conceptual reference. Real TCP/IP implementations do not always implement seven separate protocol layers; presentation and session functions are commonly part of applications or libraries, and the link layer may combine OSI Layers 1 and 2.</aside>
      </div>`;
    root.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>{selected=Number(button.dataset.layer);render();}));
    root.querySelector('[data-action="previous"]').addEventListener('click',()=>{stop();phase=Math.max(0,phase-1);render();});
    root.querySelector('[data-action="next"]').addEventListener('click',()=>{stop();phase=Math.min(PHASES.length-1,phase+1);render();});
    root.querySelector('[data-action="reset"]').addEventListener('click',()=>{stop();phase=0;selected=7;render();});
    root.querySelector('[data-action="play"]').addEventListener('click',()=>{
      if(playing){stop();render();return;}
      if(phase===PHASES.length-1) phase=0;
      playing=true;render();
      timer=setInterval(()=>{
        if(phase>=PHASES.length-1){stop();render();return;}
        phase++;render();
      },1800);
    });
    root.querySelector('[data-action="apply"]').addEventListener('click',()=>{
      root.dataset.osiMessage=root.querySelector('#osi-message-input').value.trim()||' ';
      render();
    });
  };
  render();
  return stop;
}
