var canvas = document.getElementById( "canvas" );
var ctx = canvas.getContext( "2d" );
canvas.style.position = "absolute";

Array.prototype.lastElement = function() {
    if ( this.length ) {
        return this[ this.length -1 ];
    }
    return null;
};

var moveSetInterval, random, bonus, nTime, punkt = 0, maxPunkt = 0;
//var maxPunktStorage = window.localStorage;

/**
 * Get the left top position of the element, this position is according to the current page.
 * @param {HTMLElement} ele - the element
 * @param {"Left", "Top"} str
 * @returns {Number} the left top position of this element
 */
var elementPosition = function( ele, str ) {
    var offset = ele[ "offset".concat( str )];
    if ( ele.offsetParent != null ) {
        offset += elementPosition( ele.offsetParent, str );
    }
    return offset;
};

/**
 * Create a new rectangle with factory pattern
 * @param {number} xPosition - The x position of this rectangle.
 * @param {number} yPosition - The y position of this rectangle.
 * @param {string} moveDirection - The move direction of a rectangle.
 */
function createRectangle( xPosition, yPosition, moveDirection ) {
    var o = new Object();
    o.x = xPosition;
    o.y = yPosition;
    o.moveDirection = moveDirection;
    o.nextStep = moveDirection;
    o.width = 20;
    o.height = 20;
    o.getX = function() {
        return o.x;
    };
    o.getY = function() {
        return o.y;
    };
    o.getMoveDirection = function() {
        return o.moveDirection;
    };
    o.setMoveDirection = function(direction) {
        o.moveDirection = direction;
    };
    o.getNextStep = function() {
        return o.nextStep;
    };
    o.setNextStep = function(next) {
        o.nextStep = next;
    };
    return o;
}

var snakeStart = [ createRectangle( 0, 40, "right" ), createRectangle( 20, 40, "right" ), createRectangle( 40, 40, "right" ) ];

/**
 * This defines that every move is with 20px, 
 * and set the move direction.
 */
var snakeMoveStrategy = {
    "right": function( snake ) {
        snake.moveDirection = "right";
        snake.x += 20;
    },
    "left": function( snake ) {
        snake.moveDirection = "left";
        snake.x -= 20;
    },
    "up": function( snake ) {
        snake.moveDirection = "up";
        snake.y -= 20;
    },
    "down": function( snake ) {
        snake.moveDirection = "down";
        snake.y += 20;		
    }		
};

/**
 * Set the position of every rectangle of the snake train.
 * @param {Array} snakeArr 
 */
var keepMoving = function( snakeArr ) {
    for ( let i = 0, snakeArrLength = snakeArr.length; i < snakeArrLength; i++ ) {
        if ( snakeArr[ i ].getMoveDirection() === snakeArr[ i ].nextStep ) {
            snakeMoveStrategy[ snakeArr[ i ].getMoveDirection() ]( snakeArr[ i ] );
        } else {
            if ( i > 0 ) { // set the same direction of current move direction with the next step direction and set the "nextStep" property of the next rectangle of the snake graph to this direction
                snakeMoveStrategy[ snakeArr[ i ].getMoveDirection() ]( snakeArr[ i ] );
                snakeArr[ i ].setMoveDirection(snakeArr[ i ].nextStep);				
                snakeArr[ i - 1 ].setNextStep( snakeArr[ i ].getMoveDirection());
            } else {  
                // for the last rectangle of the snake graph, also the first element of the snake array				 
                snakeMoveStrategy[ snakeArr[ i ].getMoveDirection() ]( snakeArr[ i ] );
                snakeArr[ i ].setMoveDirection(snakeArr[ i ].nextStep);				
            }
        }		
    }
};

/**
 * After receiving the new direction, set the moveDirection and nextStep of the last
 * rectangle to this direction. Set the nextStep of the penultimate rectangle to this 
 * direction.
 * @param {string} direction 
 * @param {Array.<snakeStart>} snakeArr 
 */
var updateMoveDirection = function( direction, snakeArr ) {
    snakeArr[ snakeArr.length - 1 ].setMoveDirection( direction );
    snakeArr[ snakeArr.length - 1 ].setNextStep( direction );
    snakeArr[ snakeArr.length - 2 ].setNextStep( direction );
};

/**
 * Create a new random rectangle.
 * Ensure the position of a new random rectangle, which should not in the snake graph.
 * @returns {object} a new random rectangle object
 */
var createRandomRectangle = function( snakeArr ) {
    let randomRactanglePositionX = Math.round( Math.random() * 23 ) * 20;
    let randomRactanglePositionY = Math.round( Math.random() * 23 ) * 20;
    return ((snakeArr.findIndex( rect => rect.getX() === randomRactanglePositionX ) === -1 ) || (snakeArr.findIndex( (rect) => rect.getY() === randomRactanglePositionY ) === -1 ))? createRectangle( randomRactanglePositionX, randomRactanglePositionY, null ) : createRandomRectangle( snakeArr ) ;
};


