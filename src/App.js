import React, { useState, useEffect } from "react";
import socket from "./socket";
import "./App.css";

function App() {
    const [question, setQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [answer, setAnswer] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizEnded, setQuizEnded] = useState(false);

    useEffect(() => {
        socket.on("next_question", (q) => {
            setQuestion(q);
            setAnswer("");
        });

        socket.on("update_leaderboard", (data) => {
            setLeaderboard(data);
        });

        socket.on("quiz_end", (finalLeaderboard) => {
            setLeaderboard(finalLeaderboard);
            setQuizEnded(true);
        });

        return () => {
            socket.off("next_question");
            socket.off("update_leaderboard");
            socket.off("quiz_end");
        };
    }, []);

    const startQuiz = () => {
        if (playerName.trim()) {
            setQuizStarted(true);
            socket.emit("start_quiz");
        } else {
            alert("Please enter your name to start!");
        }
    };

    const submitAnswer = () => {
        if (!answer) {
            alert("Please select an answer!");
            return;
        }
        const timeSubmitted = Date.now();
        socket.emit("submit_answer", {
            playerName,
            questionId: question.id,
            answer,
            timeSubmitted,
        });
    };

    return (
     <div className="full"> 
        <h1 className="heading">Quiz time</h1>
      
        <div className="container"
    
         style={{ textAlign: "center" }}>
            {!quizStarted ? (
                <div className="details" >
                    <h1 className="line"style={{color:"white"}}>Enter your name to start</h1>
                    <input className="enter"
                        type="text"
                        placeholder="Your Name"
                        onChange={(e) => setPlayerName(e.target.value)}
                        value={playerName}
                    />
                    <button className="submit-name" onClick={startQuiz}>Join Quiz</button>
                    
                </div>
            ) : quizEnded ? (
                <div>
                    <h1>Quiz Ended</h1>
                    <h2>Final Leaderboard</h2>
                    <ol>
                        {leaderboard.map((player, index) => (
                            <li key={index}>
                                {index + 1}. {player.name}: {player.score}
                            </li>
                        ))}
                    </ol>
                </div>
            ) : (
                <>
                    {question ? (
  <div className="quiz-container">
    <h1>{question.question}</h1>
    <div className="options-container">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => setAnswer(option)}
          className={answer === option ? "selected" : ""}
        >
          {option}
        </button>
      ))}
    </div>
    <button className="submit-name" onClick={submitAnswer}>
      Submit Answer
    </button>
  </div>
) : (
  <h2>Waiting for next question...</h2>
)}


                   <div className="leaderboard">
                    <h2>Leaderboard</h2>
                    <ol>
                        {leaderboard.map((player, index) => (
                            <li key={index}>
                                {index + 1}. {player.name}: {player.score} points
                            </li>
                        ))}
                    </ol>
                    </div>
                </>
            )}
        </div>
        </div>
    );
}

export default App;
