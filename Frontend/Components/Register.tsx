import React from "react";
import "../Styles/Register.scss";
import { Link } from "react-router-dom";

function Register() {
  return (
    <main className="register-container">
      <Link to="/" className="home-ref">
        LinkStorage
      </Link>

      <form className="register-form">
        <h1>Sign Up</h1>

        <div>
          <label>Username *</label>
          <input></input>
        </div>
        <div>
          <label>Email address *</label>
          <input></input>
        </div>

        <div>
          <label>Password *</label>
          <input></input>
        </div>

        <button type="submit">Register</button>
      </form>

      <p>——— or ———</p>

      <button className="google-auth">Continue with Google</button>

      <Link className="login-ref" to="/login">
        Already have an account? Log in
      </Link>
    </main>
  );
}

export default Register;
