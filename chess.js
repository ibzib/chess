// chess.js
// logic for controlling movement of pieces, etc.
// Created by: Kyle Weaver
// Date created: 4/23/2018

function Move(sourceRow, sourceColumn, destRow, destColumn) {
    this.sourceRow = sourceRow;
    this.sourceColumn = sourceColumn;
    this.destRow = destRow;
    this.destColumn = destColumn;
}

const whiteSquareColor = "rgb(237,235,235)"; // IU cream
const blackSquareColor = "rgb(169,5,51)"; // IU crimson
const legalMoveColor = "rgb(254,197,83)"; // gold

// numeric constants to represent piece types
const king = 0;
const queen = 1;
const rook = 2;
const bishop = 3;
const knight = 4;
const pawn = 5;

// the other way: piece type constants index into string array
const pieceName = ["king","queen","rook","bishop","knight","pawn"];
const colorName = ["white","black"];

// the symbols for each piece in algebraic notation
const pieceLetter = ["K","Q","R","B","N",""];

// numeric constants to represent game states
const draw = 2;
const notGameOver = 3;

// this is a pun, and also a movie titled after the pun
const knightMoves = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]];
const rookMoves = [[1,0],[-1,0],[0,1],[0,-1]];
const bishopMoves = [[1,1],[1,-1],[-1,1],[-1,-1]];

// initial state of the board
const startPieces = [[{ "color": 1, "column": 0, "piece": 2, "row": 0 }, { "color": 1, "column": 1, "piece": 4, "row": 0 }, { "color": 1, "column": 2, "piece": 3, "row": 0 }, { "color": 1, "column": 3, "piece": 1, "row": 0 }, { "color": 1, "column": 4, "piece": 0, "row": 0 }, { "color": 1, "column": 5, "piece": 3, "row": 0 }, { "color": 1, "column": 6, "piece": 4, "row": 0 }, { "color": 1, "column": 7, "piece": 2, "row": 0 }], [{ "color": 1, "column": 0, "piece": 5, "row": 1 }, { "color": 1, "column": 1, "piece": 5, "row": 1 }, { "color": 1, "column": 2, "piece": 5, "row": 1 }, { "color": 1, "column": 3, "piece": 5, "row": 1 }, { "color": 1, "column": 4, "piece": 5, "row": 1 }, { "color": 1, "column": 5, "piece": 5, "row": 1 }, { "color": 1, "column": 6, "piece": 5, "row": 1 }, { "color": 1, "column": 7, "piece": 5, "row": 1 }], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [{ "color": 0, "column": 0, "piece": 5, "row": 6 }, { "color": 0, "column": 1, "piece": 5, "row": 6 }, { "color": 0, "column": 2, "piece": 5, "row": 6 }, { "color": 0, "column": 3, "piece": 5, "row": 6 }, { "color": 0, "column": 4, "piece": 5, "row": 6 }, { "color": 0, "column": 5, "piece": 5, "row": 6 }, { "color": 0, "column": 6, "piece": 5, "row": 6 }, { "color": 0, "column": 7, "piece": 5, "row": 6 }], [{ "color": 0, "column": 0, "piece": 2, "row": 7 }, { "color": 0, "column": 1, "piece": 4, "row": 7 }, { "color": 0, "column": 2, "piece": 3, "row": 7 }, { "color": 0, "column": 3, "piece": 1, "row": 7 }, { "color": 0, "column": 4, "piece": 0, "row": 7 }, { "color": 0, "column": 5, "piece": 3, "row": 7 }, { "color": 0, "column": 6, "piece": 4, "row": 7 }, { "color": 0, "column": 7, "piece": 2, "row": 7 }]];

// the squares of our board
var squares = new Array();

// the arrangement of pieces on the board
var pieces = null;

// record of all moves made in this game (includes both past & future)
var moveRecord = [];

// index current move will occupy in moveRecord
var curMoveIndex = 0;

// draw the chessboard
function initBoard() {
    let board = document.getElementById("Board");
    for (var i = 0; i < 8; i++) {
        squares.push(new Array());
        for (var j = 0; j < 8; j++) {
            squares[i].push(document.createElement("div"));
            squares[i][j].className = "Square";
            squares[i][j].id = "square" + i + j;
            squares[i][j].style.top = 64 * i + "px";
            squares[i][j].style.left = 64 * j + "px";
            squares[i][j].style.backgroundColor = (i % 2 == j % 2) ? whiteSquareColor : blackSquareColor;
            squares[i][j].ondragover = allowDrop;
            squares[i][j].ondrop = dropPiece;
            board.appendChild(squares[i][j]);
        }
    }
    colorBoard();
}

