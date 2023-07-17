export const users = [
  {
    name: 'Kathyrn Murphy',
    department: 'Design',
    amount: '$1,902.00',
    selected: false,
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=046c29138c1335ef8edee7daf521ba50'
  },
  {
    name: 'Mert Cukuren',
    department: 'Sales',
    amount: '$2,794.00',
    selected: true,
    img: 'https://assets.codepen.io/344846/internal/avatars/users/default.png?fit=crop&format=auto&height=512&version=1582611188&width=512'
  },
  {
    name: 'Albert Flores',
    department: 'Marketing',
    amount: '$0.00',
    selected: false,
    img: 'https://images.unsplash.com/photo-1541647376583-8934aaf3448a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
  },
  {
    name: 'Jane Cooper',
    department: 'Design',
    amount: '$762.00',
    selected: false,
    img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
  },
  {
    name: 'Ronald Richards',
    department: 'Sales',
    amount: '$0.00',
    selected: false,
    img: 'https://images.unsplash.com/photo-1507120878965-54b2d3939100?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=99fbace66d1bfa48c9c6dc8afcac3aab'
  }
];

export const deptColor = new Map([
  ['Design', `bg-blue-100 text-blue-500`],
  ['Sales', `bg-green-100 text-green-600`],
  ['Marketing', `bg-yellow-100 text-yellow-600`]
]);