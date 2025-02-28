const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});


const questions = [
    { id: 1, question: "What is the deepest ocean on Earth?", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Pacific Ocean" },
    { id: 2, question: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Carbon", "Oxygen"], answer: "Hydrogen" },
    { id: 3, question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: "1945" },
    { id: 4, question: "Who painted the Mona Lisa?", options: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Michelangelo"], answer: "Leonardo da Vinci" },
    { id: 5, question: "What is the sum of angles in a triangle?", options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"], answer: "180 degrees" },
    { id: 6, question: "Which continent is the Sahara Desert located in?", options: ["Asia", "Africa", "South America", "Europe"], answer: "Africa" },
    { id: 7, question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: "Diamond" },
    { id: 8, question: "Who invented the telephone?", options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Albert Einstein"], answer: "Alexander Graham Bell" },
    { id: 9, question: "What is the largest organ in the human body?", options: ["Heart", "Brain", "Liver", "Skin"], answer: "Skin" },
    { id: 10, question: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Earth"], answer: "Mercury" }
];

let currentQuestionIndex = 0;
let players = [];
let answeredUsers = new Set();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("start_quiz", () => {
        currentQuestionIndex = 0;
        players = [];
        answeredUsers.clear();
        io.emit("next_question", questions[currentQuestionIndex]);
    });

    socket.on("submit_answer", ({ playerName, questionId, answer, timeSubmitted }) => {
        const question = questions[currentQuestionIndex];
        const isCorrect = question && question.answer === answer;

        let player = players.find((p) => p.name === playerName);
        if (!player) {
            player = { name: playerName, score: 0, lastAnswerTime: 0 };
            players.push(player);
        }
        if (isCorrect) {
            player.score += 10;
            player.lastAnswerTime = timeSubmitted;
        }

        

        answeredUsers.add(playerName);

        players.sort((a, b) => {
            if (b.score === a.score) {
                return a.lastAnswerTime - b.lastAnswerTime;
            }
            return b.score - a.score;
        });

        io.emit("update_leaderboard", players);

        
        if (answeredUsers.size >= io.sockets.sockets.size) {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                answeredUsers.clear(); 
                setTimeout(() => {
                    io.emit("next_question", questions[currentQuestionIndex]);
                }, 2000); 
            } else {
                io.emit("quiz_end", players);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        // Handle user disconnection if necessary
    });
});

server.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
});
