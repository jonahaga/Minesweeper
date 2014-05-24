$(document).ready(function() {
	
	var Field = {
		el: $('#field'),
		matrix: [[]],
		reset: function() {
			this.el.find('.uncovered').removeClass('uncovered').addClass('covered');
			this.el.find('.size1of8 div').empty();
			this.layMines();
			Controls.resetTimer();
		},
		init: function() {
			var x = 0;
			var y = 0;
			var matrix = this.matrix;
			
			this.el.find('.covered').each(function(index, cell) {
				x = index % 8;
				y = Math.floor(index / 8);
				
				if (!matrix[x]) {
					matrix.push([]);
				}
				matrix[x].push(cell);
				var cellData = {
					hasMine: false,
					x: x,
					y: y
				};
				$(cell).data(cellData);
			});

			this.el.find('.covered').click(this.clickedCell);

			this.layMines();

			this.el.find('.covered').mouseenter(function() {
				$('.hover').removeClass('hover');
				$(this).addClass('hover');
			});
			this.el.find('.covered').mouseout(function() {
				$(this).removeClass('hover');
			});
			$('body').keypress(function(event) {
				if (String.fromCharCode(event.which) == 'h') {
					event.preventDefault();
					Field.cheat();
				}
			});
		},
		clickedCell: function() {
			var data = $(this).data();
			var matrix = Field.matrix;
			Controls.startTimer();
			
			if (data.hasMine) {
				Controls.stopTimer();
				$(this).addClass('mine');
				if(!Field.isGameOver()){
					$(this).addClass('mine-end');
				}
				Field.el.find('.size1of8 div').each(function(index, cell) {
					Field.setCellNumber(cell, true);
					$('.smiley').css('background-image', 'url(img/smiley_dead.png)');
					$('.smiley').css('background-repeat', 'no-repeat');
				});
				return;
			}
			
			Field.setCellNumber(this, true);
			Field.revealEmpty(data.x, data.y);
			Field.el.find('.covered').each(function(index, cell) {
				$(cell).data('visited', false);
			});
		},
		setCellNumber: function(cell, doUncover) {
			var $cell = $(cell);
			
			if ($cell.data('hasMine')){
				$cell.html('<span class="mine">&nbsp;</span>');
			}
			else if ($cell.data('mineCount') === 0) {
				$cell.html('<span>&nbsp;</span>');
			}
			else if ($cell.data('mineCount') === 1) {
				$cell.html('<span class="blue">' + $cell.data('mineCount') + '</span>');
			}
			else if ($cell.data('mineCount') === 2) {
				$cell.html('<span class="green">' + $cell.data('mineCount') + '</span>');
			}
			else if ($cell.data('mineCount') === 3) {
				$cell.html('<span class="red">' + $cell.data('mineCount') + '</span>');
			}
			else if ($cell.data('mineCount') > 3) {
				$cell.html('<span class="purple">' + $cell.data('mineCount') + '</span>');
			}
			else {
				$cell.html('<span>' + $cell.data('mineCount') + '</span>');
			}
			if (doUncover && !Field.isGameOver()) {
				$cell.removeClass('covered').addClass('uncovered');
			}
		},
		revealEmpty: function(x, y) {
			var matrix = Field.matrix;
			if (x > 7 || x < 0 || y > 7 || y < 0) {
				return false;
			}
			var cell = $(matrix[x][y]);
			if (cell.data('visited')) {
				return;
			}

			Field.setCellNumber(cell, true);
			cell.data('visited', true);

			if (cell.data('mineCount') === 0) {
				Field.revealEmpty(x-1, y-1);
				Field.revealEmpty(x-1, y);
				Field.revealEmpty(x-1,y+1);
				Field.revealEmpty(x,y-1);
				Field.revealEmpty(x,y+1);
				Field.revealEmpty(x+1,y-1);
				Field.revealEmpty(x+1,y);
				Field.revealEmpty(x+1,y+1);
			}
		},
		setMineCount: function(x, y) {
			var mineCount = 0;
			var matrix = Field.matrix;
			function cellHasMine(x, y) {
				if (x > 7 || x < 0 || y > 7 || y < 0) {
					return false;
				}
				return $(matrix[x][y]).data('hasMine');
			}
			
			// count the surrrounding mines
			if (cellHasMine(x-1,y-1)) {
				mineCount += 1;
			}
			if (cellHasMine(x-1,y)) {
				mineCount += 1;
			}
			if (cellHasMine(x-1,y+1)) {
				mineCount += 1;
			}
			if (cellHasMine(x,y-1)) {
				mineCount += 1;
			}
			if (cellHasMine(x,y+1)) {
				mineCount += 1;
			}
			if (cellHasMine(x+1,y-1)) {
				mineCount += 1;
			}
			if (cellHasMine(x+1,y)) {
				mineCount += 1;
			}
			if (cellHasMine(x+1,y+1)) {
				mineCount += 1;
			}

			$(matrix[x][y]).data('mineCount', mineCount);
		},
		layMines: function() {
			this.el.find('.covered').each(function(index, cell) {
				$(cell).data('hasMine', false);
			});

			var numMines = 0;
			var totalMines = 10;
			while(numMines < totalMines){
				var index = Math.floor(Math.random() * 63);
				var x = index % 8;
				var y = Math.floor(index / 8);
				var cell = this.matrix[x][y];
				if (!$(cell).data('hasMine')){
					$(cell).data('hasMine', true);
					numMines += 1;
				}
			}

			this.el.find('.covered').each(function(index, cell) {
				var x = index % 8;
				var y = Math.floor(index / 8);
				Field.setMineCount(x, y);
			});
		},
		isGameOver: function() {
			var gameOver = true;
			this.el.find('.size1of8 div').each(function(index, cell) {
				if($(cell).hasClass('covered') && !$(cell).data('hasMine')) {
					gameOver = false;
				}
			});
			return gameOver;
		},
		cheat: function() {
			Field.setCellNumber($('.hover'), false);
		}
	};

	var Controls = {
		timer: null,
		init: function(){
			$('.reset').click(function() {
				$('.smiley').css('background', 'url(img/smiley.png) no-repeat');
				$('.mine').removeClass('.mine');
				$('.hover').removeClass('.hover');
				$('.mine-end').removeClass('mine-end');

				Field.reset();
			});
			$('.smiley').click(function() {
				if(Field.isGameOver()) {
					var counter = 0;
					Field.el.find('.size1of8 div').each(function(index, cell) {
						if ($(cell).hasClass('uncovered')) {
							counter += 1;
						}
					});
					if (counter === 54) {
						alert('You won in ' + Controls.stepTimer()[0] + ":" + Controls.stepTimer()[1]);
						Controls.stopTimer();
					}
				}
				else {
					Field.reset();
				}
			});
		},
		startTimer: function() {
			if (!Controls.timer) {
				Controls.timer = setInterval(Controls.stepTimer, 1000);
			}
		},
		stepTimer: function() {
			var time = $('.timer p').html();
			var totalSeconds = (parseInt(time.split(":")[0]) * 60) + (parseInt(time.split(":")[1]));

			totalSeconds += 1;
			var minutes = Math.floor(totalSeconds / 60);
			var seconds = totalSeconds % 60;

			if (seconds < 10){
				seconds = "0" + seconds;
			}

			$('.timer p').html(minutes + ":" + seconds);

			return [minutes, seconds];
			
		},
		stopTimer: function() {
			clearInterval(Controls.timer);
			Controls.timer = null;
		},
		resetTimer: function() {
			Controls.stopTimer();
			$('.timer p').html('0:00');
		}
	};
			
	Field.init();
	Controls.init();
});