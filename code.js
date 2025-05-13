const brick_speed = 0.1; //what speed do we move towards our goal (between 0 and 1)
const tolerance = 0.1; //how close do we have to be to considerourself at our destination

var scene, camera, renderer, light, ambient_light; //threejs variables
const canvas = document.getElementById('game'); //where we draw our game

let current_rotation = 0;
let current_shape = 0;

let pause = true; //start waiting since we start in a menu

let cubes = []; //a list of all of our blocks
//the position we want all of our blocks on the tetris board
let board =
[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];


addEventListener('keydown', key_down);

function delete_completed_rows() {
    let count = 0;
    for (let i = 0; i < board.length - 1; i ++) {
        count = 0;
        for (let j = 0; j < board[i].length; j ++) {
            if (board[i][j] < 0) count ++;
        }
        if (count == 10) {
            console.log("delete row", i);
            board.splice(i, 1);
            board.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]);
        }
    }
}

function drop_shape() {
    for (let i = 0; i < 20; i ++) {
        if (increment_game() == true) return;
    }
}

//update board array
function increment_game() {
    let move_pieces = [{i:0,j:0,value:0},{i:0,j:0,value:0},{i:0,j:0,value:0},{i:0,j:0,value:0}];
    let move_index = 0;

    delete_completed_rows();

    for (let i = 0; i < board.length - 1; i ++) {
        for (let j = 0; j < board[i].length; j ++) {
            if (board[i][j] > 0 && board[i+1][j] >= 0) {
                move_pieces[move_index].i = i;
                move_pieces[move_index].j = j;
                move_pieces[move_index].value = board[i][j];
                move_index++;
            }
        }
    }
    if (move_index != 4) {
        flip_board();
        add_tetris_shape();
        return true;
    }
    //move the pieces
    for (let i = 0; i < 4; i ++) {
        board[move_pieces[i].i][move_pieces[i].j] = 0;
    }
    for (let i = 0; i < 4; i ++) {
        board[move_pieces[i].i + 1][move_pieces[i].j] = move_pieces[i].value;
    }
    return false;
}

function move_shape(direction) {
    let move_pieces = [{i:0,j:0,value:0},{i:0,j:0,value:0},{i:0,j:0,value:0},{i:0,j:0,value:0}];
    let move_index = 0;

    for (let i = 0; i < board.length; i ++) {
        for (let j = 0; j < board[i].length; j ++) {
            if ((direction == -1 && j > 0) || (direction == 1 && j < board[i].length - 1)) {
                //find all pieces that need to move
                if (board[i][j] > 0 && board[i][j + direction] >= 0) {
                    move_pieces[move_index].i = i;
                    move_pieces[move_index].j = j;
                    move_pieces[move_index].value = board[i][j];
                    move_index++;
                }
            }
        }
    }
    if (move_index != 4) return;
    //move the pieces
    for (let i = 0; i < 4; i ++) {
        board[move_pieces[i].i][move_pieces[i].j] = 0;
    }
    for (let i = 0; i < 4; i ++) {
        board[move_pieces[i].i][move_pieces[i].j + direction] = move_pieces[i].value;
    }
}

function delete_shape (do_delete) {
    let return_value = {x: 0, y: 0, z: 0};
    for (let i = 0; i < board.length; i ++) {
        for (let j = 0; j < board[i].length; j ++) {
            if (board[i][j] > 0) {
                return_value.x = j;
                return_value.y = i;
                if (do_delete) board[i][j] = 0;
            }
        }
    }
    return return_value;
}

const rotate_matrix =
[
    [
        [0,-1,-2,0,-1,0,0,0], //l
        [-1,-2,0,-2,0,-1,0,0],
        [-2,1,-2,0,-1,0,0,0],
        [1,0,0,0,0,-1,0,-2]
    ],
    [
        [-2,0,-1,0,0,0,0,1], //j
        [1,-1,0,-1,0,0,0,1],
        [-2,-1,-2,0,-1,0,0,0],
        [-1,0,0,0,0,-1,0,-2]
    ],
    [
        [0,-1,-1,0,0,0,0,1], //t
        [-1,-1,0,-1,0,0,1,-1],
        [-1,-1,0,0,-1,0,-1,1],
        [-1,0,0,0,0,-1,1,0]
    ],
    [
        [-1,-1,0,-1,-1,0,0,0], //cube
        [-1,-1,0,-1,-1,0,0,0],
        [-1,-1,0,-1,-1,0,0,0],
        [-1,-1,0,-1,-1,0,0,0]
    ],
    [
        [-1,-1,0,-1,1,-1,2,-1], //i
        [-2,-2,-2,-1,-2,0,-2,1],
        [-1,-1,0,-1,1,-1,2,-1],
        [-2,-2,-2,-1,-2,0,-1,1]
    ],
    [
        [-1,0,-1,1,0,0,0,-1], //s
        [-1,-1,0,-1,0,0,1,0],
        [-1,0,-1,1,0,0,0,-1],
        [-1,-1,0,-1,0,0,1,0],
    ],
    [
        [-1,-1,-1,0,0,0,0,1], //z
        [-1,0,0,0,0,-1,1,-1],
        [-1,-1,-1,0,0,0,0,1],
        [-1,0,0,0,0,-1,1,-1]
    ],
];

