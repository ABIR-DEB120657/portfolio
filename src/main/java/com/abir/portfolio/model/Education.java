package com.abir.portfolio.model;

import java.util.List;
@SuppressWarnings("unused")
public class Education {

    private String degree;
    private String institution;
    private String statusBadge;   // "Currently Running", "HSC", "SSC"
    private String passingYear;
    private String result;
    private String description;
    private List<String> tags;

    // Default constructor (Jackson এর জন্য দরকার)
    public Education() {}

    // Getters and Setters
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getStatusBadge() { return statusBadge; }
    public void setStatusBadge(String statusBadge) { this.statusBadge = statusBadge; }

    public String getPassingYear() { return passingYear; }
    public void setPassingYear(String passingYear) { this.passingYear = passingYear; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}