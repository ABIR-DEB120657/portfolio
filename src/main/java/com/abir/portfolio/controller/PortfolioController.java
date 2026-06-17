package com.abir.portfolio.controller;

import com.abir.portfolio.data.PortfolioData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PortfolioController {

    @Autowired
    private PortfolioData portfolioData;

    @GetMapping("/")
    public String start() {
        return "start";
    }

    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("name", "Abir");
        model.addAttribute("title", "Java & Spring Boot Developer");
        model.addAttribute("currentPage", "home");
        return "index";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("about", portfolioData.getAboutData());
        model.addAttribute("currentPage", "about");
        return "about";
    }

    @GetMapping("/skills")
    public String skills(Model model) {
        model.addAttribute("currentPage", "skills");
        return "skills";
    }

    @GetMapping("/projects")
    public String projects(Model model) {
        model.addAttribute("projects", portfolioData.getProjects());
        try {
            String projectsJson = new ObjectMapper().writeValueAsString(portfolioData.getProjects());
            model.addAttribute("projectsJson", projectsJson);
        } catch (Exception e) {
            model.addAttribute("projectsJson", "[]");
        }
        model.addAttribute("currentPage", "projects");
        return "projects";
    }

    @GetMapping("/contact")
    public String contact(Model model) {
        model.addAttribute("contact", portfolioData.getContactInfo());
        model.addAttribute("currentPage", "contact");
        return "contact";
    }
}
