import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/Axios';
import { UserDataContext } from '../context/UserContext';

function UserAuth({ children }) {
  const navigate = useNavigate();
  const { user, setUser , islogin } = useContext(UserDataContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }
  
   


    const fetchProfile = async () => {
      axios.get("/users/profile").then((res) => {
        console.log("res", res.data);
        setUser(res.data.user);
      }).catch((e) => {
        console.log("error", e);
  
      })
    };

	  if (!islogin) {
		  console.log("fetching profile");
      if (!user) {
      fetchProfile();
    }
	  }
	  setLoading(false)
  }, [navigate, setUser]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return <>{children}</>;
}

export default UserAuth;
