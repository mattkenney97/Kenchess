// let todoList = [];
// let input = prompt("Todo list action");

// while (input.toLowerCase() != 'quit') {
//     console.log(input)

//     if (input.toLowerCase() === 'add') {
//         todoList.push(prompt("What do you want to add?"))
//     }
//     else if (input.toLowerCase() === 'list') {
//         console.log(todoList)
//     }
//     else if (input.toLowerCase() === 'delete') {
//         let remove = prompt("What do you want to delete?");

//     }
//     input = prompt("Todo list action");
// }


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
                            else if (check.innerHTML === board.whitePieces['rook']) {
                                validMove = board.validWhiteRookMove(check, button)
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
        if(start.name === end.name) {
            console.log('Invalid pawn move')
            return false
        }
        let ind = 0;
        for( let letter of this.cols ) {
            if ( letter === start.name[0] ) {
                break;
            }
            ind += 1
        }
        let front2 = null;
    
        if( start.name[1] === '2' ) {
            front2 = this.cols[ind] + (parseInt(start.name[1]) + 2)
        }
    
        let front = this.cols[ind] + (parseInt(start.name[1])+1)
    
        if (end.name != front) {
            front = null
        }
        else {
            if(end.innerHTML != "") {
                front= null
            }
        }
        let leftFront = null;
        let rightFront = null;
        if (start.name[0] != 'a') {
            if (Object.values(this.blackPieces).includes(end.innerHTML)) {
                leftFront = this.cols[ind - 1] + (parseInt(start.name[1]) + 1)
            }
            if (end.name != leftFront) {
                leftFront = null
            }
        }
        if (start.name[0] != 'h') {
            if (Object.values(this.blackPieces).includes(end.innerHTML)) {
                rightFront = this.cols[ind + 1] + (parseInt(start.name[1]) + 1)
            }
            if (end.name != rightFront) {
                rightFront = null
            }
        }
    
        if (!front && !leftFront && !rightFront && !front2) {
            console.log('Invalid pawn move')
    
            return false
        }
    
        return true
    }

    validWhiteRookMove(start, end) {
        console.log('Trying rook move')
        if(start.name === end.name) {
            console.log('Invalid rook move')
            return false
        } 
        else if(Object.values(this.whitePieces).includes(end.innerHTML)) {
            console.log('Invalid rook move')
            return false
        }

        let startColInd = 0;
        for( let letter of this.cols ) {
            if ( letter === start.name[0] ) {
                break;
            }
            startColInd += 1
        }

        let endColInd = 0;
        for( let letter of this.cols ) {
            if ( letter === end.name[0] ) {
                break;
            }
            endColInd += 1
        }

        if (start.name[0] === end.name[0]) {
            let startRow = start.name[1]-1;
            let endRow = end.name[1]-1;
            if(startRow > endRow) {
                console.log('Trying more 1')
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
            console.log('Invalid rook move')
            return false
        }
    }

    checkEmpty(boardSpace) {
        if(Object.values(this.blackPieces).includes(boardSpace.innerHTML)) {
            console.log('Invalid rook move')
            return false
        }
        else if(Object.values(this.whitePieces).includes(boardSpace.innerHTML)) {
            console.log('Invalid rook move')
            return false
        }
        return true
    }
}

const board = new chessBoard();
