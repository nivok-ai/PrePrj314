package rest.service;


import rest.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    Optional<Role> findById(long roleId);
    List<Role> findAll();
}
