export interface EmailCredentials {
  email: string;
  password: string;
}

export interface UsernameCredentials {
  username: string;
  password: string;
}

// La unión final debe ser un 'type'
export type Credentials = EmailCredentials | UsernameCredentials;