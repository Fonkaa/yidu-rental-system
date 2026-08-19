import { useEffect, useState } from 'react';
import { login } from './services/authService';

function App() {
  const [result, setResult] = useState('Testing connection...');

  useEffect(() => {
    login({ email: 'test@example.com', password: 'password123' })
      .then((res) => setResult('Connected! Token received: ' + res.data.token.slice(0, 20) + '...'))
      .catch((err) => setResult('Error: ' + (err.response?.data?.error || err.message)));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-purple-600">Backend Connection Test</h1>
        <p className="mt-2 text-gray-600">{result}</p>
      </div>
    </div>
  );
}

export default App;