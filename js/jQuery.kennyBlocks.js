(function($) {

	$.fn.kennyBlocks = function(options) {
		var opts = $.extend({}, $.fn.kennyBlocks._consts, options);
		return this.each(function() {
			$this = $(this);
			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			$this.click(function(e){$.fn.kennyBlocks.init(o);})
		});
	};


	$.fn.kennyBlocks._consts = {
		rotate     : 1
	};
	var consts = $.fn.kennyBlocks._consts;
	var pool; 
	var matrix;
	var boatCells;
	var rotateClock;
	var rotateReClock;
	var timeOut = 500,
	    handleInterval = 100,
	    boatSize = 3,
	    colNum     = 9,
	    rowNum     = 15,
	    poolLeft   = 100,
		poolTop    = 100,
		cellSize   = 20;

	var PAUSE = false;

	var eventsQueue = new CircleQueue(10);

	$.fn.kennyBlocks.init = function(o) {

		consts = o; 
		consts.$gameStart.attr({"value": "ING..."});
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
		for(var i = 0; i < colNum; i ++ ){
			matrix[i] = new Array();//必需，否则下面arr[i][j]报错
		  	for(var j = 0; j < rowNum; j ++ )
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

	    clearTimeout(t);
	    clearTimeout(h);
		eventsQueue = new CircleQueue(10);

		document.onkeyup = $.fn.kennyBlocks.onKeyUp;
		pool = new Pool(consts.$pool);
		pool.fire();
	}
	var init = $.fn.kennyBlocks.init;

	//-------------------------------------------
	handleEvents = {};
	handleEvents["D"] = function(){

		if( pool.stepEnable(0,1))
		{
			$("#pool1 .boat")[0].style.top = '' + ($("#pool1 .boat").offset().top - poolTop + cellSize ) + 'px'; 
			pool.boat.d();
		}
		else
		{
		    clearTimeout(t);
		    clearTimeout(h);
			pool.receptAll();
		}
	};
	handleEvents["L"] = function(){
		if( pool.stepEnable(-1,0))
		{
   			$("#pool1 .boat")[0].style.left = '' + ($(".boat").offset().left - poolLeft - cellSize) + 'px'; 
			pool.boat.l();
		}	    		
	};
	handleEvents["R"] = function(){
		if( pool.stepEnable(1,0))
		{
   			$("#pool1 .boat")[0].style.left = '' + ( $(".boat").offset().left - poolLeft + cellSize) + 'px'; 
			pool.boat.r();
		}	    		
	};
	handleEvents["U"] = function(){
		if(pool.rotateEnable())
		{
			BlockFactory.rotateBlocks(pool.boat);
		}
	};

	var h;
	$.fn.kennyBlocks.handleEvent = function(){

		if( (!eventsQueue.isEmpty()) && (!PAUSE) )
		{
			handleEvents[eventsQueue.delQueue()]();
		}
	    h = setTimeout("$.fn.kennyBlocks.handleEvent()",handleInterval);
	}
	var handleEvent = $.fn.kennyBlocks.handleEvent;

	// ---------------------------------------------
	var t;
	$.fn.kennyBlocks.timedDown = function(){
		if(!PAUSE)
			eventsQueue.enterQueue("D");    		
	    t = setTimeout(timedDown,timeOut);
	}
	var timedDown = $.fn.kennyBlocks.timedDown;

	// ---------------------------------------------

    var keyEvents = new Array();
    keyEvents["37"] = function(){eventsQueue.enterQueue("L");};
    keyEvents["38"] = function(){eventsQueue.enterQueue("U");};
    keyEvents["39"] = function(){eventsQueue.enterQueue("R");};
    keyEvents["40"] = function(){eventsQueue.enterQueue("D");eventsQueue.enterQueue("D");};
    keyEvents["32"] = function(){
    	PAUSE = !PAUSE;
    	PAUSE ? $(".pause").attr({"style":"display:true"}) : $(".pause").attr({"style":"display:none"});
    };
	$.fn.kennyBlocks.onKeyUp = function(e){

	    e = e || window.event;
	    var keycode = e.which ? e.which : e.keyCode;

	    if( keyEvents[keycode] )
	    	keyEvents[keycode]();
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
			$(".nextA").empty();
			this.fireY = 0;
			this.fireX = Math.round(colNum/2) - 2;	

			this.nextBoat = null;
		},
		fire : function(){

		    clearTimeout(t);
		    clearTimeout(h);
			if(pool.fireEnable()){

				if( this.nextBoat === null )
				{
					this.boat = new Boat(this.$pool,this.fireY,this.fireX);	
				}
				else
				{
					this.boat = this.nextBoat;
					this.$pool.append(this.boat.$boat);
					this.boat.$boat[0].style.top = '' + this.fireY * cellSize + 'px';
					this.boat.$boat[0].style.left = '' + this.fireX * cellSize + 'px'; 
					this.boat.loc = '' + this.fireX + ',' + this.fireY;
				}
				this.nextBoat = new Boat($("#nextOne"),0,0);
				eventsQueue = new CircleQueue(10);
				handleEvent();
				timedDown();
			}
			else
			{
				console.log("GAME OVER");
	    		$(".gameover").attr({"style":"display:true"});
				consts.$gameStart.attr({"value": "restart!"});
			}
		},
		fireEnable : function(){

			for(var y = this.fireY; y < this.fireY + boatSize; y ++ )
				for(var x = this.fireX; x < this.fireX + boatSize; x ++)
				{
					if( matrix[x][y] === 1 )
						return false;	
				}
			return true;	
		},
		outBounds : function(X,Y){
			return (X > colNum - 1 || X < 0 || Y >= rowNum );
		},
		moveEnable : function(blocks,addX,addY)
		{
			var i = this.boat.loc.indexOf(","),
				boatX = parseInt(this.boat.loc.substr(0,i)) ,
				boatY = parseInt(this.boat.loc.substr(i + 1)) ;  

			for(var j = 0,lg = blocks.length; j < lg; j ++ )
			{
				var k = blocks[j].indexOf(","),			
					X = boatX + parseInt(blocks[j].substr(0,k)) + addX,
					Y = boatY + parseInt(blocks[j].substr(k + 1)) + addY;

				if( pool.outBounds(X,Y) || matrix[X][Y] === 1)
					return false;
			}
			return true;
		},
		stepEnable : function(addX,addY){
			return pool.moveEnable(this.boat.getBlocks(),addX,addY);
		},
		rotateEnable : function(){

			var blocks = this.boat.getBlocks(),
				lg = blocks.length,
				rotateBlocks = new Array(lg);
			for( var p = 0; p < lg; p ++)
			{
				rotateBlocks[p] = rotateClock[blocks[p].substr(0,1)][blocks[p].substr(-1,1)];  
			}
			return pool.moveEnable(rotateBlocks,0,0);
		},
		blockMoveEnable : function(block,addX,addY)
		{
			var i = this.boat.loc.indexOf(","),
				k = block.indexOf(","),
				X = parseInt(this.boat.loc.substr(0,i)) + parseInt(block.substr(0,k)) + addX,
				Y = parseInt(this.boat.loc.substr(i + 1)) + parseInt(block.substr(k + 1)) + addY;
				return ( pool.outBounds(X,Y) || matrix[X][Y] === 1);			
		},
		//feelling not so good with this play method.
		recept : function(){

			var i = this.boat.loc.indexOf(",");
			var boatX = parseInt(this.boat.loc.substr(0,i)) ;
			var boatY = parseInt(this.boat.loc.substr(i + 1)) ;  

			var newBlocks = new Array();
			var m = 0;
			var blocks = this.boat.getBlocks();
			for(var j = 0; j < blocks.length; j ++ )
			{
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

					var Xpx = X * cellSize;
					var Ypx = Y * cellSize;

					// var $blocks = $(".boat").children();
					var $blocks = $("#pool1 div").children();

					for(var i = 0, lg = $blocks.length; i < lg; i ++ )
					{

						$block = $($blocks[i]);
						t = $block.offset().top - poolTop;
						l = $block.offset().left - poolLeft;
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
			if( $("#pool1 .boat").children().length === 0 )
			{
				$("#pool1 .boat").remove();			
				pool.checkFull();
				pool.fire();
			}
			else
			{
				this.boat.blocks = newBlocks;
				timedDown();
			}
		
		},
		receptAll : function(){

			var i = this.boat.loc.indexOf(",");
			var boatX = parseInt(this.boat.loc.substr(0,i)) ;
			var boatY = parseInt(this.boat.loc.substr(i + 1)) ;  

			var $blocks = $("#pool1 .boat").children();
			for(var i = 0, lg = $blocks.length; i < lg; i ++ )
			{
				$block = $($blocks[i]);
				t = $block.offset().top - poolTop;
				l = $block.offset().left - poolLeft;
				this.$pool.append($block);
				$block[0].style.top = '' + t + 'px';
				$block[0].style.left = '' + l + 'px';
			}
			$("#pool1 .boat").remove();			

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
			if( okRows.length > 0)
			{
				pool.gainFull(okRows.substring(0,okRows.length - 1));
				pool.refreshScores(okRows.substring(0,okRows.length - 1));
			}

		},
		gainFull : function(okRows){

			var rows = okRows.split(",");
			for( var p = 0; p < rows.length; p ++)
			{
				var r = rows[p];
				var Y = poolTop + r * cellSize;

				var $blocks = $("#pool1 .block");
				for(var i = 0,lg = $blocks.length; i < lg; i ++ )
				{
					$block = $($blocks[i]);
					if( $block.offset().top === Y)
					{
						$block.remove();	
					}
					else if($block.offset().top < Y)
					{	
						t = $block.offset().top - poolTop + cellSize;
						$block[0].style.top = '' + t + 'px';
					}
				}
				for( var rr = r; rr > 0; rr --)
				{
					for( var c = 0; c < colNum; c ++ )
					{
						matrix[c][rr] = matrix[c][rr - 1];
					}
				}
			}
		},
		refreshScores : function(okRows){

			consts.$score.attr({"value": 
				parseInt(consts.$score.attr("value")) + 50 * Math.pow( 2,okRows.split(",").length)});
		}
	}
	var Pool = $.fn.kennyBlocks.Pool;
	Pool.prototype = $.fn.kennyBlocks.Pool.prototype;

	// ---------------------------------------------
	$.fn.kennyBlocks.Boat = function($pool,fireY,fireX){

		this.$pool = $pool;
		this.init(fireY,fireX);
	}
	$.fn.kennyBlocks.Boat.prototype = {

		init : function(fireY,fireX){

			var $boat = $(document.createElement('div'))
				.addClass('boat');
			$boat[0].style.top = '' + fireY * cellSize + 'px';
			$boat[0].style.left = '' + fireX * cellSize + 'px'; 
			this.$pool.append($boat);
			this.$boat = $boat;

			this.loc = '' + fireX + ',' + fireY;
			this.blocks = BlockFactory.createBlocks($boat);
		},
		getBlocks : function(){

			return this.blocks;
		},
		l : function(){

			var i = this.loc.indexOf(","),
			x = parseInt(this.loc.substr(0,i)) - 1;
			this.loc = '' + x + ',' + this.loc.substr(i + 1);	
		},
		r : function(){

			var i = this.loc.indexOf(","),
			x = parseInt(this.loc.substr(0,i)) + 1;
			this.loc = '' + x + ',' + this.loc.substr(i + 1);			
		},
		d : function(){

			var i = this.loc.indexOf(","),
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
			createBlock($boat,blocks);
			return blocks;
		};
		var rotateBlocks = function(boat){

			var blocks = rotate(boat);
			boat.blocks = blocks;
			boat.$boat.empty();
			createBlock(boat.$boat,blocks);
			return blocks;			
		};
		var createBlock = function($boat,blocks){
			for(var i = 0; i < blocks.length; i ++)
			{
				x = blocks[i].substr(0,1) * cellSize;
				y = blocks[i].substr(-1,1) * cellSize;
				_block = $(document.createElement('div'))
					.addClass('block');
				_block[0].style.left = '' + x + 'px'; 
				_block[0].style.top = '' + y + 'px';
				$boat.append(_block);
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
			var blocks = boat.getBlocks(),
				lg = blocks.length,
				rotateBlocks = new Array(lg);
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