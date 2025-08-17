import React, { createContext, useState, useContext } from 'react';

import { ReactNode } from 'react';

export interface MenuItem {
    // Define properties of a menu item, for example:
    id: string;
    name: string;
    price: string; // Changed to string to match Menu.tsx format
    // category: string;
    image: string;
    unavailable?: boolean;
    // Add more properties as needed
}

interface MenuContextType {
    menuItems: MenuItem[];
    addMenuItem: (item: MenuItem) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems((prevItems) => [...prevItems, item]);
  };

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
