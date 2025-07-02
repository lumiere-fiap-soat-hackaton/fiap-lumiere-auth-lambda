import { faker } from '@faker-js/faker';

export const signUpUser = async (username: string, email: string, password: string) => {
  return {
    message: 'v3 | User successfully created',
    username,
    email,
    userId: faker.string.uuid(),
    password: faker.internet.password({ length: password.length }),
  };
};

export const signInUser = async (username: string, password: string) => {
  return {
    message: 'v3 | User successfully logged in',
    username,
    password: faker.internet.password({ length: password.length }),
    token: faker.internet.jwt(),
  };
};
