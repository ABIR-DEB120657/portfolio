package com.abir.portfolio.model;
@SuppressWarnings("unused")
public class Skill {

    private Long id;
    private String name;
    private int proficiencyPercentage; // যেমন: 90
    private String category; // যেমন: "Backend", "Frontend", "Database"

    // ডিফল্ট কন্সট্রাক্টর
    public Skill() {
    }

    // প্যারামিটারাইজড কন্সট্রাক্টর
    public Skill(String name, int proficiencyPercentage, String category) {
        this.name = name;
        this.proficiencyPercentage = proficiencyPercentage;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getProficiencyPercentage() {
        return proficiencyPercentage;
    }

    public void setProficiencyPercentage(int proficiencyPercentage) {
        this.proficiencyPercentage = proficiencyPercentage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}