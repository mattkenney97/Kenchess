var stockfish = require("stockfish");
class chessBoard {
    constructor() {
        this.boardButtons = document.querySelectorAll("button[class='boardSquare']");
        this.blackPieces = {
            'king':'\u265A',
            'queen': '\u265B',
            'rook': '\u265C',
            'bishop': '\u265D',
            'knight': '\u265E',
            'pawn': '\u265F',
        };

        this.whitePieces = {
            'king':'\u2654',
            'queen': '\u2655',
            'rook': '\u2656',
            'bishop': '\u2657',
            'knight': '\u2658',
            'pawn': '\u2659',
        };
        this.cols = ['a','b','c','d','e','f','g','h'];
        this.colsMap = {
            'a': 0,
            'b': 1,
            'c': 2,
            'd': 3,
            'e': 4,
            'f': 5,
            'g': 6,
            'h': 7,
        };
        this.enPassant = false;
        this.lastMove = null;
        this.whiteCastleShort = true;
        this.whiteCastleLong = true;
        this.blackCastleShort = true;
        this.blackCastleLong = true;

        this.whitePosition = {
            'a1': 'rook',
            'b1': 'knight',
            'c1': 'bishop',
            'd1': 'queen',
            'e1': 'king',
            'f1': 'bishop',
            'g1': 'knight',
            'h1': 'rook',
            'a2': 'pawn',
            'b2': 'pawn',
            'c2': 'pawn',
            'd2': 'pawn',
            'e2': 'pawn',
            'f2': 'pawn',
            'g2': 'pawn',
            'h2': 'pawn',
        };

        this.blackPosition = {
            'a8': 'rook',
            'b8': 'knight',
            'c8': 'bishop',
            'd8': 'queen',
            'e8': 'king',
            'f8': 'bishop',
            'g8': 'knight',
            'h8': 'rook',
            'a7': 'pawn',
            'b7': 'pawn',
            'c7': 'pawn',
            'd7': 'pawn',
            'e7': 'pawn',
            'f7': 'pawn',
            'g7': 'pawn',
            'h7': 'pawn',
        };

        this.oldWhitePosition = {};
        this.oldBlackPosition = {};

        this.castleMap = {
            'c1': ['a1','d1'],
            'g1': ['h1','f1'],
            'c8': ['a8','d8'],
            'g8': ['h8','f8'],
        };

        this.createBoardButtons()
    }

    createBoardButtons() {
        const board = this;
        for( let button of this.boardButtons ) {
            button.addEventListener('click', function() {
                let checkFound = false;
                for( let check of board.boardButtons ) {
                    if (check.classList.contains('boardHighlight') ) {
                        checkFound = true
                        let castleGood = false;
                        let backRankPiece = null;
                        let enPassantName = null;
                        if (check.innerHTML != null) {
                            let validMove = true;
                            if (check.innerHTML === board.whitePieces['pawn']) {
                                let pawnInfo = board.validWhitePawnMove(check, button)
                                validMove = pawnInfo[0]
                                enPassantName = pawnInfo[1]
                                backRankPiece = pawnInfo[2]
                            }
                            else if (check.innerHTML === board.blackPieces['pawn']) {
                                let pawnInfo = board.validBlackPawnMove(check, button)
                                validMove = pawnInfo[0]
                                enPassantName = pawnInfo[1]
                                backRankPiece = pawnInfo[2]
                            }
                            else if (check.innerHTML === board.whitePieces['rook'] || check.innerHTML === board.blackPieces['rook']) {
                                validMove = board.validRookMove(check, button)
                                board.enPassant = false
                            }
                            else if (check.innerHTML === board.whitePieces['bishop'] || check.innerHTML === board.blackPieces['bishop']) {
                                validMove = board.validBishopMove(check, button)
                                board.enPassant = false
                            }
                            else if (check.innerHTML === board.whitePieces['knight'] || check.innerHTML === board.blackPieces['knight']) {
                                validMove = board.validKnightMove(check, button)
                                board.enPassant = false
                            }
                            else if (check.innerHTML === board.whitePieces['king'] || check.innerHTML === board.blackPieces['king']) {
                                let validAndCastle = board.validKingMove(check, button)
                                validMove = validAndCastle[0]
                                castleGood = validAndCastle[1]
                                board.enPassant = false
                            }
                            else if (check.innerHTML === board.whitePieces['queen'] || check.innerHTML === board.blackPieces['queen']) {
                                validMove = board.validQueenMove(check, button)
                                board.enPassant = false
                            }
                            if(validMove) {
                                //Update white and black positions
                                if(board.updatePositions(check,button,castleGood,enPassantName,backRankPiece)) {
                                    board.updateBoardHtml()
                                }
                            }
                        }
                        check.classList.toggle("boardHighlight");
                    }
                }
                if (checkFound === false && button.innerHTML != "") {
                    button.classList.toggle("boardHighlight");
                }
            })

        }
        return
    }

    updateBoardHtml() {
        for(let space of this.boardButtons) {
            if(space.name in this.whitePosition) {
                space.innerHTML = this.whitePieces[this.whitePosition[space.name]]
            }
            else if(space.name in this.blackPosition) {
                space.innerHTML = this.blackPieces[this.blackPosition[space.name]]
            }
            else {
                space.innerHTML = ""
            }
        }
    }

