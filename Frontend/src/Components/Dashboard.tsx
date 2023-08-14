import React from "react";
import "../Styles/Dashboard.scss";

function Dashboard() {
  return (
    <main className="dashboard-container">
      <div className="d-sidebar">
        <div className="sidebar-profile">Jason</div>
        <input placeholder="Search links or folders"></input>
        <div className="sidebar-pins">
          {" "}
          <h1>Pinned</h1>
        </div>
        <div className="sidebar-folders">
          <h1>Folders</h1>
          <button>Create new folder</button>
        </div>
      </div>

      <div className="d-main">
        <div className="main-title">Title</div>

        <div className="main-functions">
          <button>Add Link</button>
          <button>Add Multiple</button>
        </div>

        <div className="main-content">
          <div>GRID NAV</div>
          <div>GRID</div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
