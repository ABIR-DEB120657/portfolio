package com.abir.portfolio.data;

import com.abir.portfolio.model.AboutData;
import com.abir.portfolio.model.ContactInfo;
import com.abir.portfolio.model.Project;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class PortfolioData {

    private AboutData aboutData;
    private List<Project> projects = new ArrayList<>();
    private ContactInfo contactInfo;

    @SuppressWarnings("CallToPrintStackTrace")
    @PostConstruct
    public void init() {
        ObjectMapper mapper = new ObjectMapper();

        // ── about.json ──
        try {
            ClassPathResource res = new ClassPathResource("data/about.json");
            InputStream in = res.getInputStream();
            aboutData = mapper.readValue(in, AboutData.class);
            System.out.println("✅ about.json successfully loaded!");
        } catch (Exception e) {
            System.err.println("❌ about.json পড়তে সমস্যা: " + e.getMessage());
            e.printStackTrace();
        }

        // ── projects.json ──
        try {
            ClassPathResource res = new ClassPathResource("data/projects.json");
            InputStream in = res.getInputStream();
            projects = mapper.readValue(in, new TypeReference<List<Project>>() {});
            System.out.println("✅ projects.json loaded — " + projects.size() + " projects.");
        } catch (Exception e) {
            System.err.println("❌ projects.json পড়তে সমস্যা: " + e.getMessage());
            e.printStackTrace();
        }

        // ── contact.json ──
        try {
            ClassPathResource res = new ClassPathResource("data/contact.json");
            InputStream in = res.getInputStream();
            contactInfo = mapper.readValue(in, ContactInfo.class);
            System.out.println("✅ contact.json successfully loaded!");
        } catch (Exception e) {
            System.err.println("❌ contact.json পড়তে সমস্যা: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public AboutData    getAboutData()   { return aboutData;    }
    public List<Project> getProjects()   { return projects;     }
    public ContactInfo  getContactInfo() { return contactInfo;  }
}