    updatePositions(start,end,castleGood,enPassantName,backRankPiece) {
        this.oldWhitePosition = Object.assign({},this.whitePosition)
        this.oldBlackPosition = Object.assign({},this.blackPosition)
        if(Object.values(this.whitePieces).includes(start.innerHTML)) {
            let pieceToMove = this.whitePosition[start.name];
            delete this.whitePosition[start.name]
            this.whitePosition[end.name] = pieceToMove

            if(Object.keys(this.blackPosition).includes(end.name)) {
                delete this.blackPosition[end.name]
            }

            if(castleGood) {
                let rookStart = this.castleMap[end.name][0];
                let rookEnd = this.castleMap[end.name][1];
                delete this.whitePosition[rookStart]
                this.whitePosition[rookEnd] = 'rook'
            }

            if(enPassantName != null) {
                delete this.blackPosition[enPassantName]
            }

            if(backRankPiece != null) {
                this.whitePosition[end.name] = backRankPiece
            }

            if(this.checkForChecks(true)) {
                this.whitePosition = Object.assign({},this.oldWhitePosition)
                this.blackPosition = Object.assign({},this.oldBlackPosition)
                return false
            }

            if(this.checkForChecks(false)) {
                //Check if black is in checkmate
                if(this.checkAllMoves('black')) {
                    console.log('Checkmate!')
                    alert('Checkmate!')
                }
            }
        }
        else {
            let pieceToMove = this.blackPosition[start.name];
            delete this.blackPosition[start.name]
            this.blackPosition[end.name] = pieceToMove

            if(Object.keys(this.whitePosition).includes(end.name)) {
                delete this.whitePosition[end.name]
            }

            if(castleGood) {
                let rookStart = this.castleMap[end.name][0];
                let rookEnd = this.castleMap[end.name][1];
                delete this.blackPosition[rookStart]
                this.blackPosition[rookEnd] = 'rook'
            }

            if(enPassantName != null) {
                delete this.whitePosition[enPassantName]
            }

            if(backRankPiece != null) {
                this.blackPosition[end.name] = backRankPiece
            }

            if(this.checkForChecks(false)) {
                this.whitePosition = Object.assign({},this.oldWhitePosition)
                this.blackPosition = Object.assign({},this.oldBlackPosition)
                return false
            }

            if(this.checkForChecks(true)) {
                //Check if white is in checkmate
                if(this.checkAllMoves('white')) {
                    console.log('Checkmate!')
                }
            }
        }
        return true
    }

    validWhitePawnMove(start, end) {
        console.log('Trying pawn move')
        if(!this.checkStartAndEnd(start,end)) {
            console.log('Invalid pawn move')
            return [false, null]
        }
        
        let ind = this.getColumnIndex(start);
        let front2 = null;
    
        if( start.name[1] === '2' ) {
            front2 = this.cols[ind] + (parseInt(start.name[1]) + 2)
        }
        if (end.name != front2) {
            front2 = null
        }
    
        let front = this.cols[ind] + (parseInt(start.name[1])+1);
        
        let frontButton = document.querySelector(`button[name="${front}"]`);
        if(frontButton.innerHTML != "") {
            front2 = null
            front = null
        }

        if (end.name != front) {
            front = null
        }

        let pawnTakePlaces = this.pawnTakes(start,end,ind,true);
        let leftFront = pawnTakePlaces[0];
        let rightFront = pawnTakePlaces[1];
        let enPassantName = pawnTakePlaces[2];

        if (!front && !leftFront && !rightFront && !front2) {
            console.log('Invalid pawn move')
    
            return [false, null]
        }

        if(front2 != null) {
            this.enPassant = true
            this.lastMove = end
        }
        else {
            this.enPassant = false
        }
    
        let backRankPiece = null;
        if(end.name[1] === '8') {
            backRankPiece = this.pawnBackRank(start, true)
        }
        return [true, enPassantName, backRankPiece]
    }

    validBlackPawnMove(start, end) {
        console.log('Trying pawn move')
        if(!this.checkStartAndEnd(start,end)) {
            console.log('Invalid pawn move')
            return [false, null]
        }
        
        let ind = this.getColumnIndex(start);
        let front2 = null;
    
        if( start.name[1] === '7' ) {
            front2 = this.cols[ind] + (parseInt(start.name[1]) - 2)
        }
        if (end.name != front2) {
            front2 = null
        }
    
        let front = this.cols[ind] + (parseInt(start.name[1]) -1);
        let frontButton = document.querySelector(`button[name="${front}"]`);

        if(frontButton.innerHTML != "") {
            front2 = null
            front = null
        }

        if (end.name != front) {
            front = null
        }

        let pawnTakePlaces = this.pawnTakes(start,end,ind,false);
        let leftFront = pawnTakePlaces[0];
        let rightFront = pawnTakePlaces[1];
        let enPassantName = pawnTakePlaces[2];
    
        if (!front && !leftFront && !rightFront && !front2) {
            console.log('Invalid pawn move')
            return [false,null]
        }

        if(front2 != null) {
            this.enPassant = true
            this.lastMove = end
        }
        else {
            this.enPassant = false
        }

        let backRankPiece = null;
        if(end.name[1] === '1') {
            backRankPiece = this.pawnBackRank(start)
        }
    
        return [true, enPassantName, backRankPiece]
    }

