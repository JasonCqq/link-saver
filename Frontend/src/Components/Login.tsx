import React from "react";
import "../Styles/Register.scss";
import { Link } from "react-router-dom";

function Login() {
  return (
    <main className="register-container">
      <Link to="/" className="home-ref">
        LinkStorage
      </Link>

      <form className="register-form">
        <h1>Log in</h1>

        <div>
          <label>Username *</label>
          <input></input>
        </div>

        <div>
          <label>Password *</label>
          <input></input>
        </div>

        <button type="submit">Login</button>
      </form>

      <p>——— or ———</p>

      <button className="google-auth">Continue with Google</button>

      <Link className="login-ref" to="/register">
        Dont have an account? Register
      </Link>
    </main>
  );
}

export default Login;