// colors board. optionally takes moves array and colors legal moves
function colorBoard(moves) {
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
            if (moves && moves[i][j]) {
                squares[i][j].style.boxShadow = "inset 0px 0px 0px 5px " + legalMoveColor;
            } else {
                squares[i][j].style.boxShadow = "none";
            }
        }
    }
}

// returns true if (row, column) is a valid board position
function inBounds(row, column) {
    return row >= 0 && row < 8 && column >= 0 && column < 8;
}

// returns a 2d array of booleans indicating if piece can move to each position.
function getMoves(pieces, sourceRow, sourceColumn, disallowCheck) {
    let moves = new Array();
    for (i = 0; i < 8; i++) {
        moves.push(new Array());
        for (j = 0; j < 8; j++) {
            moves[i].push(false);
        }
    }
    let curPieceType = pieces[sourceRow][sourceColumn].piece;
    let color = pieces[sourceRow][sourceColumn].color;
    if (curPieceType == king) {
        for (di = -1; di <= 1; di++) {
            for (dj = -1; dj <= 1; dj++) {
                let row = sourceRow + di;
                let col = sourceColumn + dj;
                if ((di != 0 || dj != 0) && inBounds(row, col)) {
                    if (!pieces[row][col] || pieces[row][col].color != color) {
                        moves[row][col] = true;
                    }
                }
            }
        }
    } else if (curPieceType == knight) {
        for (k = 0; k < knightMoves.length; k++) {
            let row = sourceRow + knightMoves[k][0];
            let col = sourceColumn + knightMoves[k][1];
            if (inBounds(row, col)) {
                if (!pieces[row][col] || pieces[row][col].color != color) {
                    moves[row][col] = true;
                }
            }
        }
    } else if (curPieceType == pawn) {
        let di = color ? 1 : -1;
        if (inBounds(sourceRow + di, sourceColumn)) {
            if (!pieces[sourceRow + di][sourceColumn]) {
                moves[sourceRow + di][sourceColumn] = true;
                // move 2 spaces initially
                if (sourceRow == (color ? 1 : 6) && !pieces[sourceRow + 2*di][sourceColumn]) {
                    moves[sourceRow + 2 * di][sourceColumn] = true;
                }
            }
        }
        // pawn diagonal capture
        if (inBounds(sourceRow+di, sourceColumn-1) && 
            pieces[sourceRow+di][sourceColumn-1] &&
            pieces[sourceRow+di][sourceColumn-1].color != color) {
            moves[sourceRow+di][sourceColumn-1] = true;
        }
        if (inBounds(sourceRow+di, sourceColumn+1) && 
            pieces[sourceRow+di][sourceColumn+1] &&
            pieces[sourceRow+di][sourceColumn+1].color != color) {
            moves[sourceRow+di][sourceColumn+1] = true;
        }
    }
    // ranks & files
    if (curPieceType == rook || curPieceType == queen) {
        for (k = 0; k < rookMoves.length; k++) {
            for (d = 1; d < 8; d++) {
                let row = sourceRow+d*rookMoves[k][0];
                let col = sourceColumn+d*rookMoves[k][1];
                if (!inBounds(row, col)) {
                    break;
                }
                if (pieces[row][col]) {
                    if (pieces[row][col].color != color) {
                        moves[row][col] = true;
                    }
                    break;
                } else {
                    moves[row][col] = true;
                }
            }
        }
    }
    // diagonals
    if (curPieceType == bishop || curPieceType == queen) {
        for (k = 0; k < bishopMoves.length; k++) {
            for (d = 1; d < 8; d++) {
                let row = sourceRow+d*bishopMoves[k][0];
                let col = sourceColumn+d*bishopMoves[k][1];
                if (!inBounds(row, col)) {
                    break;
                }
                if (pieces[row][col]) {
                    if (pieces[row][col].color != color) {
                        moves[row][col] = true;
                    }
                    break;
                } else {
                    moves[row][col] = true;
                }
            }
        }
    }
    if (disallowCheck) {
        //remove moves that would put the piece's king in check
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (moves[i][j]) {
                    let temp = pieces[i][j];
                    pieces[i][j] = pieces[sourceRow][sourceColumn];
                    pieces[sourceRow][sourceColumn] = null;
                    if (inCheck(pieces, color)) {
                        moves[i][j] = false;
                    }
                    pieces[sourceRow][sourceColumn] = pieces[i][j];
                    pieces[i][j] = temp;
                }
            }
        }
    }
    return moves;
}

