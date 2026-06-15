package com.abir.portfolio.model;

import java.time.LocalDate;

@SuppressWarnings("unused")
public class Certificate {

    private Long id;

    private String title;
    private String issuingOrganization;
    private LocalDate issueDate;
    private String credentialUrl;

    // ডিফল্ট কন্সট্রাক্টর
    public Certificate() {
    }

    public Certificate(String title, String issuingOrganization, LocalDate issueDate, String credentialUrl) {
        this.title = title;
        this.issuingOrganization = issuingOrganization;
        this.issueDate = issueDate;
        this.credentialUrl = credentialUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIssuingOrganization() {
        return issuingOrganization;
    }

    public void setIssuingOrganization(String issuingOrganization) {
        this.issuingOrganization = issuingOrganization;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public String getCredentialUrl() {
        return credentialUrl;
    }

    public void setCredentialUrl(String credentialUrl) {
        this.credentialUrl = credentialUrl;
    }
}