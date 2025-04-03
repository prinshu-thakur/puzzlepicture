const fileInput = document.getElementById('file-input');
const startBtn = document.getElementById('start-btn');
const themeBtn = document.getElementById('theme-btn');
const puzzleCanvas = document.getElementById('puzzleCanvas');
const context = puzzleCanvas.getContext('2d');
const originalImage = document.getElementById('originalImage');
const message = document.getElementById('message');

const gridSize = 4; // 4x4 grid for the puzzle
let pieces = [];
let emptyPiece = { row: gridSize - 1, col: gridSize - 1 };
let img = new Image();

puzzleCanvas.width = 400;
puzzleCanvas.height = 400;

// Add actual sound file paths
const buttonSound = new Audio('button-click.mp3');
const moveSound = new Audio('move.mp3');

// Start button functionality
startBtn.addEventListener('click', () => {
  buttonSound.play();
  if (!fileInput.files.length) {
    alert('Please upload an image first!');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    img.src = event.target.result;
    originalImage.src = event.target.result; // Show the original image
    img.onload = initializeGame;
    img.onerror = () => alert("Error: Unable to load the image. Please use a valid file.");
  };
  reader.readAsDataURL(file);
});

// Theme button functionality
themeBtn.addEventListener('click', () => {
  buttonSound.play();
  document.body.classList.toggle('dark-theme');
});

// Initialize the game
function initializeGame() {
  const pieceWidth = puzzleCanvas.width / gridSize;
  const pieceHeight = puzzleCanvas.height / gridSize;

  // Create puzzle pieces
  pieces = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (row === gridSize - 1 && col === gridSize - 1) continue; // Skip the blank tile
      pieces.push({ row, col, x: col * pieceWidth, y: row * pieceHeight, originalRow: row, originalCol: col });
    }
  }

  shufflePieces();
  drawPuzzle();
  console.log("Game initialized. Pieces shuffled.");
}

// Shuffle the puzzle pieces
function shufflePieces() {
  for (let i = pieces.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  pieces.forEach((piece, index) => {
    piece.row = Math.floor(index / gridSize);
    piece.col = index % gridSize;
  });
  emptyPiece = { row: gridSize - 1, col: gridSize - 1 };
}

// Draw the puzzle
function drawPuzzle() {
  const pieceWidth = puzzleCanvas.width / gridSize;
  const pieceHeight = puzzleCanvas.height / gridSize;

  context.clearRect(0, 0, puzzleCanvas.width, puzzleCanvas.height);

  pieces.forEach((piece) => {
    context.drawImage(
      img,
      piece.originalCol * (img.width / gridSize),
      piece.originalRow * (img.height / gridSize),
      img.width / gridSize,
      img.height / gridSize,
      piece.col * pieceWidth,
      piece.row * pieceHeight,
      pieceWidth,
      pieceHeight
    );
  });

  console.log("Puzzle redrawn.");
}

// Handle arrow key presses
document.addEventListener('keydown', (e) => {
  if (checkWin()) {
    return; // Prevent moving if the puzzle is already solved
  }

  console.log(`Key pressed: ${e.key}`);

  let targetRow = emptyPiece.row;
  let targetCol = emptyPiece.col;

  switch (e.key) {
    case 'ArrowUp': targetRow++; break;
    case 'ArrowDown': targetRow--; break;
    case 'ArrowLeft': targetCol++; break;
    case 'ArrowRight': targetCol--; break;
    default: return;
  }

  if (targetRow >= 0 && targetRow < gridSize && targetCol >= 0 && targetCol < gridSize) {
    const targetPiece = pieces.find(
      (p) => p.row === targetRow && p.col === targetCol
    );

    if (targetPiece) {
      [targetPiece.row, emptyPiece.row] = [emptyPiece.row, targetPiece.row];
      [targetPiece.col, emptyPiece.col] = [emptyPiece.col, targetPiece.col];
      moveSound.play();
      drawPuzzle();

      if (checkWin()) {
        message.textContent = 'Congratulations! You solved the puzzle!';
        console.log("Puzzle solved!");
      }
    }
  }
});

// Check if the puzzle is solved
function checkWin() {
  return pieces.every((piece) => piece.row === piece.originalRow && piece.col === piece.originalCol);
}
