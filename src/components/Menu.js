import { useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';

import './Menu.css';

const MainMenu = ({ account }) => {
  const [activeItem, setActiveItem] = useState('youtube');

  const handleItemClick = (e, { name }) => setActiveItem(name);

  return (
    <Menu id='main_menu'>
      <Menu.Item
        name='Youtube App'
        active={activeItem === 'youtube'}
        onClick={handleItemClick}
      />
      <p className='account'>
        <Icon name='user' />
        {account}
      </p>
    </Menu>
  );
};

export default MainMenu;
