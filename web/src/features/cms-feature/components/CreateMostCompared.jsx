import { useSelector } from "react-redux";
import { useGetAllRobotsQuery } from "src/app/services/robotApiSlice";
import { useCreateMostComparesMutation } from "src/app/services/mostComparesApiSlice";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const CreateMostCompared = () => {
  const initialState = {
    order: "",
    robot1: "",
    robot2: "",
    robot3: "",
  };
  const [MostCompared, setMostCompared] = useState(initialState);

  const { accessToken } = useSelector((state) => state.auth);
  const { data: allModels } = useGetAllRobotsQuery();
  const [CreateMostCompared, { isSuccess, isError, error }] = useCreateMostComparesMutation();

  // Toast notifications for create most compared
  useEffect(() => {
    if (isSuccess) {
      toast.success("Most compared entry created successfully!");
    } else if (isError) {
      toast.error(`Failed to create most compared: ${error?.data?.message || "Unknown error"}`);
    }
  }, [isSuccess, isError, error]);

  const create = async () => {
    const findIdByModel = (model) => {
      const robot = allModels.find((item) => item.model === model);
      return robot ? Number(robot.id) : null;
    };

    const { order, robot1, robot2, robot3 } = MostCompared;

    const robot1Id = findIdByModel(robot1);
    const robot2Id = findIdByModel(robot2);
    const robot3Id = findIdByModel(robot3);

    const jsonBody = {
      order: Number(order), 
      robot1: robot1Id,
      robot2: robot2Id,
      robot3: robot3Id,
    };
    await CreateMostCompared({ jsonBody, accessToken }).unwrap();
    resetMostComparedState();
  };
  const resetMostComparedState = () => {
    setMostCompared(initialState);
  };


  return (
    <div
      className="modal fade"
      id="createMostCompared"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Create Most Compared
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={resetMostComparedState}
            ></button>
          </div>
          <div className="modal-body" style={{ textAlign: "left" }}>
            <div className="form-inputs">
              <div className="mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Order
                </label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  name="order"
                  onChange={(e) => {
                    setMostCompared({
                      ...MostCompared,
                      [e.target.name]: e.target.value,
                    });
                  }}
                  value={MostCompared.order}
                ></input>
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  list="datalistOptions1"
                  id="exampleDataList1"
                  placeholder="Select 1st robot from list"
                  name="robot1"
                  onChange={(e) => {
                    setMostCompared({
                      ...MostCompared,
                      [e.target.name]: e.target.value,
                    });
                  }}
                  value={MostCompared.robot1}
                />
                <datalist id="datalistOptions1">
                  {allModels && (
                    <>
                      {allModels.map((item) => (
                        <option key={item.id} value={item.model}></option>
                      ))}
                    </>
                  )}
                </datalist>
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  list="datalistOptions2"
                  id="exampleDataList2"
                  placeholder="Select 2nd robot from list"
                  name="robot2"
                  onChange={(e) => {
                    setMostCompared({
                      ...MostCompared,
                      [e.target.name]: e.target.value,
                    });
                  }}
                  value={MostCompared.robot2}
                />
                <datalist id="datalistOptions2">
                  {allModels && (
                    <>
                      {allModels.map((item) => (
                        <option key={item.id} value={item.model}></option>
                      ))}
                    </>
                  )}
                </datalist>
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  list="datalistOptions3"
                  id="exampleDataList3"
                  placeholder="Select 3th robot from list"
                  name="robot3"
                  onChange={(e) => {
                    setMostCompared({
                      ...MostCompared,
                      [e.target.name]: e.target.value,
                    });
                  }}
                  value={MostCompared.robot3}
                />
                <datalist id="datalistOptions3">
                  {allModels && (
                    <>
                      {allModels.map((item) => (
                        <option key={item.id} value={item.model}></option>
                      ))}
                    </>
                  )}
                </datalist>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={resetMostComparedState}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-success"
              data-bs-dismiss="modal"
              onClick={create}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMostCompared;
