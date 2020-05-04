// Operation.js

pzpr.classmgr.makeCommon({
	//---------------------------------------------------------
	"StartGoalOperation:Operation": {
		setData: function(prop, x1, y1, x2, y2) {
			this.property = prop;
			this.bx1 = x1;
			this.by1 = y1;
			this.bx2 = x2;
			this.by2 = y2;
		},
		decode: function(strs) {
			if (strs[0] !== "PS" && strs[0] !== "PG") {
				return false;
			}
			this.property = strs[0] === "PS" ? "start" : "goal";
			this.bx1 = +strs[1];
			this.by1 = +strs[2];
			this.bx2 = +strs[3];
			this.by2 = +strs[4];
			return true;
		},
		toString: function() {
			return [
				this.property === "start" ? "PS" : "PG",
				this.bx1,
				this.by1,
				this.bx2,
				this.by2
			].join(",");
		},

		isModify: function(lastope) {
			// 1回の入力でstartpos, goalposが連続して更新されているなら前回の更新のみ
			if (
				this.manager.changeflag &&
				lastope.bx2 === this.bx1 &&
				lastope.by2 === this.by1 &&
				lastope.property === this.property
			) {
				lastope.bx2 = this.bx2;
				lastope.by2 = this.by2;
				return true;
			}
			return false;
		},

		undo: function() {
			this.exec(this.bx1, this.by1);
		},
		redo: function() {
			this.exec(this.bx2, this.by2);
		},
		exec: function(bx, by) {
			var bd = this.board,
				cell = bd.getc(bx, by);
			if (this.property === "start") {
				bd.startpos.set(cell);
			} else if (this.property === "goal") {
				bd.goalpos.set(cell);
			}
		}
	}
});
