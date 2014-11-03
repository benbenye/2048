
$(document).ready(function(){
	newgame();

});
function newgame(){

	var board = new Board(4, 0, '#grid-container');

	board.init('#grid-container');


	// 键盘上下左右
	$(window).keyup(function(e){
		/*left 37
		*up 38
		*right 39
		*down 40*/
		switch(e.keyCode)
		{
			case 37:				
				board.moveLeft();
				break;
			case 38:				
				board.moveUp();
				break;
			case 39:				
				board.moveRight();
				break;
			case 40:				
				board.moveDown();
				break;
			default :
				alert('只能上下左右哦~~');
				break;
		}
	});

/*document.getElementById('grid-container')
.addEventListener('touchmove', function (e){
	e.preventDefault();
	var e = e.changedTouches[0];
	move(e);
});*/

/*	document.getElementById('grid-container')
	.addEventListener('touchstart',function(){
		e.preventDefault();
		var e = e.changedTouches[0];
		start(e);
	});


	document.getElementById('grid-container')
	.addEventListener('touchend', function (e){
		e.preventDefault();
		var e = e.changedTouches[0];
		end(e);
	});


	function start(e) {
		e.preventDefault();
	}
*/
}