    pawnTakes(start,end,ind,whitePawn = false) {
        let leftFront = null;
        let rightFront = null;
        let pieces = null;
        let leftCol = null;
        let rightCol = null;
        let rowChange = 0;
        let leftChange = 0;
        let rightChange = 0;
        if(whitePawn) {
            pieces = this.blackPieces
            leftCol = 'a'
            rightCol = 'h'
            rowChange = 1
            leftChange = -1
            rightChange = 1
        }
        else {
            pieces = this.whitePieces
            leftCol = 'h'
            rightCol = 'a'
            rowChange = -1
            leftChange = 1
            rightChange = -1
        }
        if (start.name[0] != leftCol) {
            if (Object.values(pieces).includes(end.innerHTML)) {
                leftFront = this.cols[ind + leftChange] + (parseInt(start.name[1]) + rowChange)
            }
            if(this.enPassant && parseInt(this.lastMove.name[1]) === (parseInt(end.name[1]) + leftChange) && this.cols[ind + leftChange] === this.lastMove.name[0]) {
                console.log('En passant!')
                leftFront = this.cols[ind + leftChange] + (parseInt(start.name[1]) + rowChange)
                if (end.name == leftFront) {
                    let enPassantName = this.updateEnPassantPositions()
                    this.enPassant = false
                    return [leftFront, null, enPassantName]
                }
                leftFront = null
                
            }
            if (end.name != leftFront) {
                leftFront = null
            }
        }
        if (start.name[0] != rightCol) {
            if (Object.values(pieces).includes(end.innerHTML)) {
                rightFront = this.cols[ind + rightChange] + (parseInt(start.name[1]) + rowChange)
            }
            if(this.enPassant && parseInt(this.lastMove.name[1]) === (parseInt(end.name[1]) + leftChange) && this.cols[ind + rightChange] === this.lastMove.name[0]) {
                console.log('En passant!')
                rightFront = this.cols[ind + rightChange] + (parseInt(start.name[1]) + rowChange)
                if (end.name == rightFront) {
                    let enPassantName = this.updateEnPassantPositions()
                    this.enPassant = false
                    return [null, rightFront, enPassantName]
                }
                rightFront = null
            }
            if (end.name != rightFront) {
                rightFront = null
            }
        }
        return [leftFront, rightFront, null]
    }

    updateEnPassantPositions() {
        if(Object.values(this.whitePieces).includes(this.lastMove.innerHTML)) {
            return this.lastMove.name
        }
        else {
            return this.lastMove.name
        }
    }

    pawnBackRank(start, whitePawn = false) {
        let pieces = this.blackPieces;

        if(whitePawn) {
            pieces = this.whitePieces
        }

        let noValidInput = true
        while(noValidInput) {
            let newPiece = prompt("Choose: Queen, Rook, Bishop, Knight");
            if (newPiece.toLowerCase() === 'queen') {
                return 'queen'
            }
            else if (newPiece.toLowerCase() === 'rook') {
                return 'rook'
            }
            else if (newPiece.toLowerCase() === 'bishop') {
                return 'bishop'
            }
            else if (newPiece.toLowerCase() === 'knight') {
                return 'knight'
            }
            else {
                'Please write one of 4 options: Queen, Rook, Bishop, Knight'
            }
        }
    }

    validRookMove(start, end) {
        console.log('Trying rook move')
        if(!this.checkStartAndEnd(start,end)) {
            return false
        }

        if(!this.validLinearMove(start,end)) {
            console.log('Invalid rook move')
            return false
        }

        //Invalidate castling if rook moves
        if(start.name === 'a1') {
            this.whiteCastleLong = false
        }
        else if(start.name === 'h1') {
            this.whiteCastleShort = false
        }
        else if(start.name === 'a8') {
            this.blackCastleLong = false
        }
        else if(start.name === 'h8') {
            this.blackCastleShort = false
        }
        return true
    }

    validBishopMove(start, end) {
        console.log('Trying bishop move')
        if(!this.checkStartAndEnd(start,end)) {
            console.log('Invalid bishop move')
            return false
        }

        if(!this.validDiagonalMove(start,end)) {
            console.log('Invalid bishop move')
            return false
        }
        return true
    }

    validKnightMove(start, end) {
        console.log('Trying knight move')
        if(!this.checkStartAndEnd(start,end)) {
            return false
        }

        let startColInd = this.getColumnIndex(start);
        let endColInd = this.getColumnIndex(end);
        let startRowInd = start.name[1] - 1;
        let endRowInd = end.name[1] - 1;

        //Col move 1
        if(Math.abs(startColInd-endColInd) === 1) {
            if(Math.abs(startRowInd-endRowInd) != 2) {
                console.log('Invalid knight move')
                return false
            }
            return true
        }
        //Col move 2
        else if (Math.abs(startColInd-endColInd) === 2) {
            if(Math.abs(startRowInd-endRowInd) != 1) {
                console.log('Invalid knight move')
                return false
            }
            return true
        }
        else {
            console.log('Invalid knight move')
            return false
        }
    }

    validKingMove(start, end) {
        console.log('Trying king move')
        if(!this.checkStartAndEnd(start,end)) {
            return [false,false]
        }

        let startColInd = this.getColumnIndex(start);
        let endColInd = this.getColumnIndex(end);
        let startRowInd = start.name[1] - 1;
        let endRowInd = end.name[1] - 1;

        //Check castling
        if(Math.abs(startColInd-endColInd) === 2 && startRowInd - endRowInd === 0) {
            let castleGood = false
            if(start.innerHTML === this.whitePieces['king']) {
                if(!this.checkForChecks(true)) {
                    if(end.name === 'c1' && this.whiteCastleLong ) {
                        let spacesToCheck = ['b1','c1','d1'];
                        castleGood = this.checkCastlingEmptySpaces(spacesToCheck,'white')
                    }
                    else if(end.name == 'g1' && this.whiteCastleShort) {
                        let spacesToCheck = ['f1','g1'];
                        castleGood = this.checkCastlingEmptySpaces(spacesToCheck,'white')
                    }
                }
            }
            else {
                if(!this.checkForChecks(false)) {
                    if(end.name === 'c8' && this.blackCastleLong) {
                        let spacesToCheck = ['b8','c8','d8'];
                        castleGood = this.checkCastlingEmptySpaces(spacesToCheck,'black')
                    }
                    else if(end.name == 'g8' && this.blackCastleShort) {
                        let spacesToCheck = ['f8','g8'];
                        castleGood = this.checkCastlingEmptySpaces(spacesToCheck,'black')
                    }
                }
            }
            if(castleGood) {
                return [true,true]
            }
        }

        if(Math.abs(startRowInd-endRowInd) > 1) {
            console.log('Invalid king move')
            return [false,false]
        }
        else if(Math.abs(startColInd-endColInd) > 1) {
            console.log('Invalid king move')
            return [false,false]
        }
        else {
            if(start.innerHTML === this.whitePieces['king']) {
                this.whiteCastleShort = false
                this.whiteCastleLong = false
            }
            else {
                this.blackCastleShort = false
                this.blackCastleLong = false
            }
            return [true,false]
        }
    }

