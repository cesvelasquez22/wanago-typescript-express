interface User {
    _id: string;
    name: string
    email: string;
    password: string | undefined;
    address?: {
      street: string,
      city: string,
    };
  }
   
  export default User;