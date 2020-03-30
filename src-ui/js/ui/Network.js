(function() {
	ui.network = {
		ws: null,
		mode: "",
		key: "",
		maxSeen: -1,

		configure: function(mode, key) {
			this.mode = mode;
			this.key = key;
			ui.setdisplay("network");
		},

		start: function() {
			if (!this.mode) {
				return;
			}

			var loc = window.location;
			var wsurl = "ws://";
			if (document.location.protocol === "https:") {
				wsurl = "wss://";
			}
			wsurl = wsurl + loc.host + "/game/" + this.key;

			this.ws = new WebSocket(wsurl);
			this.ws.onclose = this.onclose;
			this.ws.onmessage = this.onmessage;
		},

		onCellOp: function(op) {
			if (!!this.ws) {
				this.ws.send(op);
			}
		},

		onclose: function(event) {
			ui.network.start();
		},

		onmessage: function(event) {
			var msg = JSON.parse(event.data);
			var id = msg.id;
			if (id > ui.network.maxSeen) {
				ui.network.maxSeen = id;
				ui.network.applyOp(msg.operation);
			}
		},

		applyOp: function(encOp) {
			var op = new ui.puzzle.klass.ObjectOperation();
			op.decode(encOp.split(","));
			op.external = true;

			ui.puzzle.opemgr.disableRecord();
			op.redo();
			ui.puzzle.opemgr.enableRecord();

			ui.puzzle.opemgr.newOperation();
			ui.puzzle.opemgr.add(op);
		}
	};
})();
