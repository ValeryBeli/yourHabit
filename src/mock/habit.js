const habits = [
  {
    id: '1',
    title: 'Утренняя зарядка',
    description: 'Делать зарядку каждое утро в течение 15 минут',
    currentStreak: 0, 
    progress: [
      { day: 1, status: 'pending' }, 
      { day: 2, status: 'pending' },
      { day: 3, status: 'pending' },
      { day: 4, status: 'pending' },
      { day: 5, status: 'completed' },
      { day: 6, status: 'pending' },
      { day: 7, status: 'pending' }
    ]
  },
  {
    id: '2',
    title: 'Читать книги',
    description: 'Читать минимум 30 страниц в день',
    currentStreak: 0, 
    progress: [
      { day: 1, status: 'completed' }, 
      { day: 2, status: 'completed' }, 
      { day: 3, status: 'completed' }, 
      { day: 4, status: 'pending' },   
      { day: 5, status: 'pending' },
      { day: 6, status: 'completed' },
      { day: 7, status: 'pending' }
    ]
  },
  {
    id: '3',
    title: 'Пить воду',
    description: 'Выпивать 8 стаканов воды в день',
    currentStreak: 0,
    progress: [
      { day: 1, status: 'completed' }, 
      { day: 2, status: 'completed' }, 
      { day: 3, status: 'pending' },   
      { day: 4, status: 'completed' },
      { day: 5, status: 'pending' },
      { day: 6, status: 'completed' },
      { day: 7, status: 'pending' }
    ]
  },
  {
    id: '4',
    title: 'Медитация',
    description: 'Медитировать 10 минут перед сном',
    currentStreak: 0, 
    progress: [
      { day: 1, status: 'pending' }, 
      { day: 2, status: 'pending' },
      { day: 3, status: 'pending' },
      { day: 4, status: 'pending' },
      { day: 5, status: 'pending' },
      { day: 6, status: 'completed' },
      { day: 7, status: 'pending' }
    ]
  }
];

const stats = {
  today: { completed: 2, total: 4 }, 
  currentStreak: 3, 
  bestStreak: 10    
};

export { habits, stats };
export default habits;