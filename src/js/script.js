/*
    Nome: TETRIS
    Autor: Pedro Miranda (pLogicador)
    Data de Criação: 12/09/2023
    Descrição: 
        Desenvolvi uma Reinterpretação simples do Tetris. Esta reimaginação do clássico Tetris captura a essência da diversão intemporal, 
        desafio estratégico e gratificação instantânea que o Tetris sempre proporcionou, enquanto adiciona elementos únicos e 
        inovações modernas.

        OBS: Em fase de testes!!

*/

const gridWidth = 10; // tamanho total de linhas 

const musicThresholds = [500, 1000, 1500]; // Pontuações em que a música deve mudar
let currentMusicIndex = 0; // Índice da música atual


const musicA = new Audio("./src/assets/sounds/A-TypeMusic.mp3");
const musicB = new Audio("./src/assets/sounds/A-TypeMusic(v1.0).mp3");
const musicC = new Audio("./src/assets/sounds/B-TypeMusic.mp3");
const musicD = new Audio("./src/assets/sounds/C-TypeMusic.mp3");
const musicE = new Audio("./src/assets/sounds/TetrisBGM1.mp3");
const musicF = new Audio("./src/assets/sounds/TetrisBGM1(Fast).mp3");
const musicG = new Audio("./src/assets/sounds/TetrisBGM2.mp3");
const musicH = new Audio("./src/assets/sounds/TetrisBGM2(Fast).mp3");

const completLineAudio = new Audio("./src/assets/sounds/StageClear.mp3");
const gameOverAudio = new Audio("./src/assets/sounds/GameOver.mp3")
const freezeAudio = new Audio("./src/assets/sounds/block.mp3");


const muteButton = document.getElementById("mute-button");
const audioIcon = document.getElementById("audio-icon");

let isMuted = false;


muteButton.addEventListener("click", () => {
    isMuted = !isMuted; // Inverte o estado de mutado

    if (isMuted) {
      // Desmutar o áudio globalmente
        unmuteAudio();
    } else {
      // Mutar o áudio globalmente
        muteAudio();
    }
});

function muteAudio() {
    // Altere a classe do ícone para "audio-off" (ícone de "mute")
    audioIcon.classList.remove("audio-on");
    audioIcon.classList.add("audio-off");

    // Define volume de todas as músicas para 0
    musicA.volume = 0;
    musicB.volume = 0;
    musicC.volume = 0;
    musicD.volume = 0;
    musicE.volume = 0;
    musicF.volume = 0;
    musicG.volume = 0;
    musicH.volume = 0;


}

function unmuteAudio() {
    // Altere a classe do ícone para "audio-on" (ícone de alto-falante)
    audioIcon.classList.remove("audio-off");
    audioIcon.classList.add("audio-on");

    // Restaura o volume de todas as músicas para 1.0 (valor original)
    musicA.volume = 1.0;
    musicB.volume = 1.0;
    musicC.volume = 1.0;
    musicD.volume = 1.0;
    musicE.volume = 1.0;
    musicF.volume = 1.0;
    musicG.volume = 1.0;
    musicH.volume = 1.0;

}





let currentMusic = musicA; // Inicialmente, com a música A
let musicStarted = false; // Flag para verificar se a música já começou

function playBackgroundMusic() {
    if (!musicStarted) {
        currentMusic.play();
        musicStarted = true;
    }
}

function playCompleteLineAudio() {
    completLineAudio.play();

    linesCleared++; // Incrementa o contador de linhas
    updateLinesCounter(); // Atualiza o contador de linhas
    
}

function changeMusic(newMusic) {
    currentMusic.pause();
    currentMusic = newMusic;
    currentMusic.currentTime = 0;
    currentMusic.play();
}

function changeMusicAndDifficulty() {
    // Verifica se a pontuação atingiu um dos limiares
    if (score >= musicThresholds[currentMusicIndex]) {
        // Avança para a próxima música (se houver) e aumenta a dificuldade
        currentMusicIndex++;
        if (currentMusicIndex < musicThresholds.length) {
            changeMusic(musicArray[currentMusicIndex]);
            increaseDifficulty();
        }
    }
}


function playPauseSound() {
    const pauseSound = new Audio("./src/assets/sounds/pause-clear.wav");
    pauseSound.play();
}



