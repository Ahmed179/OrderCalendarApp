declare module '*.json' {
  const value: {
    orders: Array<{
      id: string;
      name: string;
      description: string;
      car: 'Audi' | 'BMW' | 'Mercedes' | 'VW';
      date: string;
    }>;
  };
  export default value;
} 