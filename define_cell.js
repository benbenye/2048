/*
*Cell 棋子对象
*@param x 棋子横坐标
*@param y 棋子纵坐标
*@param color 棋子颜色
*@param number 棋子数字
*@show() 棋子的展示
*/
function Cell(x, y, color,number, x1, y1){
	this.number = number;
	this.color = color;
	this.x = x;
	this.y = y;
	this.x1 = x1;
	this.y1 = y1
	this.show = function(container, obj, flag){
		flag = flag || 0;
		ui.showCell(container, obj);
		if(flag === 1){//新棋子
			ui.newCellAnimate();
		}
	};
}