"use client"
import React, { useEffect, useRef } from "react";

const settings = {
    width : 400,
    height : 400,
    columns: 21,
    rows: 21,
    speed: 10
}

const style = {
    canvas :{
        display: 'flex' ,
        border: '3px solid black',
        marginTop: '5px',
        marginRight: 'auto',
        marginLeft: 'auto'
    },
    message :{
        fontSize: 'x-large',
        textAlign: 'center'
    },
    div :{
        textAlign: 'center'
    },
    button :{
        backgroundColor: 'blue',
        color: 'white',
        "&:hover" :{
            backgroundColor: 'red',
            color: 'white',
            cursor: 'pointer',
            transition: "0.5s ",
        }
    }
}
export default function SnakeGame(props){
    let canva = useRef();
    
    useEffect(()=>{
        let settings = {
            width : props.width || 400,
            height : props.height || 400,
            columns: props.columns || 21,
            rows: props.rows || 21,
            connectNum: props.speed || 10,
        }
        const canvas = canva.current;
        canvas.width = settings.width
        let extraHeight = 100;
        canvas.height = settings.height + extraHeight;
        let context = canvas.getContext('2d');
        new Snake(settings.rows,settings.columns,settings.width,settings.height,canvas,context, extraHeight)
    })
    

    return (
           <div style = {style.div}>
               <canvas ref={canva} style = {style.canvas}/>
               How to play:
                <br/>
                1. Collect Apples to get bigger.
                <br/>
                <br/>
                <div className = "text-xs" >(The colors of the buttons change on purpose)</div>
           </div>
       )
}



class Snake{
    done = false;
    running = false;
    score = 0;
    darkmode;
    intervalId;
    snake = {
        x: [],
        y: [],
        direction: 'right',
        length: 5,
        initialize(rows,columns){
            for(let i = 0; i < this.length; i++){
                this.y.push(parseInt(rows/2))
                this.x.push(parseInt(columns/2)-i)
            }
        },
        moveQueue: []
    };
    //Buttons
    startButton;
    darkModeButton;


