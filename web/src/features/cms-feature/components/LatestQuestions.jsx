import { useLatestQuestionsQuery } from "src/app/services/qnaApiSlice";
import Loading from "src/components/Loading";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TimeAgo from "src/components/TimeAgo";
import Error from "src/components/Error";

const LatestQuestions = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const { data, isLoading, isError } = useLatestQuestionsQuery(accessToken);
  const navigate = useNavigate();
  const details = (robotId) => {
    navigate("/robots/" + robotId);
  };

  if (isError) {
    return <Error />;
  }

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          {data.map((question) => (
            <div key={question.id} className="card mx-1 my-3 p-3">
              <p>
                {`${question.author.username} asked question about `}
                <a className="link-underline" onClick={() => details(question.robot.id)} href="#">
                  {question.robot.model}
                </a>
                <TimeAgo createTime={question.createTime} />
              </p>
              <p>
                {question.answers.length > 0
                  ? `This question has answers from: ${question.answers
                      .map((answer) => answer.author.username)
                      .join(", ")}`
                  : "No one has answered this question yet."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default LatestQuestions;
