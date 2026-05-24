import { useState } from "react";
import TimeAgo from "src/components/TimeAgo";
import {
  useGetQnaQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useDeleteQuestionMutation,
  useDeleteAnswerMutation,
} from "src/app/services/qnaApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const QnA = (props) => {
  const id = props.Id;
  const [questionText, setQuestionText] = useState("");
  const [answerTexts, setAnswerTexts] = useState({});
  const { data: allQuestions, isLoading: allQuestionsLoading } =
    useGetQnaQuery(id);
  const [askQuestion] = useAskQuestionMutation();
  const [answerQuestion] = useAnswerQuestionMutation();
  const [deleteQuestionn] = useDeleteQuestionMutation();
  const [deleteAnswerr] = useDeleteAnswerMutation();
  const { username, role, accessToken } = useSelector((state) => state.auth);
  const [hoveredAnswerId, setHoveredAnswerId] = useState(null);
  const [invalidQuestion, setInvalidQuestion] = useState(false);
  const [invalidAnswer, setInvalidAnswer] = useState(false);
  const navigate = useNavigate();

  const [showAnswerInputs, setShowAnswerInputs] = useState({});
  const toggleAnswerInput = (commentId) => {
    setShowAnswerInputs((prevShowAnswerInputs) => ({
      ...prevShowAnswerInputs,
      [commentId]: !prevShowAnswerInputs[commentId],
    }));
  };

  const handleAnswerTextChange = (commentId, text) => {
    setAnswerTexts((prevTexts) => ({
      ...prevTexts,
      [commentId]: text,
    }));
  };

  const hideAllAnswerInputs = () => {
    setShowAnswerInputs((prevShowAnswerInputs) =>
      Object.keys(prevShowAnswerInputs).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    );
  };

  const handleAnswer = async (questionId) => {
    const answerBody = {
      questionId: questionId,
      authorUsername: username,
      text: answerTexts[questionId],
    };
    isUserLoggedIn();
    if (answerBody.text.length < 5 || answerBody.text.length > 300) {
      setInvalidAnswer(true);
      return;
    }
    try {
      await answerQuestion({ answerBody, accessToken: accessToken });
      setAnswerTexts("");
      hideAllAnswerInputs();
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const handleQuestion = async () => {
    const questionBody = {
      robotId: id,
      authorUsername: username,
      text: questionText,
    };
    isUserLoggedIn();
    if (questionBody.text.length < 5 || questionBody.text.length > 300) {
      setInvalidQuestion(true);
      return;
    } else {
      setInvalidQuestion(false);
      try {
        await askQuestion({ questionBody, accessToken: accessToken });
        setQuestionText("");
        hideAllAnswerInputs();
      } catch (error) {
        console.error("Error creating question:", error);
      }
    }
  };
  const isUserLoggedIn = () => {
    if(username === null) {
      navigate("/login");
    }
  }

  function deleteQuestion(event) {
    const id = event.target.getAttribute("value");
    deleteQuestionn({ id, accessToken });
  }
  function deleteAnswer(event) {
    const id = event.target.getAttribute("value");
    deleteAnswerr({ id, accessToken });
  }

  return (
    <div className="comments-list mt-4">
      <h5 className="fw-bolder" style={{ marginBottom: "20px" }}>
        Questions & answers
      </h5>
      <textarea
        className={`form-control ${invalidQuestion ? "is-invalid" : ""}`}
        aria-label="With textarea"
        value={questionText}
        placeholder="Enter Your question here"
        onChange={(event) => setQuestionText(event.target.value)}
        onFocus={isUserLoggedIn}
      ></textarea>
      <div className="invalid-feedback">
        Question must contain 5-300 characters.
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm mt-2 mb-4"
        onClick={handleQuestion}
      >
        Ask Question
      </button>
      {allQuestionsLoading ? (
        <>Loading...</>
      ) : (
        <>
          {allQuestions.map((comment) => (
            <div
              className="comment mb-3 mt-3"
              style={{ position: "relative" }}
              key={comment.id}
            >
              <h6 className="me-5">
                <span className="me-2" style={{ color: "grey" }}>
                  Q:
                </span>
                <span className="text-break">{comment.text}</span>
              </h6>
              {username &&
                (role === "ADMIN" || username === comment.author.username) && (
                  <div className="dropdown" style={{position:"absolute",top:"0",right:"0",padding:"5px"}}>
                    <i
                      className="fa-solid fa-ellipsis-vertical"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ color: "#000000", cursor: "pointer" }}
                    ></i>
                    <ul className="dropdown-menu">
                      <li>
                        <a
                          value={comment.id}
                          onClick={deleteQuestion}
                          className="dropdown-item"
                          href="#"
                        >
                          Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              {comment.answers.length > 0 && (
                <div>
                  {comment.answers.map((answer) => (
                    <div
                      className="p-3"
                      style={{ position: "relative" }}
                      key={answer.id}
                      onMouseEnter={() => setHoveredAnswerId(answer.id)}
                      onMouseLeave={() => setHoveredAnswerId(null)}
                    >
                      <h6 className="me-5">
                        <span className="me-2" style={{ color: "grey" }}>
                          A:
                        </span>
                        <span className="text-break">{answer.text}</span>
                      </h6>
                      {username &&
                        (role === "ADMIN" ||
                          username === comment.author.username) && (
                          <div className="dropdown me-1" style={{position:"absolute",top:"0",right:"0",padding:"5px"}}>
                            {hoveredAnswerId === answer.id && (
                              <i
                                className="fa-solid fa-ellipsis-vertical"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{
                                  color: "#000000",
                                  cursor: "pointer",
                                }}
                              ></i>
                            )}
                            <ul className="dropdown-menu">
                              <li>
                                <a
                                  value={answer.id}
                                  onClick={deleteAnswer}
                                  className="dropdown-item"
                                  href="#"
                                >
                                  Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        )}
                      <p style={{ marginBottom: "5px" }}>
                        By <strong>{answer.author.username}</strong> ·
                        <TimeAgo createTime={answer.createTime} />
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => toggleAnswerInput(comment.id)}
                className="btn btn-outline-light mb-2"
                style={{
                  border: "none",
                  color: "black",
                  borderRadius: "15px",
                }}
                type="button"
              >
                Reply
              </button>
              {showAnswerInputs[comment.id] && (
                <div>
                  <textarea
                    className={`form-control ${
                      invalidAnswer ? "is-invalid" : ""
                    }`}
                    aria-label="With textarea"
                    value={answerTexts[comment.id] || ""}
                    onChange={(event) =>
                      handleAnswerTextChange(comment.id, event.target.value)
                    }
                    onFocus={isUserLoggedIn}
                  ></textarea>
                  <div className="invalid-feedback">
                    Asnwer must contain 5-300 characters.
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm mt-2"
                    onClick={() => handleAnswer(comment.id)}
                  >
                    Answer
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default QnA;