    constructor(rows, columns,width,height,canvas,context, extraHeight){
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.context = context;
        this.extraHeight = extraHeight;
        this.snake.initialize(rows,columns);
        this.board = this.createBoard();
        this.darkmode = true;
        this.mouse = {x: 0, y: 0};
        this.mouseMove = document.addEventListener("mousemove", e => {
            this.mouse = this.getMousePos(canvas, e);
        });
        this.drawBoard();
        document.onmousemove = (event) =>{
            const isStartButton = context.isPointInPath(this.startButton, event.offsetX, event.offsetY);
            const isDarkModeButton = context.isPointInPath(this.darkModeButton, event.offsetX, event.offsetY);
            if (isStartButton || isDarkModeButton){
                document.body.style.cursor = 'pointer';
            }else{
                document.body.style.cursor = 'default';
            }
        }
        document.onclick = (event) => {
            const isStartButton = context.isPointInPath(this.startButton, event.offsetX, event.offsetY);
            if (isStartButton){ this.start()}
            const isDarkModeButton = context.isPointInPath(this.darkModeButton, event.offsetX, event.offsetY);
            if (isDarkModeButton){ this.darkmode = !this.darkmode; this.drawBoard()}
        }
        document.onkeydown = (e) => {
            e.preventDefault();
            if(!this.running) return;
            //---------------------------------------------------------------------------------------------
            if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A'){ this.snake.moveQueue.push('left')}
            else if(e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W'){this.snake.moveQueue.push('up')}
            else if(e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D'){this.snake.moveQueue.push('right')}
            else if(e.key == 'ArrowDown' || e.key == 's' || e.key == 'S'){ this.snake.moveQueue.push('down')}
            //-----------------------------------------------------------------------------------------------
            if(e.key == 'r' || e.key == 'R'){this.reset();}
                this.drawBoard()
        }
    }
    initializeSnake(row,column){
        let snake = {
            x: [],
            y: [],
            direction: 'right',
            length: 5,
            initialize(rows,columns){
                for(let i = 0; i < this.length; i++){
                    this.y.push(parseInt(rows/2))
                    this.x.push(parseInt(columns/2)-i)
                }
            },
            moveQueue: []
        }
        snake.initialize(row,column);
        return snake;
    }
    getMousePos(canvas, evt) {
        let rect = this.canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
    fill(r,g,b) {
        this.context.fillStyle = 'rgb('+r+','+g+','+b+')'
    }
    fillRect(x,y,w,h){
        this.context.fillRect(x,y,w,h)
    }
    fillText(text,x,y,size){
        this.context.font = `${size}px Arial`;
        this.context.fillText(text,x,y);
    }
    fillLine(x1,y1,x2,y2){
        this.context.beginPath();
        this.context.moveTo(x1,y1);
        this.context.lineTo(x2,y2);
        this.context.stroke();
    }
    start(){
    if(this.done == true){ this.reset(); return;}
    if(this.running == false){
        this.running = true;
        window.clearInterval(this.intervalId)
        this.intervalId = window.setInterval(()=>{
            this.drawBoard()
            this.update()
        },1000/settings.speed)
    }else{
        this.running = false;
        window.clearInterval(this.intervalId)
        this.drawBoard()
        }
    }
    reset(){
        this.score = 0;
        this.snake = this.initializeSnake(this.rows,this.columns)
        this.done = false;
        this.board = this.createBoard();
        this.drawBoard();
    }
    createBoard(){
        // 1 = snake
        // 2 = apple
        // 0 = empty
        
        let board = []
        for(let i = 0; i < this.rows; i++){
            board[i] = []
            for(let j = 0; j < this.columns; j++){
                board[i][j] = 0
                // if(i == 0 || j == 0 || i == this.size-1 || j == this.size-1){
                //     board[i][j] = 2
                // }
                for(let k = 0; k < this.snake.x.length; k++){
                    if(j == this.snake.x[k] && i == this.snake.y[k]){
                        board[i][j] = 1
                    }
                }
            }
        }
        let appl = this.createApple(board)
        board[appl.y][appl.x] = 2
        return board
    }
    drawBoard(){
        let pieceWidth = this.width / this.columns
        let pieceHeight = this.height / this.rows
        
        {
            //empty the board
            if(this.darkmode){this.fill(0,0,0)}
            else{this.fill(255,255,255)}
            this.fillRect(0,0,this.width,this.height + this.extraHeight)
        }

        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.columns; j++){
                if(this.board[i][j] == 1){
                    if(this.darkmode){ this.fill(0,100,150) }
                    else{ this.fill(0,255,0) }
                    if(i == this.snake.y[0] && j == this.snake.x[0]){this.fill(0,200,255)} //head of snake is different color.
                    this.fillRect(j*pieceWidth,i*pieceHeight,pieceWidth,pieceHeight)
                }else if(this.board[i][j] == 2){
                    if(this.darkmode){ this.fill(255,0,0) }
                    else{ this.fill(255,0,0) }
                    this.fillRect(j*pieceWidth,i*pieceHeight,pieceWidth,pieceHeight)  
                }
            }
        }
        
        //------------------buttons omg so many magic numbers
        if(this.darkmode){
            this.context.strokeStyle = 'rgb(255,255,255)';
        }
        let textSize = 40;
        this.startButton = new Path2D();
        this.startButton.rect(8, this.height + 10, this.width - 15, 40)
        if (this.running == true){
            this.fillText('Stop', this.width/2 - textSize, this.height +42, textSize)
        }else{
            this.fillText('Start',this.width/2 - textSize, this.height + 42,textSize)
        }
        this.context.stroke(this.startButton);

        this.darkModeButton = new Path2D();
        this.darkModeButton.rect(8, this.height + 50, this.width - 15, 40)
        if(this.darkmode){
            this.fillText('Lightmode', this.width/2 - textSize-5, this.height +75, textSize/2)
        }else{
            this.fillText('Darkmode', this.width/2 - textSize-5, this.height +75, textSize/2)
        }
        this.context.stroke(this.darkModeButton);
        // --------------------------------------


        if(this.darkmode){this.context.strokeStyle = 'rgb(75,75,75)'; this.fill(255,255,255)}
        else{this.context.strokeStyle = 'rgb(0,0,0)'; this.fill(0,0,0)}
        this.fillText(this.score,30,50,50)    
        
    }
    refreshBoard(){
        let newBoard = JSON.parse(JSON.stringify(this.board));
        for(let i = 0; i < this.rows; i++){
            this.board[i] = []
            for(let j = 0; j < this.columns; j++){
                this.board[i][j] = 0
                if(newBoard[i][j] == 2){
                    this.board[i][j] = 2
                }
                for(let k = 0; k < this.snake.x.length; k++){
                    if(j == this.snake.x[k] && i == this.snake.y[k]){
                        this.board[i][j] = 1
                    }
                }
            }
        }
    }
    createApple(board){
        let apple = {
            x: parseInt(Math.random()*this.columns),
            y: parseInt(Math.random()*this.rows)
        }
        while(board[apple.y][apple.x] != 0){
            apple.x = parseInt(Math.random()*this.columns)
            apple.y = parseInt(Math.random()*this.rows)
        }
        return apple
    }
    update(){
        this.moveSnake()
        this.checkAppleCollision()
        this.refreshBoard()
        if(this.checkCollision()){
            this.gameOver()
        }
    }
    checkDirection(dir,snakeDir){
        if(dir == 'right' || dir == 'left'){
            if(snakeDir != 'right' && snakeDir != 'left'){
                return dir;
            }
        }
        if(dir == 'up' || dir == 'down'){
            if(snakeDir != 'up' && snakeDir != 'up'){
                return dir;
            }
        }
        return snakeDir;
    }
    moveSnake(){
        let head = {
            x: this.snake.x[0],
            y: this.snake.y[0]
        }
        if(this.snake.moveQueue.length){
            let potentialDirection = this.snake.moveQueue.shift();
            this.snake.direction = this.checkDirection(potentialDirection, this.snake.direction)
        }
        switch(this.snake.direction){
            case 'right':
                head.x++
                break;
            case 'left':
                head.x--
                break;
            case 'up':
                head.y--
                break;
            case 'down':
                head.y++
                break;
        }
        this.snake.x.unshift(head.x)
        this.snake.y.unshift(head.y)
        if(this.snake.x.length > this.snake.length){
            this.snake.x.pop()
            this.snake.y.pop()
        }
    }
    checkAppleCollision(){
        if(this.checkCollision()){return}
        if(this.board[this.snake.y[0]][this.snake.x[0]] == 2){
            this.snake.length++
            let apple = this.createApple(this.board)
            this.board[apple.y][apple.x] = 2
            this.score++
        }
    }
    checkCollision(){
        let head = {
            x: this.snake.x[0],
            y: this.snake.y[0]
        }
        if(head.x < 0 || head.x >= this.columns || head.y < 0 || head.y >= this.rows){
            return true
        }
        for(let i = 1; i < this.snake.x.length; i++){
            if(head.x == this.snake.x[i] && head.y == this.snake.y[i]){
                return true
            }
        }
        return false
    }
    gameOver(){
        clearInterval(this.intervalId)
        if(this.darkmode){this.context.strokeStyle = 'rgb(75,75,75)'; this.fill(255,255,255)}
        else{this.context.strokeStyle = 'rgb(0,0,0)'; this.fill(0,0,0)}
        this.fillText("Game Over",70,380,50)
        this.done = true;
        this.running = false;
    }

}