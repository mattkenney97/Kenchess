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

// const button = document.querySelector("button[name='h1']")
// let classes = button.classList

// button.addEventListener('click', function() {
//     let result = classes.toggle("boardHighlight");
//   })

function validWhitePawnMove(board, start, end) {
    console.log('Trying pawn move')
    let cols = ['a','b','c','d','e','f','g','h'];
    let ind = 0;
    for( let letter of cols ) {
        if ( letter === start.name[0] ) {
            break;
        }
        ind += 1
    }
    console.log(start.name[0])
    console.log(ind)
    let front = start.name[0] + (parseInt(start.name[1]) + 1);


    let leftFront = start.name[0] + (parseInt(start.name[1]) + 1)
}

const boardButtons = document.querySelectorAll("button[class='boardSquare']")

for( let button of boardButtons ) {
    button.addEventListener('click', function() {
            let checkFound = false;
            for( let check of boardButtons ) {
                if (check.classList.contains('boardHighlight')) {
                    checkFound = true
                    if (check.innerHTML != null) {
                        if (check.innerHTML === '\u2659') {
                            validWhitePawnMove(boardButtons, check, button)
                        }
                        button.innerHTML = check.innerHTML
                        check.innerHTML = null
                    }
                    check.classList.toggle("boardHighlight");
                }
            }
            if (checkFound === false) {
                button.classList.toggle("boardHighlight");
            }
          })
}