    checkCastlingEmptySpaces(spacesToCheck, color) {
        for( let currentSpace of spacesToCheck ){
            let boardSpace = document.querySelector(`button[name="${currentSpace}"]`);
            if(boardSpace.innerHTML != "") {
                return false
            }

            this.oldWhitePosition = Object.assign({},this.whitePosition)
            this.oldBlackPosition = Object.assign({},this.blackPosition)

            if(color === 'white') {
                this.whitePosition[currentSpace] = 'king'
                if(this.checkForChecks(true)) {
                    this.whitePosition = Object.assign({},this.oldWhitePosition)
                    return false
                }
            }
            else {
                this.blackPosition[currentSpace] = 'king'
                if(this.checkForChecks(false)) {
                    this.blackPosition = Object.assign({},this.oldBlackPosition)
                    return false
                }
            }

            this.whitePosition = Object.assign({},this.oldWhitePosition)
            this.blackPosition = Object.assign({},this.oldBlackPosition)
        }
        return true
    }

    validQueenMove(start, end) {
        console.log('Trying queen move')
        if(!this.checkStartAndEnd(start,end)) {
            console.log('Invalid queen move')
            return false
        }

        if(!this.validDiagonalMove(start,end) && !this.validLinearMove(start,end)) {
            console.log('Invalid queen move')
            return false
        }

        return true
    }

    checkEmpty(boardSpace) {
        if(Object.values(this.blackPieces).includes(boardSpace.innerHTML)) {
            console.log('Invalid move: piece in the way')
            return false
        }
        else if(Object.values(this.whitePieces).includes(boardSpace.innerHTML)) {
            console.log('Invalid move: piece in the way')
            return false
        }
        return true
    }

    checkStartAndEnd(start, end) {
        let piecesToCheck = null;
        if(Object.values(this.whitePieces).includes(start.innerHTML)) {
            piecesToCheck = this.whitePieces
        }
        else {
            piecesToCheck = this.blackPieces
        }

        if(start.name === end.name) {
            console.log('Invalid move: start = end')
            return false
        } 
        else if(Object.values(piecesToCheck).includes(end.innerHTML)) {
            console.log('Invalid move: same color end')
            return false
        }
        return true
    }

    getColumnIndex(boardSpace) {
        let index = 0;
        for(let letter of this.cols ) {
            if ( letter === boardSpace.name[0] ) {
                break;
            }
            index += 1
        }
        return index
    }

    validDiagonalMove(start,end) {
        let startColInd = this.getColumnIndex(start);
        let endColInd = this.getColumnIndex(end);
        let startRowInd = start.name[1] - 1;
        let endRowInd = end.name[1] - 1;

        let colDiff = Math.abs(startColInd - endColInd);
        let rowDiff = Math.abs(startRowInd - endRowInd);

        if(colDiff != rowDiff) {
            console.log('Invalid bishop move: Not diagonal')
            return false
        }

        for(let i = 1; i < colDiff; i++) {
            let currentSpace = null;
            // Going right
            if(startColInd < endColInd) {
                // Going up
                if(startRowInd < endRowInd) {
                    currentSpace = this.cols[startColInd + i] + (parseInt(start.name[1]) + i)
                }
                // Going  down
                else {
                    currentSpace = this.cols[startColInd + i] + (parseInt(start.name[1]) - i)
                }
            }
            // Going left
            else {
                // Going up
                if(startRowInd < endRowInd) {
                    currentSpace = this.cols[startColInd - i] + (parseInt(start.name[1]) + i)
                }
                // Going  down
                else {
                    currentSpace = this.cols[startColInd - i] + (parseInt(start.name[1]) - i)
                }
            }
            
            let checkSpace = document.querySelector(`button[name="${currentSpace}"]`);
            if( !this.checkEmpty(checkSpace)) {
                return false
            }
        }
        return true
    }

    validLinearMove(start, end) {
        let startColInd = this.getColumnIndex(start);
        let endColInd = this.getColumnIndex(end);

        if (start.name[0] === end.name[0]) {
            let startRow = start.name[1]-1;
            let endRow = end.name[1]-1;
            if(startRow > endRow) {
                for( let checkInd = endRow + 1; checkInd < startRow; checkInd++) {
                    let currentSpace = start.name[0] + (checkInd+1);
                    let checkSpace = document.querySelector(`button[name="${currentSpace}"]`)
                    if( !this.checkEmpty(checkSpace)) {
                        return false
                    }
                }
                return true
            }
            else if(startRow  < endRow) {
                for( let checkInd = startRow+1; checkInd < endRow; checkInd++) {
                    let currentSpace = start.name[0] + (checkInd+1);
                    let checkSpace = document.querySelector(`button[name="${currentSpace}"]`)
                    if( !this.checkEmpty(checkSpace)) {
                        return false
                    }
                }
                return true
            }
        }
        else if(start.name[1] === end.name[1]) {
            if(startColInd < endColInd) {
                for( let checkInd = startColInd+1; checkInd < endColInd; checkInd++) {
                    let currentSpace = this.cols[checkInd] + start.name[1];
                    let checkSpace = document.querySelector(`button[name="${currentSpace}"]`)
                    console.log(currentSpace)
                    if( !this.checkEmpty(checkSpace)) {
                        return false
                    }
                }
                return true
            }
            else if(startColInd > endColInd) {
                for( let checkInd = endColInd+1; checkInd < startColInd; checkInd++) {
                    let currentSpace = this.cols[checkInd] + start.name[1];
                    let checkSpace = document.querySelector(`button[name="${currentSpace}"]`)
                    console.log(currentSpace)
                    if( !this.checkEmpty(checkSpace)) {
                        return false
                    }
                }
                return true

            }
        }
        else {
            return false
        }
    }

