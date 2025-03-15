import './App.css';
import AuthProvider from './contexts/Auth/AuthProvider';
import Router from './routes/Router';

function App() {
    return (
        <div className="min-h-screen bg-white">
            <AuthProvider>
                <Router />
            </AuthProvider>
        </div>
    );
}

export default App;