/**
 * Calculate the time that needed.
 * Return true, if it is in the needed time.
 * @param {number} needTime, needed time
 * @returns {boolean} 
 */
var justForCertainTime = function( needTime, timeType ) {
    var timeNow = new Date().getTime();    
    return function() {
        if (( new Date().getTime() - timeNow > needTime )  && timeType == "bonus"){
            bonus = void ( 0 ); // set bonus to undefined
            return false;
        }
        return true;
    };    
};

/** Paint the background */
var paintBackground = function() {		
    ctx.fillStyle = "#009999";
    ctx.fillRect( 0, 0, 480, 480 );
};
var show = true;
/**
 * Paint the snake
 * @param {Array.<snakeStart>} snake 
 */
var paint = {
    "sArray":  function ( snakeArr ) {
        for ( let i = 0, snakeLength = snakeArr.length; i < snakeLength; i++ ) {		
            ctx.strokeStyle = "red";
            ctx.fillRect( snakeArr[i].x, snakeArr[i].y, snakeArr[i].width, snakeArr[i].height );		
            ctx.strokeRect( snakeArr[i].x, snakeArr[i].y, snakeArr[i].width, snakeArr[i].height );
        }
    },	
    "random": function ( random ) {
	    ctx.fillStyle = "#a86831";
        ctx.fillRect( random.getX(), random.getY(), random.width, random.height );  		
    },
    "bonus": function ( bonus ) {
        if ( ( typeof( bonus ) === "object") && nTime() && show ){
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.fillRect( bonus.getX(), bonus.getY(), bonus.width, bonus.height );   
            show = !show;			
        } else {
            show=!show;
        }
    },
    "score": function ( score, scoreName, xPosScore, yPosScore ) {
        ctx.save();
        ctx.fillStyle = "#FFFAFA";
        ctx.font = "20px Georgia";
        ctx.fillText( scoreName + ":  " + score, xPosScore, yPosScore );
        ctx.restore();
    }
};

/**
 * Check, if the snake train meets the random rectangle.
 * If it meets the random rectangle, then add it to snake train and create a new one random.
 * @param {Array} snakeArr 
 * @param {object} rect 
 * @param {string} rectType - "random", "bonus", "body"
 */
var meetRectangle = function( snakeArr, rect, rectType ) {
    
    // meeted the random rectangle, rect is undefined if recht is set as bonus
    if ( ( rect )
 && ( ( ( snakeArr.lastElement().getMoveDirection() === "right" ) && ( snakeArr.lastElement().getX() + 20 === rect.getX() ) && ( snakeArr.lastElement().getY() === rect.getY() ) )
 ||   ( ( snakeArr.lastElement().getMoveDirection() === "down" ) && ( snakeArr.lastElement().getX() === rect.getX() ) && ( snakeArr.lastElement().getY() + 20 === rect.getY() ) ) 
 ||   ( ( snakeArr.lastElement().getMoveDirection() === "left" ) && ( snakeArr.lastElement().getX() - 20 === rect.getX() ) && ( snakeArr.lastElement().getY() === rect.getY() ) ) 
 ||   ( ( snakeArr.lastElement().getMoveDirection() === "up" ) && ( snakeArr.lastElement().getX() === rect.getX() ) && ( snakeArr.lastElement().getY() - 20 === rect.getY() ) ) ) )
    {
        let rectTemp = createRectangle( rect.getX(), rect.getY(), "");
        if ( rectType === "random" ) {
            console.log( "We will meet the random" + "\n"
            + "snake head x: " + snakeArr.lastElement().getX() + "  y: " + snakeArr.lastElement().getY() + "\n" 
            + "snake length: " + snakeArr.length + "\n"
            + "rectType is: " + rectType + "\n" 
            + "rect has x: " + rect.getX() + "  y: " + rect.getY() ) ;

            rectTemp.setMoveDirection( snakeArr[ snakeArr.length - 1 ].getMoveDirection() );
            rectTemp.setNextStep( snakeArr[ snakeArr.length - 1 ].getNextStep() );
            snakeArr.push( rectTemp );
            random = createRandomRectangle( snakeArr );

            console.log( "We have met the random and should create a new random" + "\n"
            + "snake head x: " + snakeArr.lastElement().getX() + "  y: " + snakeArr.lastElement().getY() + "\n" 
            + "snake length: " + snakeArr.length + "\n"            
            + "new random has x: " + random.getX() + "  y: " + random.getY() ) ;

            punkt += 1;
            createBonus( snakeArr.length );
        } else if ( rectType === "bonus" ) {  // meet the bonus rectangle
            rectTemp.setMoveDirection( snakeArr[ snakeArr.length - 1 ].getMoveDirection() );
            rectTemp.setNextStep( snakeArr[ snakeArr.length - 1 ].getNextStep() );
            snakeArr.push( rectTemp );
            bonus = void( 0 );
            punkt += 3;
        } else { // meet snake body
		    reinit();
        }
    }
};

