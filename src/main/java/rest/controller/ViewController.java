package rest.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import rest.model.User;

@Controller
public class ViewController {
    @GetMapping({"/admin", "/profile", "/"})
    public String page(Authentication authentication, Model model) {
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                model.addAttribute("user", user);
            }
        }
        return "admin/users";
    }

    // Доступно для USER и ADMIN
    @GetMapping("/user")
    public String userProfile(Authentication authentication, Model model) {
        // Получаем текущего пользователя
        User user = (User) authentication.getPrincipal();
        model.addAttribute("user", user);
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getTitle().equals("ROLE_ADMIN"));
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("currentPage", "profile");
        return "user/profile";
    }
}