function get_matrix_index(a, b, c) {
    return rotate_matrix[a][b][c];
}

function rotate_shape(direction) {
    current_rotation = (current_rotation + 4 + direction) % 4;
    if (current_shape == 3) return;

    let pos = delete_shape(true);
    
    board[pos.y + get_matrix_index(current_shape, current_rotation, 0)][pos.x + get_matrix_index(current_shape, current_rotation, 1)] = cubes.length - 3;
    board[pos.y + get_matrix_index(current_shape, current_rotation, 2)][pos.x + get_matrix_index(current_shape, current_rotation, 3)] = cubes.length - 2;
    board[pos.y + get_matrix_index(current_shape, current_rotation, 4)][pos.x + get_matrix_index(current_shape, current_rotation, 5)] = cubes.length - 1;
    board[pos.y + get_matrix_index(current_shape, current_rotation, 6)][pos.x + get_matrix_index(current_shape, current_rotation, 7)] = cubes.length - 0;
    
/*
    if (current_shape == 0) { //L
        if (current_rotation == 0) {
            board[pos.y - 2][pos.x - 0] = cubes.length - 2;
            board[pos.y - 1][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x - 0] = cubes.length - 0;
            board[pos.y - 0][pos.x + 1] = cubes.length - 3;
        }
        else if(current_rotation == 1) {
            board[pos.y + 1][pos.x - 1] = cubes.length - 3;
            board[pos.y - 0][pos.x - 1] = cubes.length - 2;
            board[pos.y - 0][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x + 1] = cubes.length - 0;
        }
        else if(current_rotation == 2) {
            board[pos.y - 2][pos.x - 1] = cubes.length - 3;
            board[pos.y - 2][pos.x - 0] = cubes.length - 2;
            board[pos.y - 1][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x + 0] = cubes.length - 0;
        }
        else {
            board[pos.y - 1][pos.x - 0] = cubes.length - 3;
            board[pos.y - 0][pos.x - 0] = cubes.length - 2;
            board[pos.y - 0][pos.x - 1] = cubes.length - 1;
            board[pos.y - 0][pos.x - 2] = cubes.length - 0;
        }
    }

    if (current_shape == 1) { //J
        if (current_rotation == 0) {
            board[pos.y - 0][pos.x - 1] = cubes.length - 3;
            board[pos.y - 2][pos.x - 0] = cubes.length - 2;
            board[pos.y - 1][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x - 0] = cubes.length - 0;
        }
        else if(current_rotation == 1) {
            board[pos.y - 1][pos.x - 2] = cubes.length - 3;
            board[pos.y - 0][pos.x - 2] = cubes.length - 2;
            board[pos.y - 0][pos.x - 1] = cubes.length - 1;
            board[pos.y - 0][pos.x + 0] = cubes.length - 0;
        }
        else if(current_rotation == 2) {
            board[pos.y - 2][pos.x + 1] = cubes.length - 3;
            board[pos.y - 2][pos.x - 0] = cubes.length - 2;
            board[pos.y - 1][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x + 0] = cubes.length - 0;
        }
        else {
            board[pos.y + 1][pos.x - 0] = cubes.length - 3;
            board[pos.y - 0][pos.x - 0] = cubes.length - 2;
            board[pos.y - 0][pos.x - 1] = cubes.length - 1;
            board[pos.y - 0][pos.x - 2] = cubes.length - 0;
        }
    }

    if (current_shape == 2) { //T
        if (current_rotation == 0) {
            board[pos.y - 0][pos.x - 1] = cubes.length - 3;
            board[pos.y - 1][pos.x + 0] = cubes.length - 2;
            board[pos.y - 0][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x + 1] = cubes.length - 0;
        }
        else if (current_rotation == 1) {
            board[pos.y - 1][pos.x - 1] = cubes.length - 3;
            board[pos.y - 0][pos.x - 1] = cubes.length - 2;
            board[pos.y - 0][pos.x + 0] = cubes.length - 1;
            board[pos.y + 1][pos.x - 1] = cubes.length - 0;
        }
        else if (current_rotation == 2) {
            board[pos.y - 1][pos.x - 1] = cubes.length - 3;
            board[pos.y + 0][pos.x + 0] = cubes.length - 2;
            board[pos.y - 1][pos.x - 0] = cubes.length - 1;
            board[pos.y - 1][pos.x + 1] = cubes.length - 0;
        }
        else if (current_rotation == 3) {
            board[pos.y - 1][pos.x - 0] = cubes.length - 3;
            board[pos.y - 0][pos.x + 0] = cubes.length - 2;
            board[pos.y - 0][pos.x - 1] = cubes.length - 1;
            board[pos.y + 1][pos.x + 0] = cubes.length - 0;
        }
    }

    if (current_shape == 4) { //I
        if (current_rotation == 0 || current_rotation == 2) {
            board[pos.y - 1][pos.x - 1] = cubes.length - 3;
            board[pos.y + 0][pos.x - 1] = cubes.length - 2;
            board[pos.y + 1][pos.x - 1] = cubes.length - 1;
            board[pos.y + 2][pos.x - 1] = cubes.length - 0;
        }
        else {
            board[pos.y - 2][pos.x - 2] = cubes.length - 3;
            board[pos.y - 2][pos.x - 1] = cubes.length - 2;
            board[pos.y - 2][pos.x + 0] = cubes.length - 1;
            board[pos.y - 2][pos.x + 1] = cubes.length - 0;
        }
    }
    if (current_shape == 5) { //s
        if (current_rotation == 0 || current_rotation == 2) {
            board[pos.y - 1][pos.x - 0] = cubes.length - 3;
            board[pos.y - 1][pos.x + 1] = cubes.length - 2;
            board[pos.y - 0][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x - 1] = cubes.length - 0;
        }
        else {
            board[pos.y - 1][pos.x - 1] = cubes.length - 3;
            board[pos.y - 0][pos.x - 1] = cubes.length - 2;
            board[pos.y - 0][pos.x + 0] = cubes.length - 1;
            board[pos.y + 1][pos.x + 0] = cubes.length - 0;
        }
    }
    if (current_shape == 6) { //z
        if (current_rotation == 0 || current_rotation == 2) {
            board[pos.y - 1][pos.x - 1] = cubes.length - 3;
            board[pos.y - 1][pos.x + 0] = cubes.length - 2;
            board[pos.y - 0][pos.x - 0] = cubes.length - 1;
            board[pos.y - 0][pos.x + 1] = cubes.length - 0;
        }
        else {
            board[pos.y - 1][pos.x + 0] = cubes.length - 3;
            board[pos.y - 0][pos.x + 0] = cubes.length - 2;
            board[pos.y - 0][pos.x - 1] = cubes.length - 1;
            board[pos.y + 1][pos.x - 1] = cubes.length - 0;
        }
    }
    */
}

