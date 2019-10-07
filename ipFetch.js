fetchIPs = () => {
  let ips = [undefined, undefined, undefined];

  let RTCPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;

  // Run in iFrame if webrtc is blocked
  if (!RTCPeerConnection) {
    RTCPeerConnection =
      iframe.contentWindow.RTCPeerConnection ||
      iframe.contentWindow.mozRTCPeerConnection ||
      iframe.contentWindow.webkitRTCPeerConnection;
  }

  const servers = {
    iceServers: [{ urls: iceServer }]
  };

  const rtc = new RTCPeerConnection(servers);
  rtc.createDataChannel("rtc");

  parseCandidate = candidate => {
    if (debug) console.log("Parsing candidate: ", candidate);
    const match = ipRegex.public.exec(candidate);
    if (match) {
      var address = match[0];

      if (address.match(ipRegex.local)) ips[0] = address;
      else if (address.match(ipRegex.ipv6)) ips[2] = address;
      else ips[1] = address;
      display();
    }
  };

  rtc.onicecandidate = ice => {
    if (ice.candidate) parseCandidate(ice.candidate.candidate);
  };

  rtc.createOffer(
    result => {
      if (debug) console.log("SDP offer successful. Result: ", result);
      rtc.setLocalDescription(result);
      var lines = rtc.localDescription.sdp.split("\n");
      lines.forEach(line => {
        if (line.indexOf("a=candidate:") === 0) parseCandidate(line);
      });
    },
    () => {
      if (debug) console.warn("SDP offer failed");
    }
  );

  display = () => {
    for (var i = 0; i < 3; i++) {
      document.getElementsByTagName("li")[i].innerHTML = ips[i]
        ? ips[i]
        : "Not found";
    }
  };
};

fetchIPs();