// Formas
const lShape = [
    // 1° rotação, 2° rotação, 3°rotação, 4°rotação
    [1, 2, gridWidth+1, gridWidth*2+1], 
    [gridWidth, gridWidth+1, gridWidth+2, gridWidth*2+2],
    [1, gridWidth+1, gridWidth*2, gridWidth*2+1],
    [gridWidth, gridWidth*2, gridWidth*2+1, gridWidth*2+2]

]

const zShape = [
    [gridWidth + 1, gridWidth + 2, gridWidth*2, gridWidth*2 + 1],
    [0, gridWidth, gridWidth + 1, gridWidth*2 + 1],
    [gridWidth + 1, gridWidth + 2, gridWidth*2, gridWidth*2 + 1],
    [0, gridWidth, gridWidth + 1, gridWidth*2 + 1]
]

const tShape = [
    [1, gridWidth, gridWidth + 1, gridWidth + 2],
    [1, gridWidth + 1, gridWidth + 2, gridWidth*2 + 1],
    [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth*2 + 1],
    [1, gridWidth, gridWidth + 1, gridWidth*2 + 1]
]

const oShape = [
    [0, 1, gridWidth, gridWidth + 1],
    [0, 1, gridWidth, gridWidth + 1],
    [0, 1, gridWidth, gridWidth + 1],
    [0, 1, gridWidth, gridWidth + 1]
]

const iShape = [
    [1, gridWidth + 1, gridWidth*2 + 1, gridWidth*3 + 1],
    [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3],
    [1, gridWidth + 1, gridWidth*2 + 1, gridWidth*3 + 1],
    [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3]
]

const allShapes = [lShape, zShape, tShape, oShape, iShape];

/*Definição de cores para formas*/
const colors = ["red", "green", "orange", "yellow", "pink"];
let currentColor = Math.floor(Math.random() * colors.length);
let nextColor = colors[currentColor];






// @1.0 Cálculo para geração aleatória dos formatos
let currentPosition = 3;
let currentRotation = 0;
let randomShape = Math.floor(Math.random() * allShapes.length);
let currentShape = allShapes[randomShape][currentRotation];
let $gridSquares = Array.from(document.querySelectorAll(".grid div"));





/*Funções para Desenhar, apagar, e congelar*/
function drawShape(){
    currentShape.forEach(squareIndex => {
        $gridSquares[squareIndex + currentPosition].classList.add("shapePainted", `${colors[currentColor]}`);
    })
}

drawShape();

function eraseShape(){
    currentShape.forEach(squareIndex => {
        $gridSquares[squareIndex + currentPosition].classList.remove("shapePainted", `${colors[currentColor]}`);
    })
}


function freezeFilled(){
    if (currentShape.some(squareIndex =>
        $gridSquares[squareIndex + currentPosition + gridWidth].classList.contains("filled")
    )) {
        
        currentShape.forEach(squareIndex => $gridSquares[squareIndex + currentPosition].classList.add("filled"))

        currentPosition = 3;
        currentRotation = 0;
        // @1.0
        randomShape = nextRandomShape;
        currentShape = allShapes[randomShape][currentRotation];
        currentColor = nextColor;

        drawShape();
        checkIfRowsFilled();

        // para cada vez que um shape for congelado recebe 5pts
        updateScore(5);
        displayNextShape();
        freezeAudio.play();
        
        gameOver();
    }
}











/*Preview do próximo formato*/
const $miniGridSquares = document.querySelectorAll(".mini-grid div");
const miniGridWidth = 6;
const nextPosition = 2;
const possibleNextShapes = [
    [ 1, 2, miniGridWidth+1, miniGridWidth*2+1 ],
    [ miniGridWidth+1, miniGridWidth+2, miniGridWidth*2, miniGridWidth*2+1 ],
    [ 1, miniGridWidth, miniGridWidth+1, miniGridWidth+2],
    [ 0, 1, miniGridWidth, miniGridWidth+1],
    [ 1, miniGridWidth+1, miniGridWidth*2+1, miniGridWidth*3+1 ]
]


let nextRandomShape = Math.floor(Math.random() * possibleNextShapes.length);


