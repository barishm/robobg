import { useGetLatestVideosQuery } from "src/app/services/youtubeApiSlice";
import { useSelector } from "react-redux";
import Error from "src/components/Error";  

const YoutubeVideos = () => {
  const { data, isLoading, isError } = useGetLatestVideosQuery();
  const lang = useSelector((state) => state.language.lang);

  return (
    <div style={{ marginBottom: "50px" }}>
      <h3
        className="fw-bolder"
        style={{ marginTop: "40px", textAlign: "center" }}
      >
        {lang === "en" ? (
          <>Latest Youtube Videos</>
        ) : (
          <>Наскоро качени видеоклипове</>
        )}
      </h3>
      {isLoading ? (
        <>Loading...</>
      ) :isError ? (
        <Error/>
      ) : data ? (
        <div className="row">
          {data.map((item) => (
            <div className="col-12 col-md-6 mt-4 d-flex justify-content-center" key={item.videoId}>
              <iframe
                width="400"
                height="225"
                style={{ borderRadius: "10px" }}
                src={`https://www.youtube.com/embed/${item.videoId}`}
              ></iframe>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
export default YoutubeVideos;
