import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCaretDown } from "react-icons/fa";

const SidebarItem = ({ icon, title, to, children }) => {
  const [open, setOpen] = useState(false);

  const hasChildren = !!children;

  return (
    <li className={`sidebar-item ${hasChildren ? "has-children" : ""} ${open ? "open" : ""}`}>
      {hasChildren ? (
        <div className="sidebar-link" onClick={() => setOpen(!open)}>
          {icon}
          <span>{title}</span>
          <FaCaretDown className={`caret ${open ? "rotated" : ""}`} />
        </div>
      ) : (
        <Link to={to} className="sidebar-link">
          {icon}
          <span>{title}</span>
        </Link>
      )}
      {hasChildren && open && (
        <ul className="submenu">
          {children}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;
