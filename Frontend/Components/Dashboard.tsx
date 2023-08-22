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
import { BsGrid } from "react-icons/bs";
import { CiGrid2H } from "react-icons/ci";
import { FiMenu } from "react-icons/fi";

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
          <AiOutlineSearch color="#5b4dbe" />
          <input id="search" placeholder="Search links or folders..."></input>
        </div>

        <div className="sidebar-pins">
          <AiOutlinePushpin color="#5b4dbe" />
          <h1>Pinned</h1>
        </div>

        <div className="sidebar-folders">
          <div className="folders-flex">
            <AiOutlineFolder color="#5b4dbe" />
            <h1>Folders</h1>
          </div>

          <button>
            <AiOutlinePlus color="#5b4dbe" size={20} />
            Create new folder
          </button>
        </div>
      </div>

      <div className="d-main">
        <div className="main-title">Recent</div>

        <div className="main-functions">
          <button>
            <AiOutlineLink /> Add Link{" "}
          </button>
          <button>
            <TfiLink />
            Add Multiple
          </button>
        </div>

        <div className="main-content">
          <div className="content-nav">
            <p>Recently Viewed</p>
            <p>Filter</p>
            <BsGrid />
            <CiGrid2H />
            <FiMenu />
          </div>
          <div className="content-grid"></div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