// returns true iff color's king is in check
function inCheck(pieces, color) {
    // find color's king
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (pieces[i][j] && 
                pieces[i][j].piece == king && 
                pieces[i][j].color == color) {
                var kingRow = i;
                var kingColumn = j;
                break;
            }
        }
    }
    // find if any opposing forces threaten the king
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (pieces[i][j] && pieces[i][j].color != color) {
                let moves = getMoves(pieces, i, j, false);
                if (moves[kingRow][kingColumn]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// returns a copy of pieces
function copyPieces(pieces) {
    let piecesCopy = new Array();
    for (i = 0; i < 8; i++) {
        piecesCopy.push(new Array());
        for (j = 0; j < 8; j++) {
            piecesCopy[i].push(pieces[i][j]);
        }
    }
    return piecesCopy;
}

// returns true iff moving piece from source to dest is legal
function validateMove(sourceRow, sourceColumn, destRow, destColumn) {
    let moves = getMoves(pieces, sourceRow, sourceColumn, true);
    if (!moves[destRow][destColumn]) {
        return false;
    }
    // move piece on copied board and ensure its king is not in check
    let piecesCopy = copyPieces(pieces);
    piecesCopy[destRow][destColumn] = pieces[sourceRow][sourceColumn];
    piecesCopy[sourceRow][sourceColumn] = null;    
    return !inCheck(piecesCopy, pieces[sourceRow][sourceColumn].color);
}

// like charAt but goes backward for negative indices (a la Python)
function getChar(str, i) {
    if (i >= 0) {
        return str.charAt(i);
    }
    return str.charAt(str.length + i);
}

// drop piece onto square. make sure to check if the move is legal
function dropPiece(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let sourceRow = parseInt(data[0]);
    let sourceColumn = parseInt(data[1]);
    let destRow = parseInt(getChar(event.target.id, -2));
    let destColumn = parseInt(getChar(event.target.id, -1));
    if (validateMove(sourceRow, sourceColumn, destRow, destColumn)) {
        requestMove(sourceRow, sourceColumn, destRow, destColumn);
    }
}

// when we drag a piece over a square, the square must allow the piece to drop on it
function allowDrop(event) {
    event.preventDefault();
}

function dragPiece(event) {
    let sourceRow = parseInt(getChar(event.target.id, -2));
    let sourceColumn = parseInt(getChar(event.target.id, -1));
    // when we drag a piece, we have to transfer its original location
    event.dataTransfer.setData("text", "" + sourceRow + sourceColumn);
    // recolor board to show legal moves
    colorBoard(getMoves(pieces, sourceRow, sourceColumn, true));
}

// called when the drag ends by releasing mouse button or hitting escape key
function dragEnd(event) {
    colorBoard();
}

// removes all of elem's children from the DOM
function removeChildren(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}

// take current pieces off of board
function clearBoard() {
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
            removeChildren(squares[i][j]);
        }
    }
}

// place pieces in DOM
function placePieces() {
    clearBoard();
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
            if (!pieces[i][j]) {
                continue;
            }
            let curPiece = document.createElement("img");
            curPiece.className = "Piece";
            let pname = pieceName[pieces[i][j].piece];
            curPiece.id = pname + i + j;
            curPiece.src = "Images/" + colorName[pieces[i][j].color] + "-" + pname + ".png";
            squares[i][j].appendChild(curPiece);
        }
    }
}

// let user move pieces for given color
function enableMove(color) {
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
            if (pieces[i][j]) {
                let curPiece = document.getElementById(pieceName[pieces[i][j].piece] + i + j);
                if (pieces[i][j].color == color) {
                    curPiece.ondragstart = dragPiece;
                    curPiece.ondragend = dragEnd;
                } else {
                    curPiece.draggable = false;
                }
            }
        }
    }
}

// returns 0 or 1 if white or black has won, respectively;
// else returns draw or notGameOver
function checkGameOver(colorToMove, check) {
    let noLegalMoves = true;
    outerloop:
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
            if (pieces[i][j] && pieces[i][j].color == colorToMove) {
                let moves = getMoves(pieces, i, j, true);
                for (y = 0; y < 8; y++) {
                    for (x = 0; x < 8; x++) {
                        if (moves[y][x]) {
                            noLegalMoves = false;
                            break outerloop;
                        }
                    }
                }
            }
        }
    }
    if (noLegalMoves) {
        if (check) {
            // checkmate!
            return 1-colorToMove;
        } else {
            // stalemate
            return draw;
        }
    }
    return notGameOver;
}

