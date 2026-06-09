package rest.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import rest.model.Role;
import rest.model.User;
import rest.service.RoleService;
import rest.service.UserService;

import java.util.*;

@RestController
@RequestMapping("/api")
public class RESTController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/current-user")
    public Map<String, Object> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("age", user.getAge());

        // Для обратной совместимости с вашим JS
        List<Map<String, String>> authorities = new ArrayList<>();
        List<Map<String, String>> roles = new ArrayList<>();

        for (Role role : user.getRoles()) {
            Map<String, String> roleMap = new HashMap<>();
            roleMap.put("authority", role.getTitle());
            roleMap.put("title", role.getTitle());
            authorities.add(roleMap);
            roles.add(roleMap);
        }
        response.put("authorities", authorities);
        response.put("roles", roles);

        return response;
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> response = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("age", user.getAge());

            List<Map<String, String>> authorities = new ArrayList<>();
            for (Role role : user.getRoles()) {
                Map<String, String> r = new HashMap<>();
                r.put("authority", role.getTitle());
                authorities.add(r);
            }
            userMap.put("authorities", authorities);

            response.add(userMap);
        }
        return response;
    }

    @PostMapping("/users")
    public void createUser(@RequestParam String username,
                           @RequestParam byte age,
                           @RequestParam String password,
                           @RequestParam(required = false) List<Long> roleIds) {
        User user = new User();
        user.setUsername(username);
        user.setAge(age);
        user.setPassword(passwordEncoder.encode(password));

        Set<Role> roles = new HashSet<>();
        if (roleIds != null) {
            for (Long roleId : roleIds) {
                roleService.findById(roleId).ifPresent(roles::add);
            }
        }
        user.setRoles(roles);
        userService.saveUser(user);
    }

    @PutMapping("/users/{id}")
    @Transactional
    public void updateUser(@PathVariable Long id,
                           @RequestParam String username,
                           @RequestParam Byte age,
                           @RequestParam(required = false) String password,
                           @RequestParam(required = false) List<Long> roleIds) {
        User user = userService.getUserById(id);
        user.setUsername(username);
        user.setAge(age);
        if (password != null && !password.isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        Set<Role> roles = new HashSet<>();
        if (roleIds != null) {
            for (Long roleId : roleIds) {
                roleService.findById(roleId).ifPresent(roles::add);
            }
        }
        user.setRoles(roles);
        userService.saveUser(user);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.removeUserById(id);
    }

    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return roleService.findAll();
    }
}
