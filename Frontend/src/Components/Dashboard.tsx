import React from "react";
import "../Styles/Dashboard.scss";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  AiOutlineSearch,
  AiOutlinePushpin,
  AiOutlineFolder,
  AiOutlinePlus,
  AiOutlineLink,
} from "react-icons/ai";
import { TfiLink } from "react-icons/tfi";

function Dashboard() {
  // SET REMINDERS/NOTIFICATIONS SO USER CAN COME BACK ON RIGHT DAY

  return (
    <main className="dashboard-container">
      <div className="d-sidebar">
        <div className="sidebar-profile">
          <p>Jason</p>
          <RiArrowDropDownLine size={25} />
        </div>

        <div className="sidebar-search">
          <AiOutlineSearch />
          <input id="search" placeholder="Search links or folders..."></input>
        </div>

        <div className="sidebar-pins">
          <AiOutlinePushpin />
          <h1>Pinned</h1>
        </div>

        <div className="sidebar-folders">
          <div className="folders-flex">
            <AiOutlineFolder />
            <h1>Folders</h1>
          </div>

          <button>
            <AiOutlinePlus color="#f77a4a" size={20} />
            Create new folder
          </button>
        </div>
      </div>

      <div className="d-main">
        <div className="main-title">Recent</div>

        <div className="main-functions">
          <button>
            <AiOutlineLink /> Add Link{" "}
            <AiOutlinePlus color="#f77a4a" size={20} />{" "}
          </button>
          <button>
            <TfiLink />
            Add Multiple <AiOutlinePlus color="#f77a4a" size={20} />
          </button>
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
