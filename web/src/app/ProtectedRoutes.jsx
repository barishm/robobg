import {Outlet,Navigate} from "react-router"
import { useSelector } from 'react-redux';


const ProtectedRoutes = () => {
  const {role} = useSelector((state) => state.auth);

  if (role && role === 'ADMIN' || role && role === 'MODERATOR') {
    return <Outlet />;
  }
  
    return <Navigate to="/login" />;
  };

export default ProtectedRoutes;