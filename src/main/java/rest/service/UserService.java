package rest.service;


import rest.model.User;

import java.util.List;

public interface UserService {
    void saveUser(User user, String password);

    User getUserById(long id);

    void removeUserById(long id);

    List<User> getAllUsers();
}
