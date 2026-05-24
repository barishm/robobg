import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useSelector } from 'react-redux';
import Loading from 'src/components/Loading';
import Error from 'src/components/Error';
import { useTranslation } from 'react-i18next';

const Bests = () => {
  const { t } = useTranslation()
  const lang = useSelector((state) => state.language.lang);
  const navigate = useNavigate();
  const noImage = 'images/no-image.jpg';

  const { data, isLoading, isError } = useGetAllRobotsQuery();

  const details = (robotId) => {
    navigate('/robots/' + robotId);
  };

  if (isError) {
    return <Error />;
  }

  return (
    <div>
      <h3
        className="fw-bolder"
        style={{ marginTop: '10px', textAlign: 'center' }}
      >
        {lang === 'en' ? 'Best Robot Vacuum Cleaners' : 'Най-добри роботи'}
      </h3>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <></>
      ) : data ? (
        <div className="row mt-4">
          {data
            .filter((item) => item.bests)
            .sort((a, b) => a.bests - b.bests)
            .map((item) => (
              <div
                key={item.id}
                className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-3"
              >
                <div className="card bg-body-tertiary rounded">
                  <img
                    className="card-img-top rounded-top"
                    value={item.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => details(item.id)}
                    src={item.image || noImage}
                    alt="..."
                  />
                  <div className="card-body">
                    <div className="text-center">
                      <h5
                        className="card-title fw-bolder"
                        onClick={() => details(item.id)}
                        value={item.id}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.model}
                      </h5>
                    </div>
                  </div>
                  <div className="card-footer border-top-0 bg-transparent d-flex justify-content-evenly align-items-center mb-1">
                    <div className="btn-group text-center">
                      <button
                        type="button"
                        className="btn btn-warning btn-sm dropdown-toggle rounded-5 d-none d-md-inline-block"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {lang === 'en' ? 'Check price' : 'Провери цена'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-warning btn-sm dropdown-toggle rounded-5 d-md-none"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {lang === 'en' ? 'Price' : 'Цена'}
                      </button>
                      <ul className="dropdown-menu">
                        {item.purchaseLinks && item.purchaseLinks.length > 0 ? (
                          item.purchaseLinks.map((link) => (
                            <li key={link.id}>
                              <a
                                className="dropdown-item"
                                target="_blank"
                                href={link.link}
                                rel="noreferrer"
                              >
                                {link.name}
                              </a>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="dropdown-item disabled text-muted" aria-disabled="true">
                              {t("noOffersAvailable")}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="mt-1">
                      <i className="fa-regular fa-comments fa-sm"></i>{' '}
                      <span className="">{item.qnaCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
};
export default Bests;
