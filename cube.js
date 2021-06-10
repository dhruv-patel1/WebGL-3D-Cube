"use strict";


var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
//same as in the colored cube example


//here are some definitions that may be needed.
var modelMatrix=mat4();
var viewMatrix=mat4();
var projectionMatrix=mat4();

var resultMatrix=mat4();
var identityMatrix=mat4();
var matrixLoc;

var transVector = vec3(0,0,0);

var origin=vec3(0,0,0);
var cameraUp=vec3(0,1,0);
var cameraPosition=vec3(0,0,1);

var cameraLookingAtCube=false;
var cameraText;
var useProjection=false;
var usePerspective=false;
var otherText;



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    matrixLoc = gl.getUniformLocation(program, "uMatrix");


	/* todo: define the HTML input elements.
	Hint: you can define a checkbox in HTML like this:
	
	<input type="checkbox" id="use-perspective">
	  <label for="use-perspective">Use perspective</label>
	</input>
	
	And a button liek this:
	<button id= "look-at-cube">Look at cube</button>
	
	You can add text in HTML like this : <p id="camera-text">Camera location:</p>
	*/
    
	//event listeners for switching between looking at cube/looking at -z





	//todo: add event listeners for conrtolling the camera abd cube, and switching between options.
	//1. conrtolling the position of the camera and orientation of the cube
	//2. switching between looking at the cube and at the default direction
	//3. switching between camera projections
	
	//examples: 
	//document.getElementById( "look-at-cube" ).onclick = function (e) {};
	//document.getElementById( "use-projection" ).onchange = function (e) {};
	
	//hint: inside an event hander function, "this" refers to the HTML element of the event. You can use this.textContent="..." to change the text of a button.
    //hint: inside the event handler function of a checkbox, this.checked is the boolean checked state of the checkbox.
    document.getElementById('use-perspective').onchange = function(e){
        usePerspective = !usePerspective;
    }

    document.getElementById('use-projection').onchange = function(e){
        useProjection = !useProjection;
    }
	
    
	
	
	
	
	//todo: keys to control the camera and cube for example. You can also use the mouse or sliders.
	
	//hint: using sensible change rates and limits help prevent moving the cube out of the camera's view. Note components of theta are in degrees.
	//hint: without a projection, the visible area in the frame of the camera is a cube from -1 to 1 in x, y and z coordinates. This means the distance from the camera to any face of the cube should be less than 1 for it to be visible, for example.
	
	//example: document.addEventListener("keydown",function(e){ ... });
	//hint: you can use conditions like if(e.key=="a") or if(e.keyCode==37). You can look up key codes, or use console.log(e.keyCode) in this listener to see what's the code of a key you press.
	//hint: after changing the cube or camera's frame, call render() again.
    
    //Rotation Key Events
	document.addEventListener("keydown", function(e){
        switch(e.key){
            //Arrow Up & Down = y axis
            case 'ArrowUp':
                updateRotation(yAxis, 'up');
                break;
            case 'ArrowDown':
                updateRotation(yAxis, 'down');
                break;
            //Arrow Left & Right = x axis
            case 'ArrowLeft':
                updateRotation(xAxis, 'up');
                break;
            case 'ArrowRight':
                updateRotation(xAxis, 'down');
                break;
            //PageUp & PageDown = z axis
            case 'PageUp':
                updateRotation(zAxis, 'up');
                break;
            case 'PageDown':
                updateRotation(zAxis, 'down');
                break;
            //translate camera position
            //camera up & down
            case 'w':
                transVector = add(transVector, vec3(0, 0.1, 0));
                break;
            case 's':
                transVector = add(transVector, vec3(0, -0.1, 0));
                break;
            //camera left & right
            case 'a':
                transVector = add(transVector, vec3(-0.1, 0, 0));
                break;
            case 'd':
                transVector = add(transVector, vec3(0.1, 0, 0));
                break;
            //camera back & front
            case 'z':
                transVector = add(transVector, vec3(0, 0, 0.1));
                break;
            case 'x':
                transVector = add(transVector, vec3(0, 0, -0.1));
                break;
            default:
                return;
        }
        e.preventDefault();
    });
	
	
	//todo: show the camera position and direction(whether it's looking at the cube) in text. 
	//hint: You can set the text like this:
	//cameraText = document.getElementById("camera-text"); cameraText.textContent="..." 

    render();
}

function updateRotation(a, direction){
    if(direction === 'up'){
        let val = theta[a];
        val += 0.5;
        theta[a] = val;
    }
    else{
        let val = theta[a];
        val += -0.5;
        theta[a] = val;
    }
}


function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//todo: compute the model matrix here instead of in the shader
	//modelMatrix=...
	//hint: you can use rotateX, rotateY and rotateZ to get matrices and combine them.

    modelMatrix = mult(modelMatrix, rotateX(theta[xAxis]));
    modelMatrix = mult(modelMatrix, rotateY(theta[yAxis]));
    modelMatrix = mult(modelMatrix, rotateZ(theta[zAxis]));
    var transMatrix = translate(transVector[0], transVector[1], transVector[2]);
    resultMatrix = mult(transMatrix, modelMatrix);
    theta = [0,0,0];

    if(useProjection){
        projectionMatrix = ortho(-1, 1, -1, 1, 0.3, 5.0);
    }
    if(usePerspective){
        if(!useProjection){
            projectionMatrix = perspective(45, 1, 0.2, 1);
        }
        else{
            projectionMatrix = mult(projectionMatrix, perspective(45, 1, 0.3, 5));
        }
    }

    resultMatrix = mult(resultMatrix, projectionMatrix);

    if(transVector[2] > 0.01 || transVector[2] < -0.01){
        otherText = "Looking at cube: false";
    }
    else{
        otherText = "Looking at cube: true";
    }

    cameraText = document.getElementById('camera-text');
    cameraText.textContent = 'Camera position: ' + transVector + " " + otherText;
	//todo: 
	//1. compute the view matrix when the camera is pointing at the -z direction.
	//hint: here the view matrix is the inverse of the camera matrix, which is a translation from the origin to the position of the camera(by default the camera is already looking towards the -z direction if you don't rotate it). Then combine the model and view matrices. There's a function translate( x, y, z ).
	//2. add support for looking at the cube
	//hint: there's a function lookAt( eye, at, up ). We want the camera (eye) to look at the center of the cube.


	//3. add orthographic or perspective projection if it's enabled, and multiply the projection matrix with the model-view matrix.
	//hint: there are functions perspective( fovy, aspect, near, far ) and ortho( left, right, bottom, top, near, far ).

	//set the matrix uniform - flatten() already transposes into column-major order.
	gl.uniformMatrix4fv(matrixLoc, false, flatten(resultMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);
}