var reinit = function() {
    clearInterval( moveSetInterval );
    snakeStart = [ createRectangle( 0, 40, "right" ), createRectangle( 20, 40, "right" ), createRectangle( 40, 40, "right" ) ];
    bonus = void( 0 );
    init();
    moveSetInterval = setInterval( moveMain, 300 );
};

/**
 * Check, if the snake train touchs the frame.
 * By touching the game should start again.
 * @param {Array} snakeArr 
 */
var touchFrame = function ( snakeArr ) {
    if ( ( snakeArr.lastElement().getX() < 0 ) //elementPosition( canvas, "Left" ) )
  || ( snakeArr.lastElement().getX() + 20 > canvas.width ) //elementPosition( canvas, "Left" ) + canvas.width )
  || ( snakeArr.lastElement().getY() < 0 ) //elementPosition( canvas, "Top" ) )
  || ( snakeArr.lastElement().getY() + 20 > canvas.height ) ) //elementPosition( canvas, "Top" ) + canvas.height ) )
    {
        reinit();
    }
};

var touchBody = function( snakeArr ) {
    for ( let i = 0; i < snakeArr.length -1; i++ ){
	    meetRectangle(snakeArr, snakeArr[i], "body");
    }
};

const SEVEN_SECONDS = 7000;

var createBonus = function( num ) {
    if ( !bonus && ( ( num -3 ) % 5  === 0 ) && ( num -3 ) > 0 ) {
        bonus = createRandomRectangle( snakeStart.concat( random ) );
        nTime = justForCertainTime( SEVEN_SECONDS, "bonus" ); // The bonus rectangele should be shown for 5 seconds.        
    }
};

/**
 * Handle the user input.
 * Meets the random, touch the frame, create the bonus and keep moving.
 */
var handleInput = function() {
    meetRectangle( snakeStart, random, "random" );
    meetRectangle( snakeStart, bonus, "bonus");
    touchFrame( snakeStart );
    touchBody( snakeStart );
    keepMoving( snakeStart );    
};

/**
 * rend the whole snake.
 */
var render = function() {
    paint[ "sArray" ]( snakeStart );
    paint[ "random" ]( random );
    paint[ "bonus" ]( bonus );
    paint[ "score" ]( punkt * 10, "Score", 10, 30 );
    paint[ "score" ]( maxPunkt * 10, "High Score", 310, 30 );
    
};

/**
 * Compare the current punkt with the saved high score.
 * Return the compared high score punkt and save it if necessary.
 * @param {number} punkt 
 * @returns {number}
 */
var calculateMaxPunkt = function( punkt ) {
    if ( ( !localStorage.getItem( "myMaxPunkt" )) || ( punkt > Number( localStorage.getItem( "myMaxPunkt" ))) ) {        
        localStorage.setItem( "myMaxPunkt", punkt );
        //console.log( " new high score " + localStorage.getItem( "myMaxPunkt" ) );
        return punkt;
    } else {
        //console.log( localStorage.getItem( "myMaxPunkt" ) );
        return Number( localStorage.getItem( "myMaxPunkt" ) );
    }
};

var moveMain = function(){
    paintBackground();	
    handleInput();
    render(); 
};

var init = function() {
    random = createRandomRectangle( snakeStart );    
    maxPunkt = calculateMaxPunkt( punkt );
    punkt = 0;
};
init();

moveSetInterval = setInterval( moveMain, 300 );

/** Start and Pause function */
var toggle = document.getElementById( "btn" );
addEventListener( "keydown", function( evt ) {
    switch ( evt.keyCode ) {
    case 32:
        if ( toggle.innerHTML == "pause" ) {
            toggle.innerHTML = "start";                    
            clearInterval( moveSetInterval );
        } else {
            toggle.innerHTML = "pause";
            moveSetInterval = setInterval( moveMain, 300 );
        }
        break;
    case 37:
        if ( snakeStart.lastElement().getMoveDirection() !== "right" ) {
            updateMoveDirection( "left", snakeStart );
        }
        break;
    case 38:
        if ( snakeStart.lastElement().getMoveDirection() !== "down" ) {
            updateMoveDirection( "up", snakeStart );
        }
        break;
    case 39:  
        if ( snakeStart.lastElement().getMoveDirection() !== "left" ) {
            updateMoveDirection( "right", snakeStart );
        }
        break;
    case 40:  // keydown
        if ( snakeStart.lastElement().getMoveDirection() !== "up" ) {
            updateMoveDirection( "down", snakeStart );
        } 
        break;
    }
}, false);



