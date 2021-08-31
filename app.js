
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
        this.enPassant = false;

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
                        if (check.innerHTML != null) {
                            let validMove = true;
                            if (check.innerHTML === board.whitePieces['pawn']) {
                                validMove = board.validWhitePawnMove(check, button)
                            }
                            else if (check.innerHTML === board.blackPieces['pawn']) {
                                validMove = board.validBlackPawnMove(check, button)
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
                                validMove = board.validKingMove(check, button)
                                board.enPassant = false
                            }
                            else if (check.innerHTML === board.whitePieces['queen'] || check.innerHTML === board.blackPieces['queen']) {
                                validMove = board.validQueenMove(check, button)
                                board.enPassant = false
                            }
                            if(validMove) {
                                button.innerHTML = check.innerHTML
                                check.innerHTML = null
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

    validWhitePawnMove(start, end) {
        console.log('Trying pawn move')
        if(!this.checkStartAndEnd(start,end)) {
            console.log('Invalid pawn move')
            return false
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

        if (!front && !leftFront && !rightFront && !front2) {
            console.log('Invalid pawn move')
    
            return false
        }

        if(front2 != null) {
            this.enPassant = true
        }
        else {
            this.enPassant = false
        }
    
        if(end.name[1] === '8') {
            this.pawnBackRank(start, true)
        }
        return true
    }

    validBlackPawnMove(start, end) {
        console.log('Trying pawn move')
        if(!this.checkStartAndEnd(start,end)) {
            console.log('Invalid pawn move')
            return false
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
    
        if (!front && !leftFront && !rightFront && !front2) {
            console.log('Invalid pawn move')
            return false
        }

        if(front2 != null) {
            this.enPassant = true
        }
        else {
            this.enPassant = false
        }

        if(end.name[1] === '1') {
            this.pawnBackRank(start)
        }
    
        return true
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
            if (end.name != leftFront) {
                leftFront = null
            }
        }
        if (start.name[0] != rightCol) {
            if (Object.values(pieces).includes(end.innerHTML)) {
                rightFront = this.cols[ind + rightChange] + (parseInt(start.name[1]) + rowChange)
            }
            if (end.name != rightFront) {
                rightFront = null
            }
        }
        return [leftFront, rightFront]
    }

    pawnBackRank(start, whitePawn = false) {
        let pieces = this.blackPieces;

        if(whitePawn) {
            pieces = this.whitePieces
        }

        let noValidInput = true
        while(noValidInput) {
            let newPiece = prompt("Choose: Queen, Rook, Bishop, Knight");
            if (newPiece.toLowerCase() == 'queen') {
                start.innerHTML = pieces['queen']
                noValidInput = false
            }
            else if (newPiece.toLowerCase() == 'rook') {
                start.innerHTML = pieces['rook']
                noValidInput = false
            }
            else if (newPiece.toLowerCase() == 'bishop') {
                start.innerHTML = pieces['bishop']
                noValidInput = false
            }
            else if (newPiece.toLowerCase() == 'knight') {
                start.innerHTML = pieces['knight']
                noValidInput = false
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
            return false
        }

        let startColInd = this.getColumnIndex(start);
        let endColInd = this.getColumnIndex(end);
        let startRowInd = start.name[1] - 1;
        let endRowInd = end.name[1] - 1;

        if(Math.abs(startRowInd-endRowInd) > 1) {
            console.log('Invalid king move')
            return false
        }
        else if(Math.abs(startColInd-endColInd) > 1) {
            console.log('Invalid king move')
            return false
        }
        else {
            return true
        }
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
        console.log(colDiff, rowDiff)

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
            console.log(checkSpace)
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
}

const board = new chessBoard();