function key_down(e) {
    if (e.key == 'a') {
        move_shape(-1);
    }
    if (e.key == 'd') {
        move_shape(1);
    }
    if (e.key == 's') {
        increment_game();
    }
    if (e.key == 'w') {
        drop_shape();
    }
    if (e.key == 'l') {
        rotate_shape(1);
    }
    if (e.key == 'k' || e.key == ' ') {
        rotate_shape(-1);
    }
}

function open_tetris() {
    pause = false; //game sould play
    document.getElementById('menu').style.display = 'none';
    document.getElementById('settings').style.display = 'none';
    document.getElementById('tetris').style.display = 'block';
}

function open_settings() {
    pause = true; //game should wait
    document.getElementById('menu').style.display = 'none';
    document.getElementById('settings').style.display = 'block';
    document.getElementById('tetris').style.display = 'none';
}

function open_menu() {
    pause = true; //game should wait
    document.getElementById('menu').style.display = 'block';
    document.getElementById('settings').style.display = 'none';
    document.getElementById('tetris').style.display = 'none';
}

function add_L() {
    board[0][4] = cubes.length + 1;
    board[1][4] = cubes.length + 2;
    board[2][4] = cubes.length + 3;
    board[2][5] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'orange'} );
}

function add_J() {
    board[0][4] = cubes.length + 1;
    board[1][4] = cubes.length + 2;
    board[2][4] = cubes.length + 3;
    board[2][3] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'blue'} );
}