    checkAllMoves(color) {
        let movePosition = null;
        let oppPosition = null;
        let x = null;
        if(color === 'white') {
            movePosition = this.whitePosition;
            oppPosition = this.blackPosition;
        }
        else {
            movePosition = this.blackPosition;
            oppPosition = this.whitePosition;
        }

        for(let piece in movePosition) {
            let startColInd = this.colsMap[piece[0]];
            
            if(movePosition[piece] === 'pawn') {
                //If pawn available check all moves
                if(this.checkAllPawnMoves(piece,color,startColInd)) {
                    return false
                }
            }
            else if(movePosition[piece] === 'rook') {
                //If rook available check all moves
                if(this.checkAllRookMoves(piece,color,startColInd)) {
                    return false
                }
            }
            else if(movePosition[piece] === 'bishop') {
                //If bishop available check all moves
                if(this.checkAllBishopMoves(piece,color,startColInd)) {
                    return false
                }
            }
            else if(movePosition[piece] === 'knight') {
                //If knight available check all moves
                if(this.checkAllKnightMoves(piece,color,startColInd)) {
                    return false
                }
            }
            else if(movePosition[piece] === 'queen') {
                //If queen available check all moves
                if(this.checkAllQueenMoves(piece,color,startColInd)) {
                    return false
                }
            }
            else if(movePosition[piece] === 'king') {
                //If king available check all moves
                if(this.checkAllKingMoves(piece,color,startColInd)) {
                    return false
                }
            }

        }
        return true
    }

    reversePositionChange(moveColor,oldOppPosition,oldMovePosition) {
        if(moveColor === 'white') {
            this.blackPosition = oldOppPosition
            this.whitePosition = oldMovePosition
        }
        else {
            this.blackPosition = oldMovePosition
            this.whitePosition = oldOppPosition
        }
    }

    checkAllPawnMoves(piece,moveColor,startColInd) {
        let mateCheck = false;
        let newMovePosition = null;
        let newOppPosition = null;
        let oldMovePosition = null;
        let oldOppPosition = null;
        let rowToCheck = parseInt(piece[1]);
        let rowToCheck1 = null;
        let rowToCheck2 = null;

        if(moveColor === 'white') {
            newMovePosition = this.whitePosition
            newOppPosition = this.blackPosition
            oldMovePosition = {...this.whitePosition,}
            oldOppPosition = {...this.blackPosition,}
            rowToCheck1 = rowToCheck + 1
            if(parseInt(piece[1]) === 2) {
                rowToCheck2 = rowToCheck + 2
            }
        }
        else {
            newMovePosition = this.blackPosition
            newOppPosition = this.whitePosition
            oldMovePosition = {...this.blackPosition,}
            oldOppPosition = {...this.whitePosition,}
            rowToCheck1 = rowToCheck - 1
            if(parseInt(piece[1]) === 7) {
                rowToCheck2 = rowToCheck - 2
            }
        }

        delete newMovePosition[piece]
        let moveForward = piece[0] + rowToCheck1;
        if(!newOppPosition[moveForward]  && !newMovePosition[moveForward]) {
            newMovePosition[moveForward] = 'pawn'
            mateCheck = this.checkMateChecker(moveColor)
            delete newMovePosition[moveForward]
            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
        }

        if( rowToCheck2 != null) {
            let moveForward2 = piece[0] + rowToCheck2;
            if(!newOppPosition[moveForward2] && !newMovePosition[moveForward2] &&
                !newOppPosition[moveForward] && !newMovePosition[moveForward]) {
                newMovePosition[moveForward2] = 'pawn'
                mateCheck = this.checkMateChecker(moveColor)
                delete newMovePosition[moveForward2]
                if(mateCheck) {
                    this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                    return true
                }
            }
        }

        if(startColInd > 0) {
            let pawnTakes = this.cols[startColInd - 1] + rowToCheck1;
            if(newOppPosition[pawnTakes] != null) {
                newMovePosition[pawnTakes] = 'pawn'
                let tempPiece = newOppPosition[pawnTakes]
                delete newOppPosition[pawnTakes]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[pawnTakes] = tempPiece
                delete newMovePosition[pawnTakes]
                if(mateCheck) {
                    this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                    return true
                }
            }
        }
        if(startColInd < 7) {
            let pawnTakes = this.cols[startColInd + 1] + rowToCheck1;
            if(newOppPosition[pawnTakes] != null) {
                newMovePosition[pawnTakes] = 'pawn'
                let tempPiece = newOppPosition[pawnTakes]
                delete newOppPosition[pawnTakes]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[pawnTakes] = tempPiece
                delete newMovePosition[pawnTakes]
                if(mateCheck) {
                    this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                    return true
                }
            }
        }

        this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
        return false
    }

