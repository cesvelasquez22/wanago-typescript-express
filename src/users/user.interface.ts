interface User {
    id: string;
    name: string
    email: string;
    password: string | undefined;
    address?: {
      street: string;
      city: string;
      country: string;
    };
  }
   
  export default User;