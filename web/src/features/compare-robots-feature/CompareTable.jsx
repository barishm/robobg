import { useSelector } from 'react-redux';
import Loading from 'src/components/Loading';
import ReleaseDateDisplay from 'src/components/ReleaseDateDisplay';
import SpecsRenderer from 'src/components/SpecsRenderer';
import styles from './CompareTable.module.css';
import { specsConfig } from './specsConfig';

// Internal helper components
const SectionHeader = ({ title, colSpan }) => {
  return (
    <tr className="table-primary border">
      <th></th>
      <td
        colSpan={colSpan}
      >
        {title}
      </td>
    </tr>
  );
};

const SpecificationRow = ({ textKey, field, unit, renderRow, renderStringRow }) => {
  return (
    <tr>
      <th scope="row">
        <span className={styles.stickySpecLabel}>
          {SpecsRenderer({ textKey })}{' '}
          <a
            tabIndex="0"
            data-bs-container="body"
            data-bs-toggle="popover"
            data-bs-trigger="hover focus"
            data-bs-placement="right"
            data-bs-content={SpecsRenderer({ textKey: `${textKey}Desc` })}
            style={{ color: '#000000', cursor: 'pointer' }}
          >
          </a>
        </span>
      </th>
      {unit ? renderStringRow(field, unit) : renderRow(field)}
    </tr>
  );
};

// Main component
const CompareTable = ({ robots, onDeleteRobot }) => {
  const noImage = 'images/no-image.jpg';
  const lang = useSelector((state) => state.language.lang);

  const deleteHandler = (e) => {
    const id = parseInt(e.target.dataset.id, 10);
    onDeleteRobot(id);
  };

  const renderRow = (field) => {
    return robots.map((item) => {
      let value = field.includes('.')
        ? getFieldByPath(item, field)
        : item[field];
      return (
        <td
          key={item.id}
          style={{
            height: '80px',
            verticalAlign: 'bottom',
            textAlign: 'left',
            whiteSpace: 'normal',
          }}
          className="border"
        >
          {value === null ? (
            <span style={{ color: 'grey' }}>N/A</span>
          ) : value === "Y" ? (
            <span style={{ color: 'green' }}>
              {lang === 'en' ? 'YES' : 'ДА'}
            </span>
          ) : value === "N" ? (
            <span style={{ color: 'red' }}>{lang === 'en' ? 'NO' : 'НЕ'}</span>
          ) : (
            value
          )}
        </td>
      );
    });
  };
  const renderStringRow = (field, addition) => {
    return robots.map((item) => {
      let value = field.includes('.')
        ? getFieldByPath(item, field)
        : item[field];
      return (
        <td
          key={item.id}
          style={{
            height: '80px',
            verticalAlign: 'bottom',
            textAlign: 'left',
            whiteSpace: 'normal',
          }}
          className="border"
        >
          {value === null ? (
            <span style={{ color: 'grey' }}>N/A</span>
          ) : (
            <>
              {value} {addition === 'm²' ? <>m&sup2;</> : addition}
            </>
          )}
        </td>
      );
    });
  };
  function getFieldByPath(obj, path) {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        value = null;
        break;
      }
    }
    return value;
  }

  return (
    <div
      className={`${styles.comparisonContainer}`}
      style={{
        overflowX: 'auto',
        marginBottom: '50px',
        maxWidth: '1000px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {robots ? (
        <div className={styles.responsiveWrapper}>
          <table
            className={`table ${styles.verticalComparisonTable}`}
            style={{ width: 'auto', marginLeft: 'auto', marginRight: 'auto' }}
          >
            <thead></thead>
            <tbody>
              {/* Model name row */}
              <tr className="table-primary border">
                <th scope="row"></th>
                {robots.map((item) => (
                  <td
                    key={item.id}
                  >
                    {item.model}
                  </td>
                ))}
              </tr>

              {/* Image and delete button row */}
              <tr>
                <th scope="row"></th>
                {robots.map((item) => (
                  <td
                    key={item.id}
                    style={{
                      height: '90px',
                      verticalAlign: 'bottom',
                      textAlign: 'left',
                    }}
                    className="border"
                  >
                    <div className="image d-flex">
                      <img
                        src={item.image || noImage}
                        alt="..."
                        style={{ width: '70px', display: 'block' }}
                      ></img>
                      <div className="image-overlay ms-1">
                        <i
                          className="fa-solid fa-xmark"
                          style={{
                            color: '#D60000',
                            fontSize: '25px',
                            cursor: 'pointer',
                          }}
                          data-id={item.id}
                          onClick={deleteHandler}
                        ></i>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Specification rows */}
              {specsConfig.map((spec, index) => {
                if (spec.section) {
                  return (
                    <SectionHeader
                      key={`section-${index}`}
                      title={spec.section}
                      colSpan={robots.length}
                    />
                  );
                }

                if (spec.custom === 'releaseDate') {
                  return (
                    <tr key={`spec-${index}`}>
                      <th scope="row">
                        <span className={styles.stickySpecLabel}>
                          {SpecsRenderer({ textKey: spec.textKey })}{' '}
                          <a
                            tabIndex="0"
                            data-bs-container="body"
                            data-bs-toggle="popover"
                            data-bs-trigger="hover focus"
                            data-bs-placement="right"
                            data-bs-content={SpecsRenderer({
                              textKey: `${spec.textKey}Desc`,
                            })}
                            style={{ color: '#000000', cursor: 'pointer' }}
                          >
                          </a>
                        </span>
                      </th>
                      {robots.map((item) => (
                        <td
                          key={item.id}
                          style={{
                            height: '80px',
                            verticalAlign: 'bottom',
                            textAlign: 'left',
                            whiteSpace: 'normal',
                          }}
                          className="border"
                        >
                          <ReleaseDateDisplay
                            releaseDate={item.otherSpecifications.releaseDate}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                }

                return (
                  <SpecificationRow
                    key={`spec-${index}`}
                    textKey={spec.textKey}
                    field={spec.field}
                    unit={spec.unit}
                    renderRow={renderRow}
                    renderStringRow={renderStringRow}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};
export default CompareTable;
