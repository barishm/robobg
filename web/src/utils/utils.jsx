// import { useNavigate } from "react-router-dom";

export const cleanFormValues = (values) => {
  return Object.entries(values).reduce((acc, [key, value]) => {
    if (value === "" || value === "N/A" || value === "null") {
      return { ...acc, [key]: null };
    } else if (value === "true") {
      return { ...acc, [key]: true };
    } else if (value === "false") {
      return { ...acc, [key]: false };
    } else if (typeof value === "object" && value !== null) {
      return { ...acc, [key]: cleanNestedValues(value) };
    }
    return { ...acc, [key]: value };
  }, {});
};

export const cleanNestedValues = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === "" || value === "N/A" || value === "null") {
      return { ...acc, [key]: null };
    } else if (value === "true") {
      return { ...acc, [key]: true };
    } else if (value === "false") {
      return { ...acc, [key]: false };
    } else if (typeof value === "object" && value !== null) {
      return { ...acc, [key]: cleanNestedValues(value) };
    }
    return { ...acc, [key]: value };
  }, {});
};

export const getRobotIdsFromUrl = (search) => {
  const params = new URLSearchParams(search);
  const ids = params.get("id");
  return ids ? ids.split(",").map((id) => parseInt(id, 10)) : [];
};

export const addIdToUrl = (search, newId, navigate) => {
  const params = new URLSearchParams(search);
  const ids = getRobotIdsFromUrl(search);

  if (!ids.includes(newId)) {
      ids.push(newId);
  }
  params.set("id", ids.join(","));
  navigate(`/compare?${decodeURIComponent(params.toString())}`);
};

export const removeIdFromUrl = (search, idToRemove, navigate) => {
  const params = new URLSearchParams(search);
  const ids = getRobotIdsFromUrl(search);

  const filteredIds = ids.filter((id) => id !== idToRemove);
  if (filteredIds.length > 0) {
      params.set("id", filteredIds.join(","));
  } else {
      params.delete("id");
  }
  navigate(`/compare?${decodeURIComponent(params.toString())}`);
};

export const compareMultipleRobots = (ids, navigate) => {
  if (!Array.isArray(ids) || ids.length === 0) {
      console.error("Invalid input: Please provide a non-empty array of IDs.");
      return;
  }
  const params = new URLSearchParams();
  params.set("id", ids.join(","));
  navigate(`/compare?${decodeURIComponent(params.toString())}`);
};

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 6 && password.length <= 20;
};

export const validateUsername = (username) => {
  if (!username || typeof username !== "string") return false;
  return username.length >= 5 && username.length <= 15;
};

export const isEmailInvalid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(email);
};