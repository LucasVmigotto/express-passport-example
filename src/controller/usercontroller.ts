import { default as User, UserModel } from '../model/users';

export let createUser = (user: UserModel): Promise<boolean> => {
  let newUser = new User(user);
  return new Promise((resolve, reject) => {
    newUser.save((err: Error) => {
    if (err) reject(false)
    resolve(true)
    });
  });
}

export let readUser = (id: number): Promise<UserModel> => {
  return new Promise((resolve, reject) => {
    User.findById(id, (err: Error, user: UserModel) => {
    if (err) reject(null)
      resolve(user)
    });
  });
}

export let updateUser = (user: UserModel): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate({ _id: user.id }, user, { new: true },
      (err: Error, updated: UserModel) => {
        if (err) reject(false)
        resolve(true)
      }
    );
  });
}

export let deleteUser = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    User.remove({ _id: id }, (err: Error) => {
      if (err) reject(false)
        resolve(true)
    });
  });
}
