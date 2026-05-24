import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useCreateConsumableMutation,
  useUpdateConsumableMutation
} from 'src/app/services/consumableApiSlice';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';

const ConsumableForm = ({ consumable = null, modalId }) => {
  const isEditMode = !!consumable;
  const { accessToken } = useSelector((state) => state.auth);

  // Mutations
  const [createConsumable, createStatus] = useCreateConsumableMutation();
  const [updateConsumable, updateStatus] = useUpdateConsumableMutation();

  // Status Helpers
  const { isSuccess, isError, error } = isEditMode ? updateStatus : createStatus;

  // Query
  const { data: robots = [] } = useGetAllRobotsQuery();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [robotIds, setRobotIds] = useState([]);

  // Sync state when consumable prop changes (for Edit mode)
  useEffect(() => {
    if (isEditMode && consumable) {
      setTitle(consumable.title || "");
      setDescription(consumable.description || "");
      setPrice(consumable.price || "");
      setRobotIds(consumable.robots?.map((r) => String(r.id)) || []);
    } else {
      resetForm();
    }
  }, [consumable, isEditMode]);

  // Notifications
  useEffect(() => {
    if (isSuccess) {
      toast.success(`Consumable ${isEditMode ? "updated" : "created"} successfully!`);
    } else if (isError) {
      toast.error(`Error: ${error?.data?.message || "Operation failed"}`);
    }
  }, [isSuccess, isError, error, isEditMode]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setRobotIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        const json = { id: consumable.id, title, description, price, robotIds };
        await updateConsumable({ json, accessToken }).unwrap();
      } else {
        const json = { title, description, price, robotIds };
        await createConsumable({ json, accessToken }).unwrap();
        resetForm();
      }
    } catch (err) {
      // Error handled by useEffect notification
    }
  };

  const handleRobotChange = (index, value) => {
    const updated = [...robotIds];
    updated[index] = value;
    setRobotIds(updated);
  };

  const addRobotField = () => setRobotIds([...robotIds, ""]);
  const removeRobotField = () => setRobotIds(robotIds.length > 0 ? robotIds.slice(0, -1) : []);

  return (
    <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h1 className="modal-title fs-5">
                {isEditMode ? "Edit Consumable" : "Create Consumable"}
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="form-inputs">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  {robotIds.map((currentId, index) => (<>
                    <label className="form-label d-flex justify-content-between"
                    key={index}>
                      Robot #{index+1}
                    </label>

                    <select
                      key={index}
                      className="form-control form-control-sm mb-2"
                      value={currentId}
                      onChange={(e) => handleRobotChange(index, e.target.value)}
                    >
                      <option value="" disabled>Select a Robot</option>
                      {robots.map((robot) => (
                        <option key={robot.id} value={String(robot.id)}>
                          {robot.model}
                        </option>
                      ))}
                    </select>
                  </>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-danger me-1" onClick={removeRobotField}><b>-</b></button>
              <button type="button" className="btn btn-success" onClick={addRobotField}><b>+</b></button>
              <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                {isEditMode ? "Edit" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsumableForm;