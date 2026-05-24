import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useGetAllModeratorsQuery,
} from "src/app/services/userApiSlice";
import Loading from "src/components/Loading";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const ManageUsers = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const { data, isLoading, isError } = useGetAllUsersQuery(accessToken);
  const {
    data: moderators,
    isLoading: moderatorsIsLoading,
    isError: moderatorsIsError,
  } = useGetAllModeratorsQuery(accessToken);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateRole, { isSuccess, isError: isUpdateError, error }] = useUpdateUserMutation();

  // Toast notifications for update user role
  useEffect(() => {
    if (isSuccess) {
      toast.success("User role updated successfully!");
    } else if (isUpdateError) {
      toast.error(`Failed to update user role: ${error?.data?.message || "Unknown error"}`);
    }
  }, [isSuccess, isUpdateError, error]);

  let initialValues = {
    id: selectedUser?.id,
    username: selectedUser?.username,
    role: selectedUser?.role,
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: (values) => {
      const Userbody = values;
      let str = Userbody.role.slice(5);
      Userbody.role = str;
      updateRole({ Userbody, accessToken });
      document.getElementById("exampleDataList").value = "";
      setSelectedUser(null);
      formik.resetForm();
    },
  });

  const handleInputChange = (e) => {
    const user = data.find((item) => item.username === e.target.value);
    setSelectedUser(user);
  };

  if (isError) return <div>An error has occurred!</div>;

  if (isLoading) return <Loading />;

  return (
    <div
      className="card p-3"
      style={{ maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}
    >
      <div>
        <input
          className="form-control"
          list="datalistOptions"
          id="exampleDataList"
          placeholder="Select user from list"
          style={{ maxWidth: "250px" }}
          onChange={handleInputChange}
        />
        <datalist id="datalistOptions">
          {data && (
            <>
              {data.map((item) => (
                <option key={item.id} value={item.username} />
              ))}
            </>
          )}
        </datalist>
      </div>
      {selectedUser && (
        <>
          <h3 className="mt-3">{selectedUser.username}</h3>
          <form className="mt-3" onSubmit={formik.handleSubmit}>
            <input
              type="radio"
              className="btn-check"
              name="options-base"
              id="option7"
              autocomplete="off"
              onChange={() => formik.setFieldValue("role", "ROLE_MODERATOR")}
              checked={formik.values.role === "ROLE_MODERATOR"}
            ></input>
            <label className="btn me-2" for="option7">
              Moderator
            </label>

            <input
              type="radio"
              className="btn-check"
              name="options-base"
              id="option6"
              autocomplete="off"
              onChange={() => formik.setFieldValue("role", "ROLE_USER")}
              checked={formik.values.role === "ROLE_USER"}
            ></input>
            <label className="btn me-2" for="option6">
              User
            </label>
            <br></br>
            <button type="submit" className="btn btn-dark mt-3">
              Set new role
            </button>
          </form>
        </>
      )}
      <hr className="hr" />
      <h4 className="mt-4">All Moderators</h4>
      <table className="table mb-4">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Username</th>
            <th scope="col">Email</th>
          </tr>
        </thead>
        <tbody>
          {moderators && moderators.map((moderator) => (
              <tr key={moderator.id}>
                <th scope="row">{moderator.id}</th>
                <td>{moderator.username}</td>
                <td>{moderator.email}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
