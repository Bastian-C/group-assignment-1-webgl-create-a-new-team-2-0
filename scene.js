

// Set Vertex and Fragment Shaders. Unnessecary in this version, since shaders are loaded from an external source.

// "attribute" are input parameters, while "varying" are outputs
// One can define the precision for each float or set an overall precision for all used floats. Example: precision mediump float;. Sets the precision to medium.

// Vertex Shader  

// -----______------
// var vertexShaderText = 
// `precision mediump float; 		

// attribute vec3 vertPosition;		// vertPosition is a 3d vector, as such vec3 is used. vertTexCoord referes to the coordinates on a 2D immage as such a vec2 is being used. 
// attribute vec2 vertTexCoord;		// vertTexCoors is a 2d vector, because it details the y/x coordinates on a flat image.
// varying vec2 fragTexCoord;		// Texture Coordinates for the Fragment Shader.
// uniform mat4 mWorld; 			// mat4 = 4x4 Matrix
// uniform mat4 mView;				
// uniform mat4 mProj;

// void main()
// {
//   fragTexCoord = vertTexCoord;
//   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);  // OpenGL multiplies in reverse order!
// }
// `;
// _____-----_____

// Vertex Shader
// -----______------
// Output for Fragment Shaders are allways gl Colors. 
// var fragmentShaderText =
// `
// precision mediump float;

// varying vec2 fragTexCoord;
// uniform sampler2D sampler;  		// Samples the given Image.

// void main()
// {
//   gl_FragColor = texture2D(sampler, fragTexCoord);		// Pases the Texture information and the coordinates onto the FragColor.
// }
// `;
// _____-----_____


// Loading ressources.

var InitDemo = function () {
	loadTextResource('./shader/shader.vs.glsl', function (vsErr, vsText) { // Calls function: loadTextResource. See util.js. 
		if (vsErr) {
			alert('Fatal error getting vertex shader (see console)');
			console.error(vsErr);
		} else {
			loadTextResource('./shader/shader.fs.glsl', function (fsErr, fsText) {
				if (fsErr) {
					alert('Fatal error getting fragment shader (see console)');
					console.error(fsErr);
				} else {
					loadJSONResource('./Gate.json', function (modelErr, modelObj) { // Calls function: loadJSONResource. See util.js.
						if (modelErr) {
							alert('Fatal error getting Gate model (see console)');
							console.error(fsErr);
						} else {
							loadImage('./textures/Xenon_Diffuse.png', function (imgErr, img) { // Calls function: loadImage. See util.js.
								if (imgErr) {
									alert('Fatal error getting Xenon Base texture (see console)');
									console.error(imgErr);
								} else { 
									RunDemo(vsText, fsText, img, modelObj); // Runs the RunDemo function with the Loaded Ressources.
								}
							});
						}
					});
				}
			});
		}
	});
};



