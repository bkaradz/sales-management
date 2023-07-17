import { v4 as uuidv4 } from 'uuid';


export const menuTabs = [
  { id: uuidv4(), name: 'Company', selected: false },
  { id: uuidv4(), name: 'Users', selected: true },
  { id: uuidv4(), name: 'Expense Centres', selected: false },
  { id: uuidv4(), name: 'Currency Exchange', selected: false }
];

export const activitiesTabs = [
  { id: uuidv4(), name: 'Activities', selected: true },
  { id: uuidv4(), name: 'Transfer', selected: false },
  { id: uuidv4(), name: 'Budgets', selected: false },
  { id: uuidv4(), name: 'Notifications', selected: false },
  { id: uuidv4(), name: 'Cards', selected: false }
];