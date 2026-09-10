// Import React Router components
import {BrowserRouter,Routes,Route,} from "react-router-dom";

// Import application pages
import Login from "./pages/Login";
import RegisterInstitution from "./pages/RegisterInstitution";
import ForgotPassword from "./pages/ForgotPassword";


// ============================================================
// MAIN APPLICATION COMPONENT
// ============================================================

function App() {

  return (

    // BrowserRouter enables URL-based navigation
    <BrowserRouter>

      {/* Routes contains all the pages of our application */}
      <Routes>

        {/* ====================================================
            LOGIN PAGE
            URL:/login
        ==================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ====================================================
            REGISTER INSTITUTION PAGE
            URL:/register-institution
        ==================================================== */}

        <Route
          path="/register-institution"
          element={<RegisterInstitution />}
        />


        {/* ====================================================
            FORGOT PASSWORD PAGE
            URL:/forgot-password
        ==================================================== */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ====================================================
            DEFAULT ROUTE
            redirect them to login.
        ==================================================== */}

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;