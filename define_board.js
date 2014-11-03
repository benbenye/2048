function Board(dimension,score,container){
	/*棋盘对象
	*@param dimension 棋盘维度
	*@param container 棋盘渲染dom容器
	*@param score 分数
	*@empty 记录空位置
	*/
	this.dimension = dimension;
	this.empty = dimension * dimension;
	this.score = score;
	this.container = container;
	/*
	*棋盘初始化
	*/
	this.init = function(){
		// 重置数组
		this.cells = new Array(dimension);
		for(var i = 0; i < dimension; ++i){
			this.cells[i] = new Array(dimension);
		}

		empty = dimension * dimension;

		ui.showBoard(this.container,dimension);

		this.start();
	};
	/*
	*游戏开始
	*/
	this.start = function(){
		this.ranCell();
		this.ranCell();
	};
	/*
	*生成带有随机数的棋子
	*/
	this.ranCell = function(){
		if(empty){
			var _ranCell = Math.random() > 0.5 ? {number : 2,color : 'c2', x : 0, y : 0} : {number : 4, color : 'c4', x : 0, y : 0},
				_ranDes = 0;

			// 随机生成一个位置，按照一个规则顺序查找是否有一个空位置
			_ranDes = Math.floor( Math.random() * this.dimension * this.dimension );//0-15
			_ranCell.x = parseInt( _ranDes / this.dimension );
			_ranCell.y = _ranDes % this.dimension;

			for(var i = 0; i < this.dimension * this.dimension; ++i) {
				if( !this.cells[_ranCell.x][_ranCell.y] ) {
					// 实例化一个随机棋子
					var cellNew = new Cell(_ranCell.x, _ranCell.y, _ranCell.color, _ranCell.number);
					this.cells[_ranCell.x][_ranCell.y] = cellNew;
					break;
				}else{
					if( _ranCell.y === (this.dimension - 1) ) {//本列最后一个
						if( _ranCell.x === (this.dimension - 1) ) {//本行最后一个
							_ranCell.x = 0;
							_ranCell.y = 0;
							continue;
						} else {
							_ranCell.x += 1;
							_ranCell.y = 0;
							continue;						
						}
					} else {					
						_ranCell.y += 1;
						continue;	
					}
				}				
			}

			this.updateEmpty(cellNew);
			cellNew.show(this.container, cellNew, 1);
		}else{
			alert('无空位置');
		}
	};
	/*
	*键盘上方向的操作
	*/
	this.moveUp = function(){
		// 从上向下竖向遍历从左到右
		var tempArray = [],//临时数组用于合并棋子
			move = false,//是否移动棋子
			merge = 0;//合并棋子对数

		for(var i = 0; i < this.dimension; ++i){
			for(var j = 0; j < this.dimension; ++j){
				if(this.cells[i][j]){
					tempArray.push(this.cells[i][j]);
					this.cells[i][j]= undefined;
				}
			}
			if(tempArray.length>=1){
				for(var m = 0; m < tempArray.length -1; ++m){
					if(tempArray[m].number === tempArray[m+1].number){
						tempArray[m].number = tempArray[m].number*2;
						tempArray[m].color = 'c' + tempArray[m].number;
						$('#grid-cell-'+tempArray[m+1].x+'-'+tempArray[m+1].y).detach();
						tempArray.splice(m+1,1);
						++merge;
					}
				}
				for(var n = 0; n < this.dimension; ++n){
					this.cells[i][n] = tempArray[n];
				}
			}
			//展示
			for(var k = 0; k < this.dimension; ++k){
				if(this.cells[i][k]){
					$('#grid-cell-'+this.cells[i][k].x+'-'+this.cells[i][k].y).detach();
					if(!merge && this.cells[i][k].y != k) {
						move = true;
					}
					this.cells[i][k].x=i;
					this.cells[i][k].y=k;
					ui.showCell(this.container, this.cells[i][k]);
				}
			}
			tempArray=[];
		}
		this.updateEmpty(merge);
		if(move || merge){
			this.ranCell();
		}
	};
	/*
	*键盘右方向的操作
	*/
	this.moveRight = function(){
		// 从右向左横向遍历
		var tempArray = [],//临时数组用于合并棋子
			move = false,//是否移动棋子
			merge = 0;//合并棋子对数

		for(var i = 0; i < this.dimension; ++i){
			for(var j = this.dimension - 1; j >= 0; --j){
				if(this.cells[j][i]){
					tempArray.push(this.cells[j][i]);
					this.cells[j][i]= undefined;
				}
			}
			if(tempArray.length>=1){
				for(var m = 0; m < tempArray.length -1; ++m){
					if(tempArray[m].number === tempArray[m+1].number){
						tempArray[m].number = tempArray[m].number*2;
						tempArray[m].color = 'c' + tempArray[m].number;
						$('#grid-cell-'+tempArray[m+1].x+'-'+tempArray[m+1].y).detach();
						tempArray.splice(m+1,1);
						++merge;
					}
				}
				for(var n = this.dimension - 1; n >= 0; --n){
					this.cells[n][i] = tempArray[this.dimension - 1 - n];
				}
			}
			//展示
			for(var k = this.dimension - 1; k >= 0; --k){
				if(this.cells[k][i]){
					$('#grid-cell-'+this.cells[k][i].x+'-'+this.cells[k][i].y).detach();
					if(!merge && this.cells[k][i].x != k) {
						move = true;
					}
					this.cells[k][i].x=k;
					this.cells[k][i].y=i;
					ui.showCell(this.container, this.cells[k][i]);
				}
			}
			tempArray=[];
		}
		this.updateEmpty(merge);
		if(move || merge){
			this.ranCell();
		}
	};
	/*
	*键盘下方向的操作
	*/
	this.moveDown = function(){
		// 从上向下竖向遍历从左到右
		var tempArray = [],//临时数组用于合并棋子
			move = false,//是否移动棋子
			merge = 0;//合并棋子对数

		for(var i = 0; i < this.dimension; ++i){
			for(var j = this.dimension - 1; j >= 0; --j){
				if(this.cells[i][j]){
					tempArray.push(this.cells[i][j]);
					this.cells[i][j]= undefined;
				}
			}
			if(tempArray.length >= 1){
				for(var m = 0; m < tempArray.length -1; ++m){
					if(tempArray[m].number === tempArray[m+1].number){
						tempArray[m].number = tempArray[m].number*2;
						tempArray[m].color = 'c' + tempArray[m].number;
						$('#grid-cell-'+tempArray[m+1].x+'-'+tempArray[m+1].y).detach();
						tempArray.splice(m+1,1);
						++merge;
					}
				}
				for(var n = this.dimension - 1; n >= 0; --n){
					this.cells[i][n] = tempArray[this.dimension - 1 - n];
				}
			}
			//展示
			for(var k = this.dimension - 1; k >= 0; --k){
				if(this.cells[i][k]){
					$('#grid-cell-'+this.cells[i][k].x+'-'+this.cells[i][k].y).detach();
					if(!merge && this.cells[i][k].y != k) {
						move = true;
					}
					this.cells[i][k].x=i;
					this.cells[i][k].y=k;
					ui.showCell(this.container, this.cells[i][k]);
				}
			}
			tempArray=[];
		}
		this.updateEmpty(merge);
		if(move || merge){
			this.ranCell();
		}
	};
	/*
	*键盘左方向的操作
	*/
	this.moveLeft = function(){
		// 从左向右横向遍历
	/*	var tempArray = [],//临时数组用于合并棋子
			move = false,//是否移动棋子
			merge = 0;//合并棋子对数

		for(var i = 0; i < this.dimension; ++i){
			for(var j = 0; j < this.dimension; ++j){
				if(this.cells[j][i]){
					tempArray.push(this.cells[j][i]);
				}
			}
			if(tempArray.length>=1){
				for(var m = 0; m < tempArray.length -1; ++m){
					if(tempArray[m].number === tempArray[m+1].number){
						tempArray[m].number = tempArray[m].number*2;
						tempArray[m].color = 'c' + tempArray[m].number;
						tempArray[m+1].x1 = tempArray[m].x;
						tempArray[m+1].y1 = tempArray[m].y;
						++m;
						// $('#grid-cell-'+tempArray[m+1].x+'-'+tempArray[m+1].y).detach();
						// tempArray.splice(m+1,1);
						++merge;
					}
				}
				for(var n = 0; n < this.dimension; ++n){
					this.cells[n][i] = tempArray[n];
				}
			}
			//展示
			for(var k = 0; k < this.dimension; ++k){
				if(this.cells[k][i]){
					$('#grid-cell-'+this.cells[k][i].x+'-'+this.cells[k][i].y).detach();
					if(!merge && this.cells[k][i].x != k) {
						move = true;
					}
					this.cells[k][i].x=k;
					this.cells[k][i].y=i;
					ui.showCell(this.container, this.cells[k][i]);
				}
			}
			tempArray=[];
		}
		this.updateEmpty(merge);
		if(move || merge){
			this.ranCell();
		}*/
		var first = 0,
			next = 1,
			destination = 0;//合并后的位置

		for (var m = 0; m < this.dimension; ++m) {

			for ( ; first < this.dimension; ) {

				if( this.cells[first][m] ) {

					next = this.findNextLeft(next+1, m);

					if(next != -1) {//找到了一个值

						if( this.compare(first, next, m, 1) === 1 ) {

							first += 1;
							next += 1;

						} else if( this.compare(first, next, m, 1) === 2 ) {

							first += 2;
							next += 2;

						} else {

							console.log('err');
							break;

						}

					} else {
						//只有一个值
						ui.moveAnimate(this.cells[first][m], 1, function(){
							
							first = 0;
							next = 1;

						});
					}

				} else {//空格子

					first = this.findFirstLeft(first, m);

					if( first != -1 ) {

						continue;//找到了第一个不为空的

					} else {
						console.log('空行、列');
						first = 0;
						next = 1;
						break;
					}
					
				}

			};

			first = 0;
			next = 1;		
		}
	};
	/*
	*计算游戏分数
	*/
	this.computing = function(){return score;};
	/*
	*每次棋子有变化都需要重新计算empty
	*/
	this.updateEmpty = function(obj){
		/*每次棋子有变化都需要重新计算empty
		*@param obj 随机棋子 || 合并棋子对数
		*/

		if(typeof obj == 'number' && obj > 0){

			this.empty -= obj;

		}else if(typeof obj == 'object' && typeof obj.x == 'number' && typeof obj.y == 'number'){

			this.cells[obj.x][obj.y] = obj;
			--this.empty;
		}
	};
	/*
	*找到下一个不为空的位置
	*@next    		要找下一个不为空的位置的起始坐标
	*@i  			所在行、列 的坐标  
	*/
	this.findNextLeft = function(next,i) {
		if(next > this.dimension || i > this.dimension) {
			console.log('err');
			return;
		}

		for( ; next < this.dimension; ++next) {

			if(this.cells[next][i]) {
				return next;
			}

		}

		if(next >= this.dimension || next < 0) {
			return -1;
		}
	};

	/*
	*当first为空的时候， 查找下一个不为空的
	*@first 开始坐标
	*@m  所在行、列的坐标
	*/

	this.findFirstLeft = function ( first, m ) {
		if(first > this.dimension || m > this.dimension) {
			console.log('err');
			return;
		}

		for( first += 1; first < this.dimension; ) {
			if( this.cells[first][m] ) {
				return first;
			} else {
				first += 1;
				if(first >= this.dimension) {
					return -1;
				}
			}
		}
	};

	/*
	*比较
	*@f           第一个对比的坐标
	*@n           与f相邻第一个不为空的位置
	*@m           单轮循环内保持不变的横坐标或者纵坐标
	*@de          合并方向 1表示横向 0表示纵向
	*/
	this.compare = function(f, n, m, de) {
		if (de) {//横向合并
			if ( this.cells[f][m].number === this.cells[n][m] ) {

				this.cells[n][m].x1 = this.cells[f][m].x;
				this.cells[f][m].color = 'c' + this.cells[f][m].number * 2;

				ui.moveAnimate(this.cells[n][m], de, function () {
					this.cells[n][m] = undefined;
					return 1;
				});

			} else {//f n 不相等
				if( n > f && de ) {//向左

					this.cells[n][m].x1 = f + 1;
					ui.moveAnimate(this.cells[n][m], de, function(){
						return 2;
					});

				} else if ( n < f && de ) {//向右

					this.cells[n][m].x1 = f - 1;
					ui.moveAnimate(this.cells[n][m], de, function(){
						return 2;
					});

				} 
			}
		} else {//纵向合并 

			if ( this.cells[m][f].number === this.cells[m][n] ) {

				this.cells[m][n].y1 = this.cells[m][f].y;
				this.cells[m][f].color = 'c' + this.cells[m][f].number * 2;

				ui.moveAnimate(this.cells[m][n], de, function () {
					this.cells[m][n] = undefined;
					return 1;
				});

			} else {
				if ( n > f && !de ) {//向上

					this.cells[m][n].y1 = f + 1;
					ui.moveAnimate(this.cells[m][n], de, function(){
						return 2;
					});

				}else if ( n < f && !de ) {//向下

					this.cells[m][n].y1 = f - 1;
					ui.moveAnimate(this.cells[m][n], de, function(){
						return 2;
					});

				}
			}

		}
	};

	/*
	*合并了的无用棋子的销毁
	*/
	// this.destroy = function(){};
	// this.show = function(){};
}