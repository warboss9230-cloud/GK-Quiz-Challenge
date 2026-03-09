let questions=[]
let currentQuestion=0
let score=0
let correct=0
let wrong=0
let timer=20
let interval
let level=1
let skipCount=2

async function startGame(){

const name=document.getElementById("playerName").value
if(name===""){
alert("Enter name")
return
}

document.getElementById("startScreen").classList.add("hidden")
document.getElementById("quizScreen").classList.remove("hidden")

const res=await fetch("data/questions.json")
questions=await res.json()

shuffle(questions)

loadQuestion()
startTimer()
}

function loadQuestion(){

if(currentQuestion>=10){
endGame()
return
}

const q=questions[currentQuestion]

document.getElementById("question").innerText=q.question

const optionsDiv=document.getElementById("options")
optionsDiv.innerHTML=""

q.options.forEach(opt=>{

const btn=document.createElement("button")
btn.innerText=opt

btn.onclick=()=>selectAnswer(btn,q.answer)

optionsDiv.appendChild(btn)

})

document.getElementById("progressText").innerText=`Question ${currentQuestion+1}/10`
document.getElementById("progressFill").style.width=((currentQuestion+1)/10)*100+"%"
}

function selectAnswer(button,answer){

clearInterval(interval)

const buttons=document.querySelectorAll("#options button")

buttons.forEach(btn=>{
btn.disabled=true

if(btn.innerText===answer){
btn.classList.add("correct")
}

})

if(button.innerText===answer){
score+=10
correct++
}else{
button.classList.add("wrong")
wrong++
}

document.getElementById("score").innerText="Score:"+score

setTimeout(()=>{
currentQuestion++
timer=20
loadQuestion()
startTimer()
},1000)

}

function startTimer(){

document.getElementById("timer").innerText=timer

interval=setInterval(()=>{

timer--

document.getElementById("timer").innerText=timer

if(timer<=0){
clearInterval(interval)
wrong++
currentQuestion++
timer=20
loadQuestion()
startTimer()
}

},1000)

}

function endGame(){

document.getElementById("quizScreen").classList.add("hidden")
document.getElementById("resultScreen").classList.remove("hidden")

document.getElementById("finalScore").innerText="Score: "+score
document.getElementById("correctCount").innerText="Correct: "+correct
document.getElementById("wrongCount").innerText="Wrong: "+wrong

const total=correct+wrong
const acc=Math.round((correct/total)*100)

document.getElementById("accuracy").innerText="Accuracy: "+acc+"%"

saveLeaderboard()
}

function saveLeaderboard(){

let board=JSON.parse(localStorage.getItem("quizBoard"))||[]

board.push({
name:document.getElementById("playerName").value,
score:score,
date:new Date().toLocaleDateString()
})

board.sort((a,b)=>b.score-a.score)

board=board.slice(0,10)

localStorage.setItem("quizBoard",JSON.stringify(board))

}

function showLeaderboard(){

document.getElementById("startScreen").classList.add("hidden")
document.getElementById("leaderboard").classList.remove("hidden")

const list=document.getElementById("leaderboardList")
list.innerHTML=""

let board=JSON.parse(localStorage.getItem("quizBoard"))||[]

board.forEach(p=>{

const li=document.createElement("li")
li.innerText=`${p.name} - ${p.score}`

list.appendChild(li)

})

}

function shuffle(arr){
arr.sort(()=>Math.random()-0.5)
}

function skipQuestion(){

if(skipCount<=0)return

skipCount--

currentQuestion++
loadQuestion()

}

function use5050(){

const q=questions[currentQuestion]
const buttons=document.querySelectorAll("#options button")

let removed=0

buttons.forEach(btn=>{
if(btn.innerText!==q.answer && removed<2){
btn.style.visibility="hidden"
removed++
}
})

}
