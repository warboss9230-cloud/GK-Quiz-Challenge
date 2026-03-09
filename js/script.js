let questions=[]
let current=0
let score=0
let timer=15
let interval

let xp=parseInt(localStorage.getItem("xp"))||0
let playerLevel=parseInt(localStorage.getItem("playerLevel"))||1

const nextBtn=document.getElementById("nextBtn")

fetch("data/questions.json")
.then(res=>res.json())
.then(data=>{
questions=data
})

function startGame(){

document.getElementById("startScreen").classList.add("hidden")
document.getElementById("menu").classList.remove("hidden")

}

function startMode(){

document.getElementById("menu").classList.add("hidden")
document.getElementById("quizBox").classList.remove("hidden")

shuffle()

loadQuestion()

}

function shuffle(){

questions.sort(()=>Math.random()-0.5)

}

function loadQuestion(){

resetTimer()

let q=questions[current]

document.getElementById("question").innerText=q.question

let box=document.getElementById("options")

box.innerHTML=""

q.options.forEach((opt,i)=>{

let div=document.createElement("div")

div.className="option"

div.innerText=opt

div.onclick=()=>selectAnswer(div,i)

box.appendChild(div)

})

}

function selectAnswer(el,i){

let correct=questions[current].answer

let options=document.querySelectorAll(".option")

options.forEach(o=>o.style.pointerEvents="none")

if(i===correct){

el.classList.add("correct")

score++

xp+=10

if(xp>=playerLevel*100){

playerLevel++

showAchievement("Level Up!")

}

}else{

el.classList.add("wrong")

options[correct].classList.add("correct")

}

document.getElementById("score").innerText=score
document.getElementById("xp").innerText=xp
document.getElementById("playerLevel").innerText=playerLevel

localStorage.setItem("xp",xp)
localStorage.setItem("playerLevel",playerLevel)

}

nextBtn.onclick=()=>{

current++

if(current>=questions.length){

finish()

return

}

loadQuestion()

}

function resetTimer(){

clearInterval(interval)

timer=30

updateProgress()

interval=setInterval(()=>{

timer--

updateProgress()

if(timer===0) nextBtn.click()

},1000)

}

function updateProgress(){

document.getElementById("progressBar").style.width=(timer/15*100)+"%"

}

function finish(){

clearInterval(interval)

document.getElementById("quizBox").classList.add("hidden")
document.getElementById("resultBox").classList.remove("hidden")

document.getElementById("finalScore").innerText=score+"/"+questions.length

saveLeaderboard()

confetti()

}

function showAchievement(text){

document.getElementById("achievements").innerHTML="🏆 "+text

}

function saveLeaderboard(){

let name=document.getElementById("playerName").value||"Player"

let board=JSON.parse(localStorage.getItem("board"))||[]

board.push({name:name,score:score})

board.sort((a,b)=>b.score-a.score)

board=board.slice(0,10)

localStorage.setItem("board",JSON.stringify(board))

displayLeaderboard()

}

function displayLeaderboard(){

let board=JSON.parse(localStorage.getItem("board"))||[]

let html=""

board.forEach((p,i)=>{

html+=`<p>${i+1}. ${p.name} - ${p.score}</p>`

})

document.getElementById("leaderboard").innerHTML=html

}

function confetti(){

for(let i=0;i<120;i++){

let div=document.createElement("div")

div.style.position="fixed"
div.style.width="8px"
div.style.height="8px"

div.style.background="hsl("+Math.random()*360+",100%,50%)"

div.style.left=Math.random()*100+"%"
div.style.top="-10px"

div.style.animation="fall 3s linear"

document.body.appendChild(div)

setTimeout(()=>div.remove(),3000)

}

  }
