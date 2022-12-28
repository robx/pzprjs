// Piece.js

pzpr.classmgr.makeCommon({
	//---------------------------------------------------------
	"StartGoalAddress:Address": {
		type: "",
		partner: null,

		init: function(bx, by) {
			this.bx = bx;
			this.by = by;
			return this;
		},

		input: function(cell) {
			if (!this.partner || !this.partner.equals(cell)) {
				if (!this.equals(cell)) {
					this.set(cell);
				} else {
					this.draw();
				}
			} else {
				this.board.exchangestartgoal();
			}
		},
		set: function(pos) {
			var pos0 = this.getaddr();
			this.addOpe(pos.bx, pos.by);

			this.bx = pos.bx;
			this.by = pos.by;

			pos0.draw();
			this.draw();
		},

		addOpe: function(bx, by) {
			if (this.bx === bx && this.by === by) {
				return;
			}
			this.puzzle.opemgr.add(
				new this.klass.StartGoalOperation(this.type, this.bx, this.by, bx, by)
			);
		}
	},
	"StartAddress:StartGoalAddress": {
		type: "start"
	},
	"GoalAddress:StartGoalAddress": {
		type: "goal"
	}
});
