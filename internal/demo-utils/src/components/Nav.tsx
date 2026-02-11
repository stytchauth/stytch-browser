import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const style = {
  margin: '0 10px',
  textDecoration: 'none',
  color: 'inherit',
};

const activeStyle = {
  ...style,
  fontWeight: 'bold',
  color: 'blue',
};

interface NavEntry {
  title: string;
  path: string;
  showAlways?: boolean;
}

const NavLinkList = ({ entries }: { entries: NavEntry[] }) => {
  const navStyle = ({ isActive }: { isActive: boolean }) => (isActive ? activeStyle : style);

  return entries.map((entry) => (
    <NavLink key={entry.title} to={entry.path} style={navStyle}>
      {entry.title}
    </NavLink>
  ));
};

export const Nav = ({ manifest }: { manifest: NavEntry[] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const shown = [];
  const menu = [];

  for (const entry of manifest) {
    if (entry.showAlways || entry.path === location.pathname) {
      shown.push(entry);
    } else {
      menu.push(entry);
    }
  }

  return (
    <nav style={{ marginBottom: '20px' }}>
      <NavLinkList entries={shown} />
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        style={{
          marginLeft: '10px',
          padding: '5px 10px',
          cursor: 'pointer',
          border: '1px solid gray',
          borderRadius: '5px',
        }}
      >
        ☰ More
      </button>
      {menuOpen && (
        <div
          style={{
            zIndex: 1,
            position: 'absolute',
            top: '40px',
            left: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '10px',
            borderRadius: '5px',
            background: '#fafffc',
          }}
        >
          <NavLinkList entries={menu} />
        </div>
      )}
    </nav>
  );
};