function add_T() {
    board[0][4] = cubes.length + 1;
    board[1][3] = cubes.length + 2;
    board[1][4] = cubes.length + 3;
    board[1][5] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'purple'} );
}

function add_O() {
    board[0][4] = cubes.length + 1;
    board[1][4] = cubes.length + 2;
    board[0][5] = cubes.length + 3;
    board[1][5] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'yellow'} );
}

function add_I() {
    board[0][4] = cubes.length + 1;
    board[1][4] = cubes.length + 2;
    board[2][4] = cubes.length + 3;
    board[3][4] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'aqua'} );
}

function add_S() {
    board[0][4] = cubes.length + 1;
    board[0][3] = cubes.length + 2;
    board[1][3] = cubes.length + 3;
    board[1][2] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'green'} );
}

function add_Z() {
    board[0][4] = cubes.length + 1;
    board[0][5] = cubes.length + 2;
    board[1][5] = cubes.length + 3;
    board[1][6] = cubes.length + 4;
    return new THREE.MeshStandardMaterial( {color: 'red'} );
}

function add_tetris_shape() {    
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );

    let material;
    current_shape = Math.floor(Math.random()*7);
    if (current_shape == 0) material = add_L();
    if (current_shape == 1) material = add_J();
    if (current_shape == 2) material = add_T();
    if (current_shape == 3) material = add_O();
    if (current_shape == 4) material = add_I();
    if (current_shape == 5) material = add_S();
    if (current_shape == 6) material = add_Z();

    current_rotation = 0;

    const cube = [
        new THREE.Mesh( geometry, material ),
        new THREE.Mesh( geometry, material ),
        new THREE.Mesh( geometry, material ),
        new THREE.Mesh( geometry, material )];

    for (let i = 0; i < 4; i ++) {
        cube[i].castShadow = true; // default false
        cube[i].receiveShadow = true; // default false
        cubes.push(cube[i]);
        scene.add(cube[i]);
    }
}

//find where each cube wants to go
function get_to_position(index) {
    for (let i = 0; i < board.length; i ++) {
        for (let j = 0; j < board[i].length; j ++) {
            if (Math.abs(board[i][j]) == index) {
                return {x: j, y: -i+10, z: 0};
            }
        }
    }
    return {x: 100, y: 100, z: 100};
}

function flip_board() {
    for (let i = 0; i < board.length; i ++) {
        for (let j = 0; j < board[i].length; j ++) {
            board[i][j] = - Math.abs(board[i][j]);
        }
    }
}

//update graphics
function animate_frame() {
    //animate again when the system allows it
    requestAnimationFrame(animate_frame);

    if (pause == true) return;

    let movement = false;
    for (let i = 0; i < cubes.length; i ++) {
        let new_position = get_to_position(i + 1); //where does the cube want to be
        let move_position = {x:0, y:0, z:0}; //how we move towards our desitination smoothly
        move_position.x = cubes[i].position.x + (new_position.x - cubes[i].position.x) * brick_speed;
        move_position.y = cubes[i].position.y + (new_position.y - cubes[i].position.y) * brick_speed;
        move_position.z = cubes[i].position.z + (new_position.z - cubes[i].position.z) * brick_speed;

        //console.log(move_position.x, move_position.y, move_position.z);
        //find if any cubes are moving
        if (Math.abs(new_position.x - cubes[i].position.x) > tolerance || 
            Math.abs(new_position.y - cubes[i].position.y) > tolerance || 
            Math.abs(new_position.z - cubes[i].position.z) > tolerance) {
            movement = true;
        }
        //move each cube
        cubes[i].position.set(  move_position.x,
                                move_position.y,
                                move_position.z);
    }

    //if there is no movement increment the game
    if (movement == false) increment_game();

    //draw the scene
    renderer.render(scene, camera);
}

//set up our game
function main() {
    //make the canvas the size we want
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //set up camera
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 200);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    //set up renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(canvas.width, canvas.height);
    //set scene
    scene = new THREE.Scene();
    //set controls
    orbit_controls = new THREE.OrbitControls(camera, renderer.domElement);
    //add light source
    light = new THREE.PointLight();
    light.intensity = 2;
    light.position.set(0,20,2);
    light.castShadow = true; // default false
    scene.add(light);


    const geometry = new THREE.BoxGeometry(10, 23, 0.5 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    material.opacity = 0.5;
    material.transparent = true;
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(4.5, 0, 0.25);
    scene.add( cube );


    const ambient_light = new THREE.AmbientLight( 0x999999 ); // soft white light
    scene.add( ambient_light );

    //start game
    animate_frame();
}

main();
