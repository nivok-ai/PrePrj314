package rest.service;

import rest.model.Role;
import org.springframework.stereotype.Service;
import rest.repository.RoleRepository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {
    private RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Optional<Role> findById(long roleId) {
        return roleRepository.findById(roleId);
    }


    public List<Role> findAll() {
        return roleRepository.findAll();
    }
}