var RunDemo = function (vertexShaderText, fragmentShaderText, gateImage, gateModel) {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl'); // Get openGL context

	if (!gl) { // Check if WebGL is supported. If not: Fall back on experimental-WebGL.
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0); // Define the clear color. Any pixel that does not get overwritten with another color will display this color instead.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Defines what to clear. Clears the color buffer which stores the values for the color and the depth buffer which stores Z-Values, used for ordering objects.
	gl.enable(gl.DEPTH_TEST); // Checks for depth. Objects will now be rendered infront of other objects.
	gl.enable(gl.CULL_FACE); // Enables face culling.
	gl.frontFace(gl.CCW); // Defines which Face is a front facing one. A front facing one is a face, where the Vertex Order of Appearance is CounterClockWise (CCW)
	gl.cullFace(gl.BACK); // Defines which Face to cull. (Back face Culling)

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);  // Create a new shader object. Type: Vertex Shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); // Create a new shader object. Type: Fragment Shader

	gl.shaderSource(vertexShader, vertexShaderText); // Set the Shader Source. (X,Y) X = Shader which you want to set the source code for. Y = The actual source code.
	gl.shaderSource(fragmentShader, fragmentShaderText);// Set the Shader Source. (X,Y) X = Shader which you want to set the source code for. Y = The actual source code.

	gl.compileShader(vertexShader); // Compile the given Shader. Repeat for Vertex and Fragment Shaders.
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {  // Check for Errors.
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader); // Compile the given Shader. Repeat for Vertex and Fragment Shaders.
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {  // Check for Errors.
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram(); // Create a new Program
	gl.attachShader(program, vertexShader);	// Attaches the Vertex Shader to the program.
	gl.attachShader(program, fragmentShader); // Attaches the Fragment Shader to the program.
	gl.linkProgram(program); // Links the Program. (Order: 1. Compile 2. Link). Linking references externally defined objects and makes them operational through a single executable program.
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { 
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program); // Validates the Program. This catches additional Errors. Remove on final application, because this check takes up ressources.
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	
	// Create buffer (Setting the information which the GPU is using)
	
	var gateVertices = gateModel.meshes[0].vertices; // Array of Vertex Positions. gateModel is the loaded JSON file.
	var gateIndices = [].concat.apply([], gateModel.meshes[0].faces); // Makes the Array uniform. If loaded from a JSON file, the array will be an array of arrays like this: [ [0,0,1],[0,1,1], ...]. This turns that complex array into a simple one like this: [0,0,1,0,1,1,...]
	var gateTexCoords = gateModel.meshes[0].texturecoords[0]; // Array of Texture Coordinates.

	var gatePosVertexBufferObject = gl.createBuffer(); // Defines a chunk of memory on the GPU.
	gl.bindBuffer(gl.ARRAY_BUFFER, gatePosVertexBufferObject); // Defines the created Buffer (chunk of memory) to be an Array Buffer. Ready to recieve Data now.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gateVertices), gl.STATIC_DRAW); // Uses the last active buffer (the current one is gatePosVertexBufferObject) and loads the specified Data into the Buffer once throught gl.STATIC_DRAW. CAREFULL: Javascript stores Floats as 64 bit. OpenGL however expects 32 bits. new Float32Array is nessecary.

	var gateTexCoordVertexBufferObject = gl.createBuffer(); // See var gatePosVertexBufferObject. However: This current Buffer becomes the new active Buffer.
	gl.bindBuffer(gl.ARRAY_BUFFER, gateTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gateTexCoords), gl.STATIC_DRAW);

	var gateIndexBufferObject = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gateIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gateIndices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, gatePosVertexBufferObject);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition'); // Creates a Handle for the Attribute which recieves the Vertex Data 
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute. Since it is a Vec3 -> Number of Elements = 3
		gl.FLOAT, // Type of elements. Values are stored as Float.
		gl.FALSE, 
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex. Float34Array.BYTES_PER_ELEMENT = 4.
		0 // Offset from the beginning of a single vertex to this attribute. Usefull for storing additional Information like UVs in a single Attribute. Not being used because UVs are stored seperately here.
	);
	gl.enableVertexAttribArray(positionAttribLocation); // Enables the Attribute

	gl.bindBuffer(gl.ARRAY_BUFFER, gateTexCoordVertexBufferObject);
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAttribLocation, 
		2, // UVs are stored in a 2D format. So Vec2 -> Number of Elements = 2.
		gl.FLOAT, 
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	gl.enableVertexAttribArray(texCoordAttribLocation);

	
	// Create texture
	
	var gateTexture = gl.createTexture(); // Creates a new Texture
	gl.bindTexture(gl.TEXTURE_2D, gateTexture); // Binds the gateTexture
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flips the Texture on the Y axis. Required because the Immage is imported upside down.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Sets a Parameter for the Texture. OpenGL uses "S" instead of "U" for the UV map.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Sets a Parameter for the Texture. OpenGL uses "T" instead of "V" for the UV map.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // A texture filter constant to use when a surface is rendered smaller than the corresponding texture Bitmap (example: Very distant objects)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);	// A texture filter constant to use when a surface is rendered larger than the corresponding texture Bitmap (example: Very close objects)
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		gateImage								// The loaded Texture.
	);
	gl.bindTexture(gl.TEXTURE_2D, null); // Unbinds the Texture.

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix); // Writes into the worldMatrix
	mat4.lookAt(viewMatrix, [0, 0, -150], [0, 0, 0], [0, 1, 0]); // Uses the GL-MATRIX Library. Writes into the viewMatrix. Syntax: lookAt(outRequiresMat4, PositionOfTheCamera, WhereTheCameraLooksAt, WhichDirectionIsUpForTheCamera)
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);  // Perspective Settup. Writes into the projMatrix. (Matrix, Field Of View, Aspect Ratio Typically ViewportWidth / ViewportHeight, Closest Possible Object, Furthest Possible Object.)

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);

	
	// Main render loop

	var angle = 0;	

	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		// Rotate: (Output Matrix, Original Matrix, Angle of Rotation, Axis of Rotation)
		mat4.rotate(yRotationMatrix, identityMatrix, angle / 1, [0, 1, 0]);  // Uses the GL-MATRIX Library.
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 100, [1, 0, 0]);  // Uses the GL-MATRIX Library.
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); // Multiplies the two rotation matrices.
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); 

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, gateTexture);	
		gl.activeTexture(gl.TEXTURE0); 				// Binds the active Texture to the 0th sampler slot.

		gl.drawElements(gl.TRIANGLES, gateIndices.length, gl.UNSIGNED_SHORT, 0); // (What to Draw, How many Vertices, Type of the Index, Start of the Vertex List)

		requestAnimationFrame(loop); // Loops the Animation. Also only calls for a new Frame if the window is active. Saves Ressources.
	};
	requestAnimationFrame(loop);
};