function displayNextShape(){
    
    // apaga os formatos antigos
    $miniGridSquares.forEach(square => square.classList.remove("shapePainted", `${colors[nextColor]}`));
    nextColor = Math.floor(Math.random() * colors.length)


    nextRandomShape = Math.floor(Math.random() * possibleNextShapes.length);
    const nextShape = possibleNextShapes[nextRandomShape];

    nextShape.forEach(squareIndex =>
        $miniGridSquares[squareIndex + nextPosition + miniGridWidth].classList.add("shapePainted", `${colors[nextColor]}`)
    );
    
}

displayNextShape();






/*Start,  restart, pause*/

let timeMoveDown = 600;
let timerId = null;
const $startStopButton = document.getElementById("start-button") ;

$startStopButton.addEventListener("click", ()=>{
    if (timerId){
        pauseGame();


    } else {
        timerId = setInterval(moveDown, timeMoveDown);

        playBackgroundMusic();
    }
})

const $restartButton = document.getElementById("restart-button");

$restartButton.addEventListener("click", ()=>{
    window.location.reload();
})



function pauseGame() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        $startStopButton.textContent = "Play";
        currentMusic.pause();
        musicStarted = false;

        playPauseSound();
    }
}






/*Funções de movimentos */
function moveDown(){
    freezeFilled();

    eraseShape();
    currentPosition += 10;
    drawShape();
}

function moveLeft(){
    // @1.2 Verificação para o limite de borda
    const isEdgeLimit  = currentShape.some((squareIndex) => (squareIndex + currentPosition) % gridWidth === 0)
    if (isEdgeLimit) return

    const isFilled = currentShape.some(squareIndex => 
        $gridSquares[squareIndex + currentPosition - 1].classList.contains("filled")
    )
    if (isFilled) return


    eraseShape();
    currentPosition--
    drawShape();
}

function moveRight(){
    // @1.2
    const isEdgeLimit  = currentShape.some((squareIndex) => (squareIndex + currentPosition) % gridWidth === gridWidth - 1)
    if (isEdgeLimit) return


    const isFilled = currentShape.some(squareIndex => 
        $gridSquares[squareIndex + currentPosition + 1].classList.contains("filled")
    )
    if (isFilled) return


    eraseShape();
    currentPosition++
    drawShape();
}

function previousRotation(){
    if (currentRotation === 0){
        currentRotation = currentShape.length - 1;
    } else {
        currentRotation--;
    }

    currentShape = allShapes[randomShape][currentRotation];
}

function rotateShape(){
    eraseShape();

    if (currentRotation === currentShape.length - 1) {
        currentRotation = 0;
    } else {
        currentRotation++;
    }


    currentShape = allShapes[randomShape][currentRotation]

    const isLeftEdgeLimit = currentShape.some((squareIndex)=> (squareIndex + currentPosition) % gridWidth === 0 )
    const isRightEdgeLimit = currentShape.some((squareIndex)=> (squareIndex + currentPosition) % gridWidth === gridWidth-1 )

    if (isLeftEdgeLimit && isRightEdgeLimit){
        previousRotation();
    }


    const isFilled  = currentShape.some(squareIndex =>
        $gridSquares[squareIndex + currentPosition].classList.contains("filled")
    )
    if (isFilled) {
        previousRotation();
    }


    drawShape();

}



/*Ao preencher uma linha completa*/
let $grid = document.querySelector(".grid");

function checkIfRowsFilled(){
    // verificando de 10 a 10 linhas
    for (row = 0; row < $gridSquares.length; row += gridWidth){
        let currentRow = [];

        for (var square = row; square < row + gridWidth; square++){
            currentRow.push(square);
        }

        const isRowPainted = currentRow.every( square=> 
            $gridSquares[square].classList.contains("shapePainted") 
        )

        if (isRowPainted) {
            const squareRemoved = $gridSquares.splice(row, gridWidth);
            squareRemoved.forEach(square => {
                square.classList.remove("shapePainted", "filled");
                square.removeAttribute("class");
            });
        
            $gridSquares = squareRemoved.concat($gridSquares);
            $gridSquares.forEach(square => $grid.appendChild(square));
        
            updateScore(50);
            playCompleteLineAudio();
        }
    }
}



// variável para rastrear o número de linhas completadas
let linesCleared = 0;

function updateLinesCounter() {
    const $linesCount = document.getElementById('lines-count');
    $linesCount.textContent = linesCleared;
}





/* Função para atualizar a pontuação e a dificuldade*/
const $score = document.querySelector(".score");
let score = 0;

function updateScore(updateValue){
    score += updateValue;
    $score.textContent = score;

    
    // Dificuldades conforme pontuação
    clearInterval(timerId)
    changeMusicAndDifficulty();

    timerId = setInterval(moveDown, timeMoveDown);

}



function changeMusicAndDifficulty() {
    if (score > 500 && score <= 1200 && currentMusic !== musicB) {
        timeMoveDown = 500;
        changeMusic(musicB);
        applyTheme(1);
        

    } else if (score > 1200 && score <= 1500 && currentMusic !== musicC) {
        timeMoveDown = 400;
        changeMusic(musicC);
        applyTheme(2);
        

    } else if (1500 < score && score <= 1900 && currentMusic !== musicD) {
        timeMoveDown = 250;
        changeMusic(musicD);
        applyTheme(3);
        
    } else if (1900 < score && score <= 2300 && currentMusic !== musicE) {
        timeMoveDown < 150;
        changeMusic(musicE);
        applyTheme(4);

    } else if (2300 < score && score <= 5900 && currentMusic !== musicF) {
        timeMoveDown < 100;
        changeMusic(musicF);
        applyTheme(5);

    } else if (5900 < score && score <= 9900 && currentMusic !== musicG) {
        timeMoveDown < 100;
        changeMusic(musicG);
        applySnowTheme();

    } else if (9900 < score && score <= 10900 && currentMusic !== musicG){
        timeMoveDown < 90;
        changeMusic(musicG);
        applyRainTheme();
    }
}

/* Temas para cada dificuldade */
function applyTheme(themeNumber) {
    // Remove todas as classes de tema do elemento .grid
    const grid = document.querySelector('.grid');
    grid.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');

    // Aplica a classe de tema com base na dificuldade
    grid.classList.add(`theme-${themeNumber}`);

}

/* Tema da chuva */
function applyRainTheme() {
    const grid = document.querySelector('.grid');
    grid.classList.add('theme-rain');

    // Ajusta a cor do score para o tema de chuva
    const scoreElement = document.querySelector('.score');
    scoreElement.style.color = 'red';

    const miniGrid = document.querySelector('.mini-grid');
    miniGrid.classList.add('theme-rain-mini-grid');

    const contentRight = document.querySelector('.content-right');
    contentRight.classList.add('theme-rain-content-right');
}



/* Tema da neve */
function applySnowTheme() {
    const grid = document.querySelector('.grid');
    grid.classList.add('theme-snow');

    // Ajusta a cor do score para o tema da neve
    const scoreElement = document.querySelector('.score');
    scoreElement.style.color = 'blue';

    const miniGrid = document.querySelector('.mini-grid');
    miniGrid.classList.add('theme-snow-mini-grid');

    const contentRight = document.querySelector('.content-right');
    contentRight.classList.add('theme-snow-content-right');
}




/* Função game over*/
function gameOver(){
    if (currentShape.some(squareIndex =>
        $gridSquares[squareIndex + currentPosition].classList.contains("filled")
    )) {
        updateScore(-13);
        clearInterval(timerId);
        timerId = null;
        $startStopButton.disabled = true;

        if (musicStarted) {
            currentMusic.pause();
            musicStarted = false;
        }

        gameOverAudio.play();
        $score.innerHTML += "<br />" + "<br />" + "GAMER OVER";
    };
}




// Evento de cliques
document.addEventListener("keydown", controlKeyBoard);

function controlKeyBoard(event){
    if (timerId){
        if(event.key === "ArrowLeft"){
            moveLeft();
        } else if (event.key === "ArrowRight")
        {
            moveRight();
        } else if (event.key === "ArrowDown"){
            moveDown();
        } else if (event.key === "ArrowUp")
        {
            rotateShape();
        }
    }

}

/*Caso mobile*/
const isMobile = window.matchMedia('(max-width: 990px)').matches;


if (isMobile){
    const $mobileButtons = document.querySelectorAll(".mobile-buttons-container button");
    $mobileButtons.forEach(button => button.addEventListener("click", ()=>{
        if (timerId){
            if (button.classList[0] === "left-button"){
                moveLeft();
            } else if (button.classList[0] === "right-button"){
                moveRight();
            } else if (button.classList[0] === "down-button"){
                moveDown();
            } else if (button.classList[0] === "rotate-button"){
                rotateShape();
            }
        }

    }))
}