    checkAllBishopMoves(piece,moveColor,startColInd,pieceName='bishop') {
        let mateCheck = false;
        let newMovePosition = null;
        let newOppPosition = null;
        let oldMovePosition = null;
        let oldOppPosition = null;

        if(moveColor === 'white') {
            newMovePosition = this.whitePosition
            newOppPosition = this.blackPosition
            oldMovePosition = {...this.whitePosition,}
            oldOppPosition = {...this.blackPosition,}
        }
        else {
            newMovePosition = this.blackPosition
            newOppPosition = this.whitePosition
            oldMovePosition = {...this.blackPosition,}
            oldOppPosition = {...this.whitePosition,}
        }

        delete newMovePosition[piece]
        //Go up left
        let colHolder = startColInd - 1
        let rowHolder = parseInt(piece[1]) + 1
        while( colHolder >= 0 && rowHolder <= 8) {
            let currentSpace = this.cols[colHolder] + rowHolder;
            if(newMovePosition[currentSpace] != null) {
                break
            }

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            --colHolder
            ++rowHolder
        }

        //Go up right
        colHolder = startColInd + 1
        rowHolder = parseInt(piece[1]) + 1
        while( colHolder < 8 && rowHolder <= 8) {
            let currentSpace = this.cols[colHolder] + rowHolder;
            if(newMovePosition[currentSpace] != null) {
                break
            }

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            ++colHolder
            ++rowHolder
        }

        //Go down left 
        colHolder = startColInd - 1
        rowHolder = parseInt(piece[1]) - 1
        while( colHolder >= 0 && rowHolder >= 0) {
            let currentSpace = this.cols[colHolder] + rowHolder;
            if(newMovePosition[currentSpace] != null) {
                break
            }

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            --colHolder
            --rowHolder
        }

        //Go down right
        colHolder = startColInd + 1
        rowHolder = parseInt(piece[1]) - 1
        while( colHolder < 8 && rowHolder >= 0) {
            let currentSpace = this.cols[colHolder] + rowHolder;
            if(newMovePosition[currentSpace] != null) {
                break
            }

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            ++colHolder
            --rowHolder
        } 

        this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
        return false
    }

    checkAllKnightMoves(piece,moveColor,startColInd) {
        let mateCheck = false;
        let newMovePosition = null;
        let newOppPosition = null;
        let oldMovePosition = null;
        let oldOppPosition = null;

        if(moveColor === 'white') {
            newMovePosition = this.whitePosition
            newOppPosition = this.blackPosition
            oldMovePosition = {...this.whitePosition,}
            oldOppPosition = {...this.blackPosition,}
        }
        else {
            newMovePosition = this.blackPosition
            newOppPosition = this.whitePosition
            oldMovePosition = {...this.blackPosition,}
            oldOppPosition = {...this.whitePosition,}
        }

        delete newMovePosition[piece]

        let arr1 = [-1,1];
        let arr2 = [-2,2];
        for(let one of arr1) {
            for(let two of arr2) {
                if(this.checkKnightsReverseMate(startColInd + one, parseInt(piece[1]) + two, newMovePosition,newOppPosition,moveColor)) {
                    this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                    return true
                }
                else if(this.checkKnightsReverseMate(startColInd + two, parseInt(piece[1]) + one, newMovePosition,newOppPosition,moveColor)) {
                    this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                    return true
                }
            }
        }

        this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
        return false
    }