// handles game over depending on who won (or draw)
function gameOver(gameState) {
    var message;
    if (gameState == 0) {
        message = "White wins!";
    } else if (gameState == 1) {
        message = "Black wins!";
    } else if (gameState == draw) {
        message = "Draw";
    }
    var p = document.createElement("h4");
    p.innerHTML = message;
    document.getElementById("GameInfo").appendChild(p);
    alert(message);
}

function getRowName(row) {
    return 8-row;
}

function getColumnName(column) {
    return String.fromCharCode('a'.charCodeAt(0) + column);
}

// since the stack might contain null elements, count the number of non-null elements
function countMoves(moveRecord) {
    let m = 0;
    while (m < moveRecord.length && moveRecord[m]) {
        m++;
    }
    return m;
}

// traverses through each move in the record
function showMoveRecord() {
    let moveList = document.getElementById("MoveList");
    removeChildren(moveList);
    let phistory = copyPieces(startPieces);
    pieces = copyPieces(phistory);
    for (m = 0; m < moveRecord.length && moveRecord[m]; m++) {
        let sourceRow = moveRecord[m].sourceRow;
        let sourceColumn = moveRecord[m].sourceColumn;
        let destRow = moveRecord[m].destRow;
        let destColumn = moveRecord[m].destColumn;
        let curPieceType = phistory[sourceRow][sourceColumn].piece;
        let notation = "";
        if (m % 2 == 0) {
            notation += Math.floor(m/2)+1 + ".";
        }
        notation += pieceLetter[curPieceType];
        if (phistory[destRow][destColumn]) {
            if (curPieceType == pawn) {
                notation += getColumnName(sourceColumn);
            }
            notation += "x"; // capture
        }
        notation += getColumnName(destColumn);
        notation += getRowName(destRow);
        // make the move
        phistory[destRow][destColumn] = phistory[sourceRow][sourceColumn];
        phistory[sourceRow][sourceColumn] = null;
        // this move has gone into effect
        if (m < curMoveIndex) {
            pieces = copyPieces(phistory);
        }
        if (inCheck(phistory, 1 - m % 2)) {
            notation += "+";
        }
        // display notation in window
        let elem = document.createElement("a");
        elem.innerHTML = notation;
        elem.href = "javascript:jumpToMove(" + (m+1) + ")";
        if (m == curMoveIndex - 1) {
            elem.style.backgroundColor = legalMoveColor;
        }
        moveList.appendChild(elem);
        moveList.innerHTML += "&nbsp;";
    }
}

function undoMove() {
    if (curMoveIndex > 0)
    {
        curMoveIndex--;
        loadGameState();
    }
}

function redoMove() {
    if (curMoveIndex < moveRecord.length)
    {
        curMoveIndex++;
        loadGameState();
    }
}

function jumpToMove(moveNumber) {
    if (moveNumber >= 0 && moveNumber <= moveRecord.length) {
        curMoveIndex = moveNumber;
    }
    loadGameState();
}

// enable or disable buttons depending on game state
function setButtons() {
    var undoButton = document.getElementById("UndoButton");
    undoButton.disabled = curMoveIndex == 0;
    var redoButton = document.getElementById("RedoButton");
    redoButton.disabled = curMoveIndex == countMoves(moveRecord);
}

// updates client to reflect result of fetching game state from server
function loadGameState(result) {
    initBoard();
    setButtons();
    showMoveRecord();
    let colorToMove = curMoveIndex % 2;
    placePieces();
    let gameState = checkGameOver(colorToMove, inCheck(pieces, colorToMove));
    clearGameInfo();
    if (gameState != notGameOver) {
        gameOver(gameState);
        enableMove(2); // disable moves by either side
    } else {
        updateGameInfo();
        enableMove(colorToMove);
    }
}

function clearGameInfo() {
    removeChildren(document.getElementById("GameInfo"));
}

function updateGameInfo() {
    let status = "<strong>" + colorName[curMoveIndex%2] + "</strong>: Drag pieces to move";
    var p = document.createElement("p");
    p.innerHTML = status;
    document.getElementById("GameInfo").appendChild(p);
}

// request pieces after making move
function requestMove(sourceRow, sourceColumn, destRow, destColumn) {
    // when making a new move, we must destroy "future" moves
    while (moveRecord.length > curMoveIndex) {
        moveRecord.pop();
    }
    moveRecord.push(new Move(sourceRow, sourceColumn, destRow, destColumn));
    curMoveIndex++;
    loadGameState();
}

window.onload = function () {
    loadGameState();
};