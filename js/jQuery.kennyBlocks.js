(function($) {

	$.fn.kennyBlocks = function(options) {
		var opts = $.extend({}, $.fn.kennyBlocks._consts, options);
		return this.each(function() {
			$this = $(this);
			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			switch(o.event){
				case 'dblclick':
					$this.dblclick(function(e){init(o);})
					break;
				case 'click':
					$this.click(function(e){$.fn.kennyBlocks.init(o);})
					break;
			}		
		});
	};


	$.fn.kennyBlocks._consts = {
		cellSize   : 20,
		rowNum     : 15,
		colNum     : 9,
		rotate     : 1
	};
	var consts = $.fn.kennyBlocks._consts;
	var pool; 
	var matrix;
	var boatCells;
	var rotateClock;
	var rotateReClock;
	var fireY;
	var fireX;
	var timeOut = 500;
	var boatSize = 3;

	var PAUSE = false;

	var eventsQueue = new CircleQueue(10);

	$.fn.kennyBlocks.init = function(o) {

		consts = o; 
		consts.$gameStart.attr({"value": "ING..."});
		// consts.$pool.attr({"height" : "300px"});
		fireY = 0;
		fireX = Math.round(consts.colNum/2) - 2;		
		consts.$score.attr({"value": 0});
		PAUSE = false;		

		boatCells = new Array(boatSize * boatSize);
		for(var i = 0; i < boatSize; i ++)
		{
			for(var j = 0; j < boatSize; j ++)
			{
				boatCells[ i * boatSize + j] = i + "," + j;
			}
		}

		matrix = new Array();
		for(var i = 0; i < consts.colNum; i++ ){
			matrix[i] = new Array();//必需，否则下面arr[i][j]报错
		  	for(var j = 0; j < consts.rowNum; j++ )
		  	{
		    	matrix[i][j] = 0;
			}
		}

		rotateClock = new Array();
		for(var i = 0; i < 3; i ++ )
			rotateClock[i] = new Array();

		rotateClock[0][0] = "2,0";	
		rotateClock[0][1] = "1,0";	
		rotateClock[0][2] = "0,0";	

		rotateClock[1][0] = "2,1";	
		rotateClock[1][1] = "1,1";	
		rotateClock[1][2] = "0,1";	

		rotateClock[2][0] = "2,2";	
		rotateClock[2][1] = "1,2";	
		rotateClock[2][2] = "0,2";	


		// 0,2	0,1	0,0		0,0	1,0	2,0
		// 1,2	1,1	1,0		0,1	1,1	2,1
		// 2,2	2,1	2,0		0,2	1,2	2,2

		rotateReClock = new Array();
		for(var i = 0; i < 3; i ++ )
			rotateReClock[i] = new Array();

		// 2,0	2,1	2,2		0,0	1,0	2,0
		// 1,0	1,1	1,2		0,1	1,1	2,1
		// 0,0	0,1	0,2		0,2	1,2	2,2

		rotateReClock[0][0] = "0,2";	
		rotateReClock[0][1] = "1,2";	
		rotateReClock[0][2] = "2,2";	

		rotateReClock[1][0] = "0,1";	
		rotateReClock[1][1] = "1,1";	
		rotateReClock[1][2] = "2,1";	

		rotateReClock[2][0] = "0,0";	
		rotateReClock[2][1] = "1,0";	
		rotateReClock[2][2] = "2,0";	

		document.onkeyup = $.fn.kennyBlocks.onKeyUp;
		pool = new Pool(consts.$pool);
		pool.fire();


	}
	var init = $.fn.kennyBlocks.init;

	//-------------------------------------------
	$.fn.kennyBlocks.handleEvent = function(){

		poolLeft   = consts.poolLeft;
		poolTop    = consts.poolTop;
		cellSize   = consts.cellSize;
		colNum     = consts.colNum;
		rowNum     = consts.rowNum;

		if(! eventsQueue.isEmpty() && !PAUSE )
		{
			switch(eventsQueue.delQueue()){
				case "D" :
					if( pool.stepEnable(0,1))
					{
			    		var p = $(".boat").offset().top;
			    		p = p - poolTop + cellSize;
		   				$(".boat")[0].style.top = '' + p + 'px'; 
		   				pool.boat.d();
		   			}
		   			else
		   			{
						pool.receptAll();
						// pool.recept();
		   			}
					break;
				case "L" :	
					if( pool.stepEnable(-1,0))
					{
			    		var p = $(".boat").offset().left;
			    		p = p - poolLeft - cellSize;
			   			$(".boat")[0].style.left = '' + p + 'px'; 
		   				pool.boat.l();
					}	    		
					break;
				case "R" :
					if( pool.stepEnable(1,0))
					{
			    		var p = $(".boat").offset().left;
			    		p = p - poolLeft + cellSize;
			   			$(".boat")[0].style.left = '' + p + 'px'; 
		   				pool.boat.r();
					}	    		
					break;
				case "U" :
					if(pool.rotateEnable())
					{
						console.log("Ratate !!!");
						BlockFactory.rotateBlocks(pool.boat);
					}
					break;
 				default:					
					break;
			}
		}
	    setTimeout("$.fn.kennyBlocks.handleEvent()",timeOut);
	}
	var handleEvent = $.fn.kennyBlocks.handleEvent;

	// ---------------------------------------------
	var t;
	$.fn.kennyBlocks.timedDown = function(){
		if(!PAUSE)
			eventsQueue.enterQueue("D");    		
	    t = setTimeout("$.fn.kennyBlocks.timedDown()",timeOut);
	}
	var timedDown = $.fn.kennyBlocks.timedDown;

	// ---------------------------------------------
	$.fn.kennyBlocks.onKeyUp = function(e){

	    e = e || window.event;
	    var keycode = e.which ? e.which : e.keyCode;
	    if(keycode == 37) {
			eventsQueue.enterQueue("L");    		
	    }
	    if(keycode == 38) {
			eventsQueue.enterQueue("U");    		
	    }
	    if(keycode == 39) {
			eventsQueue.enterQueue("R");    		
	    }
	    if(keycode == 40) {
			eventsQueue.enterQueue("D");    		
	    }
	    if(keycode == 32) {
	    	PAUSE = !PAUSE;
	    	if(PAUSE)
	    	{
	    		$(".pause").attr({"style":"display:true"});
	    	}
	    	else
	    	{
	    		$(".pause").attr({"style":"display:none"});
	    	}
	    }
	}	

	// ---------------------------------------------
	$.fn.kennyBlocks.Pool = function($pool){

		this.$pool = $pool;
		this.init();
	}

	$.fn.kennyBlocks.Pool.prototype = {

		init : function(){
    		$(".gameover").attr({"style":"display:none"});
			this.$pool.empty();
		},
		fire : function(){

			if(pool.fireEnable()){
				this.boat = new Boat(this.$pool);	
				handleEvent();
				timedDown();
			}
			else
			{
			    clearTimeout(t);
				console.log("GAME OVER");
	    		$(".gameover").attr({"style":"display:true"});
				consts.$gameStart.attr({"value": "restart!"});

			}
		},
		fireEnable : function(){

			for(y = fireY; y < fireY + boatSize; y ++ )
				for( x = fireX; x < fireX + boatSize; x ++)
				{
					if( matrix[x][y] === 1 )
						return false;	
				}
			return true;	
		},
		outBounds : function(X,Y){

			if(X > colNum - 1 || X < 0 || Y >= rowNum )
				return true;
			return false;
		},
		moveEnable : function(blocks,addX,addY)
		{
			var i = this.boat.loc.indexOf(",");

			var boatX = parseInt(this.boat.loc.substr(0,i)) ;
			var boatY = parseInt(this.boat.loc.substr(i + 1)) ;  

			console.log("blocks.length = " + blocks.length);
			for(var j = 0,lg = blocks.length; j < lg; j ++ )
			{
				k = blocks[j].indexOf(",");				
				blockX = parseInt(blocks[j].substr(0,k)) ;
				blockY = parseInt(blocks[j].substr(k + 1)) ;
				X = boatX + blockX;
				Y = boatY + blockY;
				X = X + addX;
				Y = Y + addY;

			console.log("X = " + X);
			console.log("Y = " + Y);
				if( pool.outBounds(X,Y) || matrix[X][Y] === 1)
					return false;
			}
			return true;
		},
		stepEnable : function(addX,addY){
			return pool.moveEnable(this.boat.getBlocks(),addX,addY);
		},
		rotateEnable : function(){

			var blocks = this.boat.getBlocks();
			var lg = blocks.length;
			var rotateBlocks = new Array(lg);
			for( var p = 0; p < lg; p ++)
			{
				rotateBlocks[p] = rotateClock[blocks[p].substr(0,1)][blocks[p].substr(-1,1)];  
			}
			return pool.moveEnable(rotateBlocks,0,0);
		},
		blockMoveEnable : function(block,addX,addY)
		{
			var i = this.boat.loc.indexOf(",");

			var boatX = parseInt(this.boat.loc.substr(0,i)) ;
			var boatY = parseInt(this.boat.loc.substr(i + 1)) ;  
			k = block.indexOf(",");				
			blockX = parseInt(block.substr(0,k)) ;
			blockY = parseInt(block.substr(k + 1)) ;
			X = boatX + blockX;
			Y = boatY + blockY;
			X = X + addX;
			Y = Y + addY;

			if( pool.outBounds(X,Y) || matrix[X][Y] === 1)
				return false;
			return true;
		},
		//feelling not so good by this play method.
		recept : function(){

			eventsQueue = new CircleQueue(10);
		    clearTimeout(t);
			var i = this.boat.loc.indexOf(",");
			var boatX = parseInt(this.boat.loc.substr(0,i)) ;
			var boatY = parseInt(this.boat.loc.substr(i + 1)) ;  

			var newBlocks = new Array();
			var m = 0;
			var blocks = this.boat.getBlocks();
			for(var j = 0; j < blocks.length; j ++ )
			{
				console.log("blocks[j] = " + blocks[j]);
				if( pool.blockMoveEnable(blocks[j],0,1))
				{
					newBlocks[m] = blocks[j];
					m ++;
				}
				else	
				{
					var k = blocks[j].indexOf(",");				
					var blockX = parseInt(blocks[j].substr(0,k)) ;
					var blockY = parseInt(blocks[j].substr(k + 1)) ;
					var X = boatX + blockX;
					var Y = boatY + blockY;
					matrix[X][Y] = 1;

					console.log("X = " + X);
					console.log("Y = " + Y);

					var Xpx = X * consts.cellSize;
					var Ypx = Y * consts.cellSize;

					var $blocks = $(".boat").children();
					for(var i = 0, lg = $blocks.length; i < lg; i ++ )
					{

						$block = $($blocks[i]);
						t = $block.offset().top - consts.poolTop;
						l = $block.offset().left - consts.poolLeft;
						if( t === Ypx && l === Xpx)
						{
							$block.remove();
							_block = $(document.createElement('div'))
								.addClass('block');
							_block[0].style.left = '' + l + 'px'; 
							_block[0].style.top = '' + t + 'px';
							this.$pool.append(_block);
						}
					}
				}
			}
			if( $(".boat").children().length === 0 )
			{
				$(".boat").remove();			
				pool.checkFull();
				pool.fire();
			}
			else
			{
				this.boat.blocks = newBlocks;
	    		t = setTimeout("$.fn.kennyBlocks.timedDown()",timeOut);
			}
		
		},
		receptAll : function(){

			eventsQueue = new CircleQueue(10);
		    clearTimeout(t);
			var i = this.boat.loc.indexOf(",");
			var boatX = parseInt(this.boat.loc.substr(0,i)) ;
			var boatY = parseInt(this.boat.loc.substr(i + 1)) ;  
			var $blocks = $(".boat").children();

			for(var i = 0, lg = $blocks.length; i < lg; i ++ )
			{

				$block = $($blocks[i]);
				t = $block.offset().top - consts.poolTop;
				l = $block.offset().left - consts.poolLeft;
				this.$pool.append($block);
				$block[0].style.top = '' + t + 'px';
				$block[0].style.left = '' + l + 'px';
			}

			var blocks = this.boat.getBlocks();
			for(var j = 0,lg = blocks.length; j < lg; j ++ )
			{
				var k = blocks[j].indexOf(",");				
				var blockX = parseInt(blocks[j].substr(0,k)) ;
				var blockY = parseInt(blocks[j].substr(k + 1)) ;
				var X = boatX + blockX;
				var Y = boatY + blockY;
				matrix[X][Y] = 1;
			}				
			$(".boat").remove();			
			pool.checkFull();
			pool.fire();
		},
		checkFull : function(){

			var okRows = "";
			for( var i = 0; i < rowNum ; i ++ )
			{
				var j = 0;
				for( ; j < colNum; j ++)
				{
					if( matrix[j][i] === 0 )
						break;
				}
				if( j === colNum)
				{
					okRows = okRows + i + ",";
				}
			}
			if( okRows.length === 0)
				return;
			pool.gainFull(okRows.substring(0,okRows.length - 1));
			pool.refreshScores(okRows.substring(0,okRows.length - 1));

		},
		gainFull : function(okRows){

			var rows = okRows.split(",");
			for( var p = 0; p < rows.length; p ++)
			{
				var r = rows[p];
				var Y = consts.poolTop + r * consts.cellSize;

				var $blocks = $(".block");
				for(var i = 0,lg = $blocks.length; i < lg; i ++ )
				{
					$block = $($blocks[i]);
					if( $block.offset().top === Y)
					{
						$block.remove();	
					}
					else if($block.offset().top < Y)
					{	
						t = $block.offset().top - consts.poolTop + consts.cellSize;
						$block[0].style.top = '' + t + 'px';
					}
				}
				for( var rr = r; rr > 0; rr --)
				{
					for( var c = 0; c < consts.colNum; c ++ )
					{
						// console.log("down before ----" + "matrix[" + c + "][" + rr + "] = " + matrix[c][rr]);
						matrix[c][rr] = matrix[c][rr - 1];
					}
				}
			}
		},
		refreshScores : function(okRows){

			var l = okRows.split(",").length;
			var t = 2;
			var v = parseInt(consts.$score.attr("value"));
			for( var i = 1; i < l; i ++)
			{
				t = t * 2;
			}
			consts.$score.attr({"value":v + 50 * t});
		}
	}
	var Pool = $.fn.kennyBlocks.Pool;
	Pool.prototype = $.fn.kennyBlocks.Pool.prototype;

	// ---------------------------------------------
	$.fn.kennyBlocks.Boat = function($pool){

		this.$pool = $pool;
		this.init();
	}
	$.fn.kennyBlocks.Boat.prototype = {

		init : function(){

			var $boat = $(document.createElement('div'))
				.addClass('boat');
			$boat[0].style.top = '' + fireY * consts.cellSize + 'px';
			$boat[0].style.left = '' + fireX * consts.cellSize + 'px'; 
			this.$pool.append($boat);
			this.$boat = $boat;

			this.loc = '' + fireX + ',' + fireY;
			this.blocks = BlockFactory.createBlocks($boat);
		},
		getBlocks : function(){

			return this.blocks;
		},
		l : function(){

			var i = this.loc.indexOf(",");
			x = parseInt(this.loc.substr(0,i)) - 1;
			this.loc = '' + x + ',' + this.loc.substr(i + 1);	
		},
		r : function(){

			var i = this.loc.indexOf(",");
			x = parseInt(this.loc.substr(0,i)) + 1;
			this.loc = '' + x + ',' + this.loc.substr(i + 1);			
		},
		d : function(){

			var i = this.loc.indexOf(",");
			y = parseInt(this.loc.substr(i + 1)) + 1;
			this.loc = '' + this.loc.substr(0,i) + ',' + y;			
		}
	}
	var Boat = $.fn.kennyBlocks.Boat;
	Boat.prototype = $.fn.kennyBlocks.Boat.prototype;

	// ---------------------------------------------
	$.fn.kennyBlocks.BlockFactory = (function(){

		var createBlocks = function($boat){

			var blocks = romandBlocks();
			createBlock(blocks);
			return blocks;
		};
		var rotateBlocks = function(boat){

			var blocks = rotate(boat);
			boat.blocks = blocks;
			$(".boat").empty();
			createBlock(blocks);
			return blocks;			
		};
		var createBlock = function(blocks){
			for(var i = 0; i < blocks.length; i ++)
			{
				x = blocks[i].substr(0,1) * consts.cellSize;
				y = blocks[i].substr(-1,1) * consts.cellSize;
				_block = $(document.createElement('div'))
					.addClass('block');
				_block[0].style.left = '' + x + 'px'; 
				_block[0].style.top = '' + y + 'px';
				$(".boat").append(_block);
			}
		};
		var romandBlocks = function(){

			// var blocks = new Array(4);
			// blocks[0] = '1,0';
			// blocks[1] = '0,1';
			// blocks[2] = '1,1';
			// blocks[3] = '2,1';
			
			// blocks[0] = '1,0';
			// blocks[1] = '1,1';
			// blocks[2] = '1,2';
			// blocks[3] = '2,1';

			var s = parseInt(Math.random()*10/boatSize + 1);
			var blocks = new Array(s);
			var selected = "";
			var range = boatSize * boatSize - 1;
			for( var i = 0; i < s; i ++)
			{
				while(true) 
				{
					var r = parseInt(Math.random() * range);
					if( selected.indexOf('a' + r) === -1 )
					{
						blocks[i] = boatCells[r];
						selected = selected + "a" + r + ",";		
						break;
					}
				}
			}
			return blocks;			
		};
		var rotate = function(boat)
		{
			var blocks = boat.getBlocks();
			var lg = blocks.length;
			var rotateBlocks = new Array(lg);
			for( var p = 0; p < lg; p ++)
			{
				rotateBlocks[p] = rotateClock[blocks[p].substr(0,1)][blocks[p].substr(-1,1)];  
			}
			return rotateBlocks;
		};
		return { 
			createBlocks : createBlocks,
			rotateBlocks : rotateBlocks
		};
	})();
	var BlockFactory = $.fn.kennyBlocks.BlockFactory;

})(jQuery);