import { axiosInstant } from '@/apis/axios/request';
import { useEffect, useState } from 'react';

const Post1 = () => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    token && axiosInstant.get('/posts');
  }, []);

  return <h1>Component 1</h1>;
};

const Post2 = () => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    token && axiosInstant.get('/posts?page=2');
  }, []);

  return <h1>Component 2</h1>;
};

function RefreshByInterceptor() {
  const [login, setLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    token && axiosInstant.get('/posts?page=1');
  }, []);

  useEffect(() => {
    setLogin(!!localStorage.getItem('accessToken'));
  }, []);

  const onLogin = async () => {
    const r = await fetch(`${process.env.VITE_APP_API}/auth/login`, {
      method: 'post',
      body: JSON.stringify({
        username: 'adminRefresh2',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((r) => r.json());

    if (r?.accessToken) {
      localStorage.setItem('accessToken', r?.accessToken);
      localStorage.setItem('refreshToken', r?.refreshToken);
      setLogin(true);
    }
  };

  return (
    <div className='App'>
      <Post1 />
      <br />
      <Post2 />
      <br />

      <div>
        {login ? (
          <>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setLogin(false);
              }}
            >
              Logout
            </button>
            <p>Token will expire after 1m. Please check network</p>
          </>
        ) : (
          <button onClick={onLogin}>Login</button>
        )}
      </div>
    </div>
  );
}

export default RefreshByInterceptor;