    checkKnightsReverseMate(checkCol, checkRow, newMovePosition,newOppPosition,moveColor) {
        let mateCheck = false
        if(checkCol >= 0 && checkCol < 8 && checkRow > 0 && checkRow <= 8) {
            let currentSpace = this.cols[checkCol] + checkRow;
            if(newMovePosition[currentSpace] != null) {
                return false
            }
            newMovePosition[currentSpace] = 'knight'

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                return true
            }
        }
        return false
    }

    checkAllQueenMoves(piece,moveColor,startColInd) {
        

        let pieceName = 'queen'
        if(this.checkAllRookMoves(piece,moveColor,startColInd,pieceName)) {
            return true
        }
        if(this.checkAllBishopMoves(piece,moveColor,startColInd,pieceName)) {
            return true
        }
        return false
    }

    checkAllKingMoves(piece,moveColor,startColInd) {
        let mateCheck = false;
        let newMovePosition = null;
        let newOppPosition = null;
        let oldMovePosition = null;
        let oldOppPosition = null;

        if(moveColor === 'white') {
            newMovePosition = this.whitePosition
            newOppPosition = this.blackPosition
            oldMovePosition = {...this.whitePosition,}
            oldOppPosition = {...this.blackPosition,}
        }
        else {
            newMovePosition = this.blackPosition
            newOppPosition = this.whitePosition
            oldMovePosition = {...this.blackPosition,}
            oldOppPosition = {...this.whitePosition,}
        }

        delete newMovePosition[piece]
        let arrAround = [-1,0,1];

        for(let col of arrAround) {
            for(let row of arrAround) {
                if(col === 0 && row === 0) {
                    continue
                }
                let checkCol = startColInd+col;
                let checkRow = parseInt(piece[1]) + row;
                if(checkCol >= 0 && checkCol < 8 && checkRow > 0 && checkRow <= 8) {
                    let currentSpace = this.cols[checkCol] + checkRow;
                    if(newMovePosition[currentSpace] != null) {
                        continue
                    }
                    console.log(currentSpace)
        
                    newMovePosition[currentSpace] = 'king'
        
                    if(newOppPosition[currentSpace] != null) {
                        let tempPiece = newOppPosition[currentSpace]
                        delete newOppPosition[currentSpace]
                        mateCheck = this.checkMateChecker(moveColor)
                        newOppPosition[currentSpace] = tempPiece
                        break
                    }
                    else {
                        mateCheck = this.checkMateChecker(moveColor)
                    }
                    delete newMovePosition[currentSpace]
        
                    if(mateCheck) {
                        this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                        return true
                    }
                }
                
            }
        }

        this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
        return false
    }

    checkAllRookMoves(piece,moveColor,startColInd,pieceName='rook') {
        
        let i = startColInd - 1;
        let mateCheck = false;
        let newMovePosition = null;
        let newOppPosition = null;
        let oldMovePosition = null;
        let oldOppPosition = null;

        if(moveColor === 'white') {
            newMovePosition = this.whitePosition
            newOppPosition = this.blackPosition
            oldMovePosition = {...this.whitePosition,}
            oldOppPosition = {...this.blackPosition,}
        }
        else {
            newMovePosition = this.blackPosition
            newOppPosition = this.whitePosition
            oldMovePosition = {...this.blackPosition,}
            oldOppPosition = {...this.whitePosition,}
        }

        delete newMovePosition[piece]
        //Go left
        while(i >= 0) {
            let currentSpace = this.cols[i] + piece[1];
            if(newMovePosition[currentSpace] != null) {
                break
            }
            console.log(currentSpace)

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            i--
        }

        if(moveColor === 'white') {
            this.blackPosition = oldOppPosition
            this.whitePosition = oldMovePosition
        }
        else {
            this.blackPosition = oldMovePosition
            this.whitePosition = oldOppPosition
        }

        //Go right
        i = startColInd + 1;
        while(i < 8) {
            let currentSpace = this.cols[i] + piece[1];
            if(newMovePosition[currentSpace] != null) {
                break
            }
            console.log(currentSpace)

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            i++
        }

        //Go down
        i = piece[1] - 1
        while(i > 0) {
            let currentSpace = piece[0] + i;
            if(newMovePosition[currentSpace] != null) {
                break
            }
            console.log(currentSpace)

            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            i--
        }

        //Go up
        i = piece[1] + 1
        while(i <= 8) {
            let currentSpace = piece[0] + i;
            
            if(newMovePosition[currentSpace] != null) {
                break
            }
            console.log(currentSpace)
            newMovePosition[currentSpace] = pieceName

            if(newOppPosition[currentSpace] != null) {
                let tempPiece = newOppPosition[currentSpace]
                delete newOppPosition[currentSpace]
                mateCheck = this.checkMateChecker(moveColor)
                newOppPosition[currentSpace] = tempPiece
                break
            }
            else {
                mateCheck = this.checkMateChecker(moveColor)
            }
            delete newMovePosition[currentSpace]

            if(mateCheck) {
                this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)
                return true
            }
            i++
        }

        this.reversePositionChange(moveColor,oldOppPosition,oldMovePosition)

        return false
    }

    checkMateChecker(moveColor) {
        if(moveColor === 'white') {
            if(!this.checkForChecks(true)) {
                console.log('No mate!')
                return true
            }
        }
        else {
            if(!this.checkForChecks(false)) {
                console.log('No mate!')
                return true
            }
        }
        return false
    }

    checkForChecks(whiteMove) {
        //If white to move
        if(whiteMove) {
            return this.loopThroughPosition(this.blackPosition, 'white')
        }
        else {
            return this.loopThroughPosition(this.whitePosition, 'black')
        }
    }

    loopThroughPosition(position, moveColor) {
        for(let piece in position) {
            let checkFound = false
            
            if(position[piece] === 'pawn') {
                //If pawn attacking king return true
                checkFound = this.checkPawnChecks(piece,moveColor)
            }
            else if(position[piece] === 'rook') {
                //If rook attacking king return true
                checkFound = this.checkRookChecks(piece,moveColor)
            }
            else if(position[piece] === 'bishop') {
                //If bishop attacking king return true
                checkFound = this.checkBishopChecks(piece,moveColor)
            }
            else if(position[piece] === 'knight') {
                //If knight attacking king return true
                checkFound = this.checkKnightChecks(piece,moveColor)
            }
            else if(position[piece] === 'queen') {
                //If queen attacking king return true
                checkFound = this.checkQueenChecks(piece,moveColor)
            }
            else if(position[piece] === 'king') {
                //If king attacking king return true
                checkFound = this.checkKingChecks(piece,moveColor)
            }

            if(checkFound) {
                return true
            }

        }
        return false
    }

    checkPawnChecks(piece,moveColor) {
        let startColInd = this.colsMap[piece[0]];
        let movePosition = null;
        let rowToCheck = parseInt(piece[1]);
        let check1 = null;
        let check2 = null;
        if(moveColor === 'black') {
            movePosition = this.blackPosition
            rowToCheck = rowToCheck + 1
        }
        else {
            movePosition= this.whitePosition
            rowToCheck = rowToCheck - 1
        }

        if(startColInd > 0) {
            check1 = this.cols[startColInd - 1] + rowToCheck
        }
        if(startColInd < 7) {
            check2 = this.cols[startColInd + 1] + rowToCheck
        }

        if(movePosition[check1] === 'king' || movePosition[check2] === 'king' ) {
            console.log('Pawn check found!')
            return true
        }
        return false
    }

    checkRookChecks(piece,moveColor) {
        let startColInd = this.colsMap[piece[0]];
        let movePosition = null;
        if(moveColor === 'black') {
            movePosition = this.blackPosition
        }
        else {
            movePosition= this.whitePosition
        }

        //Go left
        let i = startColInd - 1;
        while(i >= 0) {
            let currentSpace = this.cols[i] + piece[1];
            if(this.whitePosition[currentSpace] != null || this.blackPosition[currentSpace] != null) {
                if(movePosition[currentSpace] === 'king') {
                    console.log('Check found!')
                    return true
                }
                else {
                    break
                }
            }
            i--
        }
        //Go right
        i = startColInd + 1;
        while(i < 8) {
            let currentSpace = this.cols[i] + piece[1];
            if(this.whitePosition[currentSpace] != null || this.blackPosition[currentSpace] != null) {
                if(movePosition[currentSpace] === 'king') {
                    console.log('Check found!')
                    return true
                }
                else {
                    break
                }
            }  
            i++
        }
        //Go up
        i = parseInt(piece[1]) + 1;
        while(i <= 8) {
            let currentSpace = piece[0] + i;
            if(this.whitePosition[currentSpace] != null || this.blackPosition[currentSpace] != null) {
                if(movePosition[currentSpace] === 'king') {
                    console.log('Check found!')
                    return true
                }
                else {
                    break
                }
            } 
            i++
        }
        //Go down
        i = parseInt(piece[1]) - 1;
        while(i > 0) {
            let currentSpace = piece[0] + i;
            if(this.whitePosition[currentSpace] != null || this.blackPosition[currentSpace] != null) {
                if(movePosition[currentSpace] === 'king') {
                    console.log('Check found!')
                    return true
                }
                else {
                    break
                }
            } 
            i--
        }
        return false
    }

    checkBishopChecks(piece,moveColor) {
        let startColInd = this.colsMap[piece[0]];
        let movePosition = null;
        if(moveColor === 'black') {
            movePosition = this.blackPosition
        }
        else {
            movePosition= this.whitePosition
        }

        //Go up left
        let colHolder = startColInd - 1
        let rowHolder = parseInt(piece[1]) + 1
        while( colHolder >= 0 && rowHolder <= 8) {
            let checkSpace = this.checkSpaceForCheck(colHolder,rowHolder,movePosition);
            if(checkSpace['checkFound']) {
                return true
            }
            rowHolder = checkSpace['rowHolder']
            --colHolder
            ++rowHolder
        }
        
        //Go up right
        colHolder = startColInd + 1
        rowHolder = parseInt(piece[1]) + 1
        while( colHolder < 8 && rowHolder <= 8) {
            let checkSpace = this.checkSpaceForCheck(colHolder,rowHolder,movePosition);
            if(checkSpace['checkFound']) {
                return true
            }
            rowHolder = checkSpace['rowHolder']
            ++colHolder
            ++rowHolder
        }

        //Go down left 
        colHolder = startColInd - 1
        rowHolder = parseInt(piece[1]) - 1
        while( colHolder >= 0 && rowHolder >= 0) {
            let checkSpace = this.checkSpaceForCheck(colHolder,rowHolder,movePosition);
            if(checkSpace['checkFound']) {
                return true
            }
            rowHolder = checkSpace['rowHolder']
            --colHolder
            --rowHolder
        }

        //Go down right
        colHolder = startColInd + 1
        rowHolder = parseInt(piece[1]) - 1
        while( colHolder < 8 && rowHolder >= 0) {
            let checkSpace = this.checkSpaceForCheck(colHolder,rowHolder,movePosition);
            if(checkSpace['checkFound']) {
                return true
            }
            rowHolder = checkSpace['rowHolder']
            ++colHolder
            --rowHolder
        } 
        return false
    }

    checkQueenChecks(piece,moveColor) {
        let movePosition = null;

        if(moveColor === 'black') {
            movePosition = this.blackPosition
        }
        else {
            movePosition= this.whitePosition
        }

        if(this.checkBishopChecks(piece,moveColor)) {
            return true
        }
        else if(this.checkRookChecks(piece,moveColor)) {
            return true
        }
        return false
    }

    checkKingChecks(piece,moveColor) {
        let startColInd = this.colsMap[piece[0]];
        let movePosition = null;
        if(moveColor === 'black') {
            movePosition = this.blackPosition
        }
        else {
            movePosition= this.whitePosition
        }

        let arrAround = [-1,0,1];

        for(let col of arrAround) {
            for(let row of arrAround) {
                if(col === 0 && row === 0) {
                    continue
                }
                let checkCol = startColInd+col;
                let checkRow = parseInt(piece[1]) + row;
                if(checkCol >= 0 && checkCol < 8 && checkRow > 0 && checkRow <= 8) {
                    let currentSpace = this.cols[checkCol] + checkRow;
                    if(movePosition[currentSpace] === 'king') {
                        console.log('King Check found!')
                        return true
                    }
                }
                
            }
        }
        return false
    }

    checkKnightChecks(piece,moveColor) {
        let startColInd = this.colsMap[piece[0]];
        let movePosition = null;
        if(moveColor === 'black') {
            movePosition = this.blackPosition
        }
        else {
            movePosition= this.whitePosition
        }

        let arr1 = [-1,1];
        let arr2 = [-2,2];

        for(let one of arr1) {
            for(let two of arr2) {
                if(this.checkKnightsReverse(startColInd + one, parseInt(piece[1]) + two, movePosition)) {
                    return true
                }
                else if(this.checkKnightsReverse(startColInd + two, parseInt(piece[1]) + one, movePosition)) {
                    return true
                }
            }
        }
        return false
    }

    checkKnightsReverse(checkCol, checkRow, movePosition) {
        if(checkCol >= 0 && checkCol < 8 && checkRow > 0 && checkRow <= 8) {
            let currentSpace = this.cols[checkCol] + checkRow;
            if(movePosition[currentSpace] === 'king') {
                console.log('Knight Check found!')
                return true
            }
        }
        return false
    }

    checkSpaceForCheck(colHolder,rowHolder,movePosition) {
        let currentSpace = this.cols[colHolder] + rowHolder;
        if(movePosition[currentSpace] === 'king') {
            console.log('Check found!')
            return {'checkFound' :true, 'rowHolder': -100}
        }
        else if(this.whitePosition[currentSpace] != null || this.blackPosition[currentSpace] != null) {
            return {'checkFound' :false, 'rowHolder': -100}
        } 
        else {
            return {'checkFound' :false, 'rowHolder': rowHolder}
        }
    }

}



const board = new chessBoard();
