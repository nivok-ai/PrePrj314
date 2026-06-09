package rest.service;


import rest.model.User;

import java.util.List;

public interface UserService {
    void saveUser(User user);

    User getUserById(long id);

    void updateUser(User userUpdated);

    void removeUserById(long id);

    List<User> getAllUsers();
}
