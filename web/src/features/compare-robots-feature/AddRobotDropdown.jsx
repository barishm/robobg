import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllRobotsQuery, useLazyGetRobotByIdQuery } from 'src/app/services/robotApiSlice';

const AddRobotDropdown = ({ robots, onAddRobot }) => {
  const [model, setModel] = useState('');
  const lang = useSelector((state) => state.language.lang);
  const { data: allModels = [] } = useGetAllRobotsQuery();
  const [triggerAdd] = useLazyGetRobotByIdQuery();

  const handleAdd = async () => {
    const foundItem = allModels.find((item) => item.model === model);

    if (!foundItem) {
      console.warn('Robot model not found');
      return;
    }

    // Prevent duplicate additions
    if (robots.some((r) => r.id === foundItem.id)) {
      console.warn('Robot already added');
      setModel('');
      return;
    }

    try {
      const response = await triggerAdd({ id: foundItem.id }).unwrap();
      if (response) {
        onAddRobot(response);
      }
    } catch (error) {
      console.error('Error adding robot:', error);
    }

    setModel('');
  };

  return (
    <div
      style={{
        display: 'flex',
        maxWidth: '350px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      className="mb-1 mt-5"
    >
      <input
        className="form-control form-control-sm me-2"
        value={model}
        name="Model"
        list="datalistOptions"
        id="Model"
        placeholder={
          lang === 'en'
            ? 'Choose robot from the list'
            : 'Изберете робот от списъка'
        }
        onChange={(e) => setModel(e.target.value)}
      />
      <button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>
        {lang === 'en' ? 'Add' : 'Добави'}
      </button>
      <datalist id="datalistOptions">
        {allModels
          .slice()
          .sort((a, b) => a.model.localeCompare(b.model))
          .map((item) => (
            <option key={item.id} value={item.model} />
          ))}
      </datalist>
    </div>
  );
};

export default AddRobotDropdown;
