module.exports = {
		embed: false,

		init: function(onload_option) {
			if (onload_option.embed === "yes") {
				this.embed = true;
			}
		}
	};
