import { useNavigate, useLocation } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") {
    return null;
  }

  return (
    <button onClick={() => navigate("/")} class="back-button">
      Back
    </button>
  );
};

export default BackButton;
