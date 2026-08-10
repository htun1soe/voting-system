export type CategoryType = 'boys' | 'girls';

export type Candidate = {
  id: string;
  name: string;
  number: string;
  image: string;
  gender: CategoryType;
};

export const BOYS: Candidate[] = [
  { id: 'b1', name: 'Ethan Rivera', number: '01', image: '/candidates/boy-01.jpg', gender: 'boys' },
  { id: 'b2', name: 'Marcus Chen', number: '02', image: '/candidates/boy-02.jpg', gender: 'boys' },
  { id: 'b3', name: 'Jordan Blake', number: '03', image: '/candidates/boy-03.jpg', gender: 'boys' },
  { id: 'b4', name: 'Liam Okonkwo', number: '04', image: '/candidates/boy-04.jpg', gender: 'boys' },
  { id: 'b5', name: 'Noah Patel', number: '05', image: '/candidates/boy-05.jpg', gender: 'boys' },
  { id: 'b6', name: 'Tyler Kim', number: '06', image: '/candidates/boy-06.jpg', gender: 'boys' },
];

export const GIRLS: Candidate[] = [
  { id: 'g1', name: 'Sofia Mendez', number: '01', image: '/candidates/girl-01.jpg', gender: 'girls' },
  { id: 'g2', name: 'Aisha Williams', number: '02', image: '/candidates/girl-02.jpg', gender: 'girls' },
  { id: 'g3', name: 'Chloe Park', number: '03', image: '/candidates/girl-03.jpg', gender: 'girls' },
  { id: 'g4', name: 'Isabella Torres', number: '04', image: '/candidates/girl-04.jpg', gender: 'girls' },
  { id: 'g5', name: 'Maya Johnson', number: '05', image: '/candidates/girl-05.jpg', gender: 'girls' },
  { id: 'g6', name: 'Zara Ahmed', number: '06', image: '/candidates/girl-06.jpg', gender: 'girls' },
];

export const CATEGORIES = {
  boys: [
    { id: 'king', title: 'King', icon: 'Crown' },
    { id: 'smartest_boy', title: 'Smart', icon: 'Brain' },
    { id: 'mr_popular', title: 'Mr. Popular', icon: 'Star' }
  ],
  girls: [
    { id: 'queen', title: 'Queen', icon: 'Crown' },
    { id: 'most_stylish', title: 'Style', icon: 'Sparkles' },
    { id: 'ms_popular', title: 'Ms. Popular', icon: 'Heart' }
  ]
};
