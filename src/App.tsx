import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/auth/SignUpPage/SignUpPage";
import SignInPage from "./pages/auth/SignInPage/SignInPage";
import Header from "./components/Header/Header";
import { useAuth } from "./hooks/useAuth";
import StudentDashboard from "./pages/student/StudentDashboard/StudentDashboard";
import QuizTakingPage from "./pages/student/QuizTakingPage/QuizTakingPage";

function App() {
  const { authState } = useAuth();

  if (authState.loading) {
    return <div>Loading...</div>;
  }
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        {authState.isAuthenticated && (
          <>
            <Route path="/student/dashboard" element={(authState.isAuthenticated && <StudentDashboard />)} />
            <Route path="/student/quiz/:id" element={(authState.isAuthenticated && <QuizTakingPage />)} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
