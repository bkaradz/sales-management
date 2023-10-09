import { v4 as uuidv4 } from 'uuid';

export const activitiesTabs = [
  { id: uuidv4(), name: 'Activities', selected: true },
  { id: uuidv4(), name: 'Transfer', selected: false },
  { id: uuidv4(), name: 'Budgets', selected: false },
  { id: uuidv4(), name: 'Notifications', selected: false },
  { id: uuidv4(), name: 'Cards', selected: